# Bookineo

Application web responsive de location de livres entre particuliers. Développée avec React/TypeScript pour le frontend et Node.js/Express pour le backend, utilisant PostgreSQL comme base de données.

Lien pour tester le site : **[https://bookineo.altelis.com](https://bookineo.altelis.com)**

## Architecture

- **Frontend**: React 19 + TypeScript + Vite + TailwindCSS + Shadcn/ui
- **Backend**: Node.js + Express + TypeScript
- **Base de données**: PostgreSQL
- **IA**: LM Studio avec modèle Qwen2.5-Coder-7B-Instruct pour le chatbot

## Fonctionnalités

### Authentification

- Connexion et création de compte sécurisés
- Gestion des sessions utilisateur
- Validation des données côté client et serveur

### Gestion des livres

- Catalogue avec recherche par titre, auteur et ISBN
- Filtrage par catégorie, statut et prix
- Statuts visuels (disponible: fond vert, loué: fond rouge)
- Export CSV du catalogue
- Vue tableau et cartes

### Location et restitution

- Système de panier de location
- Sélection de dates et calcul automatique des prix
- Page de restitution avec commentaires
- Historique complet des locations

### Messagerie

- Système de messages entre utilisateurs
- Notifications en temps réel
- Contact direct avec les propriétaires

### Profil utilisateur

- Gestion des informations personnelles
- Préférences de notifications
- Suppression de compte

### Chatbot IA

- Assistant conversationnel intégré
- Réponses aux questions fréquentes
- Interface flottante accessible partout

## Installation

### Prérequis

- Node.js 18+
- PostgreSQL 14+
- LM Studio

### 1. Clone du projet

```bash
git clone https://github.com/enzotng/bookineo
cd bookineo
```

### 2. Configuration de la base de données

Créer une base de données PostgreSQL et exécuter le script SQL fourni.

### 3. Configuration du backend

```bash
cd bookineo-backend
npm install
```

Créer un fichier `.env` dans `bookineo-backend/`:

```env
PORT=5000
NODE_ENV=development

DB_HOST=localhost
DB_PORT=5432
DB_NAME=bookineo_bd
DB_USER=your_username
DB_PASSWORD=your_password

DATABASE_URL=postgresql://your_username:your_password@localhost/bookineo_bd

JWT_SECRET=your_jwt_secret_key_here

RESEND_API_KEY=your_resend_api_key
EMAIL_FROM=noreply@yourdomain.com
FRONTEND_URL=http://localhost:5173
LM_STUDIO_URL=http://localhost:1234/v1
```

### 4. Configuration du frontend

```bash
cd bookineo-frontend
npm install
```

Créer un fichier `.env` dans `bookineo-frontend/`:

```env
VITE_API_BASE_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
NODE_ENV=development
```

### 5. Configuration de LM Studio

1. Télécharger et installer LM Studio
2. Télécharger le modèle Qwen2.5-Coder-7B-Instruct depuis l'interface LM Studio
3. Démarrer le serveur local sur le port 1234
4. Charger le modèle Qwen2.5-Coder-7B-Instruct

## Démarrage

### Backend

```bash
cd bookineo-backend
npm run dev
```

Le serveur démarre sur `http://localhost:5000`

### Frontend

```bash
cd bookineo-frontend
npm run dev
```

L'application démarre sur `http://localhost:5173`

## Scripts disponibles

### Backend

```bash
npm run dev
npm run build
npm start
```

### Frontend

```bash
npm run dev
npm run build
npm run preview
npm run lint
```

## Structure du projet

```
bookineo/
├── bookineo-backend/
│   ├── src/
│   │   ├── controllers/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── services/
│   │   ├── types/
│   │   └── middleware/
│   └── package.json
├── bookineo-frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── hooks/
│   │   ├── contexts/
│   │   ├── api/
│   │   └── types/
│   └── package.json
└── README.md
```

## Technologies utilisées

### Frontend

- React 19 avec TypeScript
- Vite pour le build et le développement
- TailwindCSS pour le styling
- Shadcn/ui pour les composants
- TanStack React Table pour les tableaux
- React Router pour la navigation
- React Hook Form pour les formulaires
- Zod pour la validation
- Socket.io-client pour le temps réel

### Backend

- Node.js avec Express et TypeScript
- PostgreSQL avec pg
- JWT pour l'authentification
- Socket.io pour le temps réel
- Resend pour les emails
- OpenAPI pour la documentation
