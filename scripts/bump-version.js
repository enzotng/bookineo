#!/usr/bin/env node

/**
 * Bump version dans un package.json précis (--pkg) selon --type (MAJOR|MINOR|PATCH).
 * Usage:
 *   node scripts/bump-version.js --pkg path/to/package.json --type MINOR
 */

const fs = require("fs");
const path = require("path");

function error(msg) {
    console.error(`❌ ${msg}`);
    process.exit(1);
}

function parseArgs() {
    const args = process.argv.slice(2);
    const out = {};
    for (let i = 0; i < args.length; i++) {
        const a = args[i];
        if (a === "--pkg") out.pkg = args[++i];
        else if (a === "--type") out.type = args[++i];
        else if (a === "-h" || a === "--help") out.help = true;
        else if (a.startsWith("--")) error(`Option inconnue: ${a}`);
    }
    return out;
}

function readJson(filePath) {
    try {
        const content = fs.readFileSync(filePath, "utf8");
        return JSON.parse(content);
    } catch (e) {
        error(`Impossible de lire/parse "${filePath}": ${e.message}`);
    }
}

function writeJson(filePath, data, indent = 2) {
    try {
        fs.writeFileSync(filePath, JSON.stringify(data, null, indent) + "\n", "utf8");
    } catch (e) {
        error(`Impossible d’écrire dans "${filePath}": ${e.message}`);
    }
}

function bump(version, type) {
    if (typeof version !== "string" || !/^\d+\.\d+\.\d+$/.test(version.trim())) {
        error(`Version invalide: "${version}". Format attendu: x.y.z`);
    }
    const [major, minor, patch] = version.split(".").map(Number);
    const t = String(type || "").toUpperCase();
    switch (t) {
        case "MAJOR":
            return `${major + 1}.0.0`;
        case "MINOR":
            return `${major}.${minor + 1}.0`;
        case "PATCH":
            return `${major}.${minor}.${patch + 1}`;
        default:
            error(`Type de version invalide: "${type}" (MAJOR|MINOR|PATCH)`);
    }
}

(function main() {
    const { pkg, type, help } = parseArgs();
    if (help) {
        console.log("Usage: bump-version.js --pkg <path> --type <MAJOR|MINOR|PATCH>");
        process.exit(0);
    }
    if (!pkg) error("Argument requis: --pkg path/to/package.json");
    if (!type) error("Argument requis: --type MAJOR|MINOR|PATCH");

    const abs = path.resolve(pkg);
    if (!fs.existsSync(abs)) error(`Fichier introuvable: ${abs}`);

    const data = readJson(abs);
    if (!data || typeof data !== "object") error("package.json invalide");
    if (!data.version) error('Champ "version" manquant');

    const current = String(data.version).trim();
    const next = bump(current, type);

    // backup léger
    try {
        fs.copyFileSync(abs, `${abs}.bak`);
    } catch (_) {}

    data.version = next;
    writeJson(abs, data, 2);

    console.log(`✅ Version mise à jour: ${current} → ${next}`);
    console.log(`📦 Fichier: ${abs}`);
})();
