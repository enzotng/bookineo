#!/usr/bin/env bash
set -euo pipefail

# =========================
# Configuration
# =========================
FRONTEND_DIR="bookineo-frontend"
BACKEND_DIR="bookineo-backend"

DEFAULT_TAG="false"  # "true" pour activer par défaut

# =========================
# Utilities
# =========================
print_help() {
  cat <<'EOF'
Usage:
  scripts/commit.sh [options]

Options:
  --scope <frontend|backend>     Scope (répertoire) ciblé.
  --type <MAJOR|MINOR|PATCH|NONE>
                                 Type de version. "NONE" pour ne pas bumper.
  --desc "<message>"             Description libre du commit.
  --tag                          Créer un tag <scope>@<version> quand on bump.
  --no-tag                       N'ajoute pas de tag (prioritaire sur --tag).
  --yes                          Ne pas demander de confirmation.
  -h, --help                     Affiche cette aide.
EOF
}

resolve_node() {
  if command -v node >/dev/null 2>&1;   then command -v node;   return 0; fi
  if command -v nodejs >/dev/null 2>&1; then command -v nodejs; return 0; fi

  if [ -s "$HOME/.nvm/nvm.sh" ]; then
    # shellcheck disable=SC1090
    . "$HOME/.nvm/nvm.sh"
    nvm use --silent >/dev/null 2>&1 || true
    if command -v node >/dev/null 2>&1;   then command -v node;   return 0; fi
    if command -v nodejs >/dev/null 2>&1; then command -v nodejs; return 0; fi
  fi
  return 1
}

die() { echo "❌ $*" >&2; exit 1; }

git_root() {
  git rev-parse --show-toplevel 2>/dev/null || die "Ce dossier n'est pas un dépôt git."
}

# =========================
# Parse CLI
# =========================
SCOPE=""
TYPE=""
DESC=""
ASK_CONFIRM="true"
MAKE_TAG="$DEFAULT_TAG"

while [[ $# -gt 0 ]]; do
  case "$1" in
    --scope) SCOPE="${2-}"; shift 2;;
    --type)  TYPE="${2-}"; shift 2;;
    --desc)  DESC="${2-}"; shift 2;;
    --tag)   MAKE_TAG="true"; shift;;
    --no-tag)MAKE_TAG="false"; shift;;
    --yes)   ASK_CONFIRM="false"; shift;;
    -h|--help) print_help; exit 0;;
    *) echo "Option inconnue: $1"; print_help; exit 1;;
  esac
done

# =========================
# Mode interactif si manquant
# =========================
if [[ -z "$SCOPE" ]]; then
  PS3="Sélectionnez le scope (1-2): "
  echo "Scope ?"
  select s in "frontend" "backend"; do
    case "$s" in
      frontend|backend) SCOPE="$s"; break;;
      *) echo "Choix invalide.";;
    esac
  done
fi

if [[ -z "$TYPE" ]]; then
  PS3="Sélectionnez le type (1-4): "
  echo "Type de version ?"
  select t in "MAJOR" "MINOR" "PATCH" "NONE"; do
    case "$t" in
      MAJOR|MINOR|PATCH|NONE) TYPE="$t"; break;;
      *) echo "Choix invalide.";;
    esac
  done
fi

if [[ -z "$DESC" ]]; then
  read -r -p "Description: " DESC
fi

# =========================
# Déduire le dossier/chemin
# =========================
case "$SCOPE" in
  frontend) PKG_DIR="$FRONTEND_DIR"; HUMAN_SCOPE="frontend";;
  backend)  PKG_DIR="$BACKEND_DIR";  HUMAN_SCOPE="backend";;
  *) die "Scope invalide: $SCOPE (attendu: frontend|backend)";;
esac

PKG_JSON="$PKG_DIR/package.json"
[ -f "$PKG_JSON" ] || die "Fichier introuvable: $PKG_JSON"

# =========================
# Bump version si demandé
# =========================
NEW_VERSION=""
if [[ "$TYPE" != "NONE" ]]; then
  if ! NODE_BIN="$(resolve_node)"; then
    die "Node introuvable. Installe Node (nvm recommandé) ou ajoute-le au PATH."
  fi

  SCRIPT_DIR="$(cd -- "$(dirname "${BASH_SOURCE[0]}")" &>/dev/null && pwd)"
  BUMPER="$SCRIPT_DIR/bump-version.js"
  [ -f "$BUMPER" ] || die "Script non trouvé: $BUMPER"

  "$NODE_BIN" "$BUMPER" --pkg "$PKG_JSON" --type "$TYPE" || die "Erreur lors du bump version."
  NEW_VERSION="$("$NODE_BIN" -e "console.log(JSON.parse(require('fs').readFileSync(process.argv[1],'utf8')).version)" "$PKG_JSON")"
fi

# =========================
# Composer le message
# =========================
COMMIT_MSG="[${TYPE}] ${HUMAN_SCOPE}: ${DESC}"
if [[ -n "$NEW_VERSION" ]]; then
  COMMIT_MSG="${COMMIT_MSG} (v${NEW_VERSION})"
fi

# =========================
# Afficher le récap + confirmer
# =========================
echo
echo "Scope        : $HUMAN_SCOPE ($PKG_DIR)"
echo "Type         : $TYPE"
echo "Description  : $DESC"
if [[ -n "$NEW_VERSION" ]]; then echo "Nouvelle ver.: $NEW_VERSION"; fi
echo "Tag          : $MAKE_TAG"
echo "Message      : $COMMIT_MSG"
echo

if [[ "$ASK_CONFIRM" == "true" ]]; then
  read -r -p "Confirmer le commit ? (y/N): " CONFIRM
  [[ "${CONFIRM:-}" =~ ^[Yy]$ ]] || { echo "Annulé."; exit 1; }
fi

# =========================
# Stage + commit (+ tag)
# =========================
git add -A "$PKG_DIR"

if git diff --cached --quiet; then
  die "Aucun changement à committer dans $PKG_DIR."
fi

git commit -m "$COMMIT_MSG"

if [[ "$MAKE_TAG" == "true" && -n "$NEW_VERSION" ]]; then
  TAG_NAME="${HUMAN_SCOPE}@${NEW_VERSION}"
  git tag -a "$TAG_NAME" -m "$COMMIT_MSG"
  echo "🏷️  Tag créé: $TAG_NAME"
fi

echo "✅ Commit effectué."
