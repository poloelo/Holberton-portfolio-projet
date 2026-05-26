# Lexora — ERP Portfolio Project

> **Projet de portfolio Holberton School** — Application ERP (Enterprise Resource Planning) full-stack pour la gestion d'une petite structure (tâches, clients, factures, calendrier, documents, IA).

---

## Table des matières

- [Aperçu](#aperçu)
- [Fonctionnalités](#fonctionnalités)
- [Stack technique](#stack-technique)
- [Architecture](#architecture)
- [Démarrage rapide](#démarrage-rapide)
  - [Avec Docker (recommandé)](#avec-docker-recommandé)
  - [En local (développement)](#en-local-développement)
- [Variables d'environnement](#variables-denvironnement)
- [Routes API](#routes-api)
- [Structure du projet](#structure-du-projet)
- [Équipe](#équipe)

---

## Aperçu

Lexora est une application web full-stack qui centralise les outils essentiels d'une équipe :

- **Gestion de tâches** projets et notes rapides
- **CRM léger** — contacts clients + facturation en euros
- **Calendrier interactif** avec codes couleur par type d'événement
- **Coffre-fort documentaire** — dossiers hiérarchiques, upload par glisser-déposer
- **Assistant IA** — chat avec un LLM local via Ollama
- **Espace équipe** (admin) — répertoire employés, planning, automatisations

![Dashboard Lexora](https://via.placeholder.com/900x450?text=Dashboard+Lexora)

---

## Fonctionnalités

| Module | Description |
|--------|-------------|
| 📋 **Tâches** | Tâches projet (statut, assignée) + notes rapides avec priorité |
| 👥 **Clients & Factures** | Base contacts + facturation avec statuts (en attente / payée / annulée) |
| 📅 **Calendrier** | Vue mois/semaine/jour, création d'événements par clic, intégration du planning |
| 📁 **Documents** | Arborescence de dossiers, upload drag-and-drop, téléchargement, 50 MB max |
| 🤖 **Assistant IA** | Chat temps réel avec un LLM local (Ollama / llama3.2) |
| ⚙️ **Équipe (Admin)** | Gestion des employés, planning des horaires, règles d'automatisation |
| 📊 **Dashboard** | Vue d'ensemble avec compteurs animés (tâches, factures, CA total) |

---

## Stack technique

### Backend
| Technologie | Rôle |
|------------|------|
| **Node.js 18** + **Express 4** | Serveur REST API |
| **better-sqlite3** | Base de données SQLite synchrone, embarquée |
| **Multer** | Gestion des uploads de fichiers |
| **dotenv** | Configuration par variables d'environnement |
| **Ollama** (externe) | LLM local (modèle `llama3.2`) |

### Frontend
| Technologie | Rôle |
|------------|------|
| **React 18** + **Vite 5** | Interface SPA avec HMR |
| **React Router 6** | Navigation côté client |
| **react-big-calendar** | Composant calendrier interactif |
| **date-fns** (locale `fr`) | Manipulation et formatage des dates |
| **CSS vanilla** | Styling complet (1100+ lignes, aucune dépendance externe) |

### Infrastructure
| Technologie | Rôle |
|------------|------|
| **Docker** + **Docker Compose** | Conteneurisation (backend + frontend) |
| **Nginx (Alpine)** | Reverse proxy, serveur de fichiers statiques |
| **Volume Docker** | Persistance de la base SQLite et des fichiers uploadés |

---

## Architecture

```
Navigateur
    │
    │  HTTP :80
    ▼
┌─────────────┐
│   Nginx     │  ← Sert les fichiers statiques React (SPA)
│  (Frontend) │  ← Proxy /api/* → backend:3000
└──────┬──────┘
       │ HTTP interne
       ▼
┌─────────────┐
│   Express   │  ← REST API (10 modules de routes)
│  (Backend)  │
│   Port 3000 │
└──────┬──────┘
       │
   ┌───┴───┐
   │SQLite │  ← Fichier lexora.db (volume Docker persisté)
   └───────┘
       │
  (optionnel)
       │
┌─────────────┐
│   Ollama    │  ← LLM local (llama3.2) — sur le host
│ Port 11434  │    (host.docker.internal depuis Docker)
└─────────────┘
```

### Flux de données

1. Le **frontend React** (SPA) tourne dans le navigateur après avoir été servi par Nginx
2. Les appels API (`/api/*`) sont proxifiés par Nginx vers le **backend Express** (port 3000)
3. Le backend lit et écrit dans **SQLite** via `better-sqlite3` (synchrone, pas de promesses)
4. Les fichiers uploadés sont stockés physiquement dans `/app/uploads/` (volume Docker)
5. L'assistant IA appelle **Ollama** en HTTP sur le host machine

---

## Démarrage rapide

### Avec Docker (recommandé)

**Prérequis :** Docker et Docker Compose installés.

```bash
# 1. Cloner le dépôt
git clone https://github.com/<votre-org>/Holberton-portfolio-projet.git
cd Holberton-portfolio-projet

# 2. Configurer les variables d'environnement
cp .env.example lexora/.env
# Éditez lexora/.env selon votre configuration

# 3. Lancer l'application
docker compose up --build

# L'application est disponible sur http://localhost
```

> **Assistant IA :** Pour utiliser l'assistant, installez [Ollama](https://ollama.ai) sur votre machine et lancez :
> ```bash
> ollama pull llama3.2
> ollama serve
> ```

Pour arrêter :
```bash
docker compose down
# Pour supprimer aussi les volumes (ATTENTION : efface toutes les données) :
docker compose down -v
```

---

### En local (développement)

**Prérequis :** Node.js 18+, npm.

```bash
# ── Backend ──────────────────────────────────────
cd lexora/backend
cp ../../.env.example ../.env          # ou créez lexora/.env manuellement
npm install
npm run dev      # démarre avec node --watch (rechargement auto)

# ── Frontend (dans un autre terminal) ────────────
cd lexora/frontend
npm install
npm run dev      # Vite sur http://localhost:5173 avec proxy → backend:3000
```

Le proxy Vite (`vite.config.js`) redirige automatiquement `/api/*` vers `http://localhost:3000`.

---

## Variables d'environnement

Créez un fichier `lexora/.env` basé sur `.env.example` :

| Variable | Défaut | Description |
|----------|--------|-------------|
| `PORT` | `3000` | Port du serveur Express |
| `DB_PATH` | `./lexora.db` | Chemin vers le fichier SQLite |
| `OLLAMA_URL` | `http://localhost:11434` | URL du serveur Ollama |
| `ADMIN_KEY` | *(obligatoire)* | Clé secrète pour les routes admin |
| `OLLAMA_MODEL` | `llama3.2` | Modèle Ollama utilisé par l'assistant |

> ⚠️ Ne commitez jamais votre `.env` ! Il est dans `.gitignore`.

---

## Routes API

### Santé
```
GET  /api/health            → { status: 'ok', timestamp }
```

### Tâches projet
```
GET    /api/taches          → Liste toutes les tâches (tri: créé récent en premier)
POST   /api/taches          → Crée une tâche  { titre*, description, statut, assignee }
PUT    /api/taches/:id      → Modifie une tâche
DELETE /api/taches/:id      → Supprime une tâche
```

### Notes rapides (Todos)
```
GET    /api/todos           → Liste tous les todos
POST   /api/todos           → Crée un todo  { titre*, description, date, priorite, statut }
PUT    /api/todos/:id       → Modifie un todo
DELETE /api/todos/:id       → Supprime un todo
```

### Clients
```
GET    /api/clients         → Liste tous les clients
GET    /api/clients/:id     → Récupère un client
POST   /api/clients         → Crée un client  { email*, nom*, ... }
PUT    /api/clients/:id     → Modifie un client
DELETE /api/clients/:id     → Supprime un client
```

### Factures
```
GET    /api/factures        → Liste toutes les factures
POST   /api/factures        → Crée une facture  { client*, montant*, statut, ... }
PUT    /api/factures/:id    → Modifie une facture
DELETE /api/factures/:id    → Supprime une facture
```

### Événements (Calendrier)
```
GET    /api/evenements      → Liste tous les événements (tri: date_debut ASC)
GET    /api/evenements/:id  → Récupère un événement
POST   /api/evenements      → Crée un événement  { titre*, date_debut*, ... }
PUT    /api/evenements/:id  → Modifie un événement (mise à jour partielle)
DELETE /api/evenements/:id  → Supprime un événement
```

### Planning
```
GET    /api/planning        → Liste toutes les entrées de planning
POST   /api/planning        → Crée une entrée  { employe*, date*, heure_debut*, heure_fin* }
PUT    /api/planning/:id    → Modifie une entrée
DELETE /api/planning/:id    → Supprime une entrée
```

### Documents (Coffre-fort)
```
GET    /api/documents                   → Liste les documents (filtre ?dossier_id=)
POST   /api/documents/upload            → Upload un fichier (multipart/form-data)
GET    /api/documents/:id/download      → Télécharge un fichier
DELETE /api/documents/:id               → Supprime un document

GET    /api/documents/dossiers          → Liste tous les dossiers
POST   /api/documents/dossiers          → Crée un dossier  { nom*, description, parent_id }
DELETE /api/documents/dossiers/:id      → Supprime un dossier et son contenu
```

### Routes Admin (header requis : `x-admin-key: <ADMIN_KEY>`)
```
GET    /api/employes        → Liste tous les employés
GET    /api/employes/:id    → Récupère un employé
POST   /api/employes        → Crée un employé  { nom*, email*, ... }
PUT    /api/employes/:id    → Modifie un employé
DELETE /api/employes/:id    → Supprime un employé

GET    /api/automations     → Liste toutes les automatisations
POST   /api/automations     → Crée une automatisation  { nom*, action* }
PUT    /api/automations/:id → Modifie une automatisation
DELETE /api/automations/:id → Supprime une automatisation
```

### Assistant IA
```
POST /api/assistant         → Envoie un prompt  { prompt* } → { response }
```

---

## Structure du projet

```
Holberton-portfolio-projet/
├── .env.example                  # Exemple de configuration (à copier en lexora/.env)
├── README.md                     # Ce fichier
├── docker-compose.yml            # Orchestration Docker (backend + frontend)
├── Dockerfile.backend            # Image Node.js pour le backend
├── Dockerfile.frontend           # Image multi-stage Vite + Nginx
├── nginx.conf                    # Config Nginx (reverse proxy + SPA routing)
├── .dockerignore
└── lexora/
    ├── .gitignore
    ├── package.json              # Dépendances partagées (racine workspace)
    ├── backend/
    │   ├── index.js              # Point d'entrée Express — déclare toutes les routes
    │   ├── package.json          # Dépendances backend
    │   ├── models/
    │   │   └── db.js             # Initialisation SQLite + schéma (10 tables)
    │   ├── routes/               # Un fichier = un domaine métier
    │   │   ├── taches.js         # CRUD tâches projet
    │   │   ├── todos.js          # CRUD notes rapides
    │   │   ├── factures.js       # CRUD factures
    │   │   ├── clients.js        # CRUD clients
    │   │   ├── evenements.js     # CRUD événements calendrier
    │   │   ├── planning.js       # CRUD planning employés
    │   │   ├── employes.js       # CRUD employés (admin)
    │   │   ├── automations.js    # CRUD automatisations (admin)
    │   │   ├── documents.js      # Dossiers + upload/download fichiers
    │   │   └── assistant.js      # Proxy vers Ollama
    │   └── services/
    │       └── ollamaService.js  # Client HTTP Ollama (LLM)
    └── frontend/
        ├── index.html
        ├── vite.config.js        # Build Vite + proxy dev
        ├── package.json          # Dépendances frontend
        └── src/
            ├── main.jsx          # ReactDOM.createRoot + BrowserRouter
            ├── App.jsx           # Layout sidebar + React Router
            ├── index.css         # CSS complet (1100+ lignes)
            ├── contexts/
            │   └── ToastContext.jsx  # Notifications toast globales
            ├── components/
            │   └── Tabs.jsx      # Composant onglets réutilisable
            └── pages/
                ├── Dashboard.jsx
                ├── Taches.jsx
                ├── ClientsFactures.jsx
                ├── Calendrier.jsx
                ├── Coffre_fort.jsx
                ├── Assistant.jsx
                └── Equipe.jsx
```

---

## Base de données

Lexora utilise **SQLite** (via `better-sqlite3`). La base est un seul fichier `.db` — simple à sauvegarder, pas de serveur de base de données nécessaire.

### Tables principales

| Table | Description |
|-------|-------------|
| `taches` | Tâches projet : titre, description, statut, assignee |
| `todos` | Notes rapides : titre, priorité, statut |
| `factures` | Factures : client, montant, statut, dates |
| `clients` | Contacts : particuliers et entreprises |
| `evenements` | Événements calendrier avec type et couleur |
| `planning` | Horaires employés (date + heures) |
| `employes` | Répertoire de l'équipe |
| `automations` | Règles d'automatisation |
| `dossiers` | Répertoires du coffre-fort (arborescence via parent_id) |
| `documents` | Métadonnées des fichiers uploadés |

---

## Équipe

Projet réalisé dans le cadre du **programme Holberton School**.

| Rôle | Contribution |
|------|-------------|
| **Développeur Full-Stack** | Backend Express/SQLite, Routes API, Docker |
| **Développeur Full-Stack** | Frontend React, UI/UX, Composants |

---

## Licence

Ce projet est un projet pédagogique — libre d'utilisation dans un cadre non commercial.
