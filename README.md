# Lexora — Application web de gestion d'entreprise

> **Rapport de stage · Étape 1 — Documentation du projet**  
> Paul Gioria & Fatou Ndeye · Holberton School · Avril 2026

---

## Table des matières

1. [Présentation du projet](#présentation-du-projet)
2. [Formation de l'équipe](#formation-de-léquipe)
3. [Brainstorming des idées](#brainstorming-des-idées)
4. [MVP sélectionné](#mvp-sélectionné)
5. [Stack technique](#stack-technique)
6. [Structure du projet](#structure-du-projet)
7. [Lancer le projet](#lancer-le-projet)

---

## Présentation du projet

**Lexora** est une application web de gestion d'entreprise simplifiée (ERP léger), intégrant une intelligence artificielle locale via **Ollama**. Toutes les données restent sur le réseau interne de l'entreprise — aucun échange avec Internet — garantissant une conformité totale au **RGPD**.

L'IA peut analyser des documents sensibles (factures, contrats, feuilles de temps) et assister l'employeur dans ses tâches quotidiennes, sans risque de fuite de données.


[rapport_stage1.docx](https://github.com/user-attachments/files/27239926/rapport_stage1.1.docx)

[rapport_stage2.docx](https://github.com/user-attachments/files/27239939/rapport_stage2.docx)

---

## Formation de l'équipe

L'équipe est composée de deux membres travaillant en collaboration pour concevoir une application web de gestion d'entreprise.

### Membres

| Membre | Rôle | Technologies |
|--------|------|--------------|
| **Paul Gioria** | Développeur Backend | Node.js · Express |
| **Fatou Ndeye** | Développeuse Frontend / UI-UX | React · HTML · CSS |

### Répartition des responsabilités

**Paul — Backend**
- Développement de l'API
- Gestion de la base de données
- Logique métier

**Fatou — Frontend / UI-UX**
- Création de l'interface utilisateur
- Expérience utilisateur
- Intégration frontend

### Communication & collaboration

**Outils utilisés**
- **Discord** — communication quotidienne
- **Google Docs** — documentation partagée
- Réunions régulières de suivi

**Normes de travail**
- Respect des délais
- Partage équilibré des tâches
- Prise de décision en commun
- Transparence sur les difficultés rencontrées

**Objectifs de collaboration**
- Travailler efficacement en binôme
- Développer une bonne communication
- Produire un projet structuré et professionnel
- Répartir clairement les responsabilités

---

## Brainstorming des idées

Durant la phase de brainstorming, quatre idées de projets ont été proposées et analysées.

### Idées explorées

**Idée 1 — Gestion de tâches pour entreprises**
- Création et assignation de tâches
- Suivi des employés
- Organisation du travail
- ✅ Très utile en entreprise · ✅ Projet réaliste · ⚠️ Complexité moyenne

**Idée 2 — Application de facturation**
- Création de factures
- Suivi des paiements
- ✅ Utile pour les entreprises · ❌ Trop limité seul · ❌ Manque de fonctionnalités globales

**Idée 3 — Productivité personnelle**
- Gestion de tâches individuelles
- Organisation personnelle
- ✅ Simple à développer · ❌ Pas adapté au contexte professionnel · ❌ Peu évolutif

**Idée 4 — ERP simplifié ← retenu**
- Gestion des tâches
- Planning des employés
- Suivi des projets
- Facturation basique
- Tableau de bord global
- ✅ Projet complet et professionnel · ✅ Très évolutif · ✅ Bonne adéquation avec les compétences
- 
---

## MVP sélectionné

Le MVP choisi est une application web de gestion d'entreprise simplifiée intégrant une IA locale.

### Problème identifié

Les entreprises rencontrent souvent :
- Un manque d'organisation
- Un suivi difficile des tâches
- Une mauvaise visibilité des projets
- Une gestion manuelle inefficace

### Solution proposée

Une plateforme centralisée permettant de :
- Créer et assigner des tâches
- Suivre leur état en temps réel
- Organiser le planning des employés
- Générer des factures simples
- Analyser documents et factures via l'IA locale (Ollama)
- Assister l'employeur avec un assistant conversationnel interne

### Modules fonctionnels

| Module | Description |
|--------|-------------|
| **Gestion des tâches** | Création, assignation et suivi en temps réel |
| **Planning** | Organisation des emplois du temps des employés |
| **Facturation** | Génération de factures + vérification IA des anomalies |
| **Suivi des temps** | Relevés d'heures par employé et par projet |
| **Assistant RH** | Réponses aux questions RH, génération de documents |
| **Tableau de bord** | Vue globale de l'activité de l'entreprise |

### Impact attendu

- Améliorer la productivité des entreprises
- Centraliser la gestion du travail
- Faciliter la communication interne
- Garantir la conformité RGPD grâce au traitement 100% local
- Offrir une base évolutive vers une solution SaaS

### Défis identifiés

- Gestion des utilisateurs et des rôles
- Structuration de la base de données
- Synchronisation des données
- Organisation du travail en équipe
- Intégration et prompt engineering de l'IA Ollama

---

## Stack technique

| Couche | Technologie | Rôle |
|--------|-------------|------|
| Backend | Node.js v22+ · Express | API REST, logique métier |
| Frontend | React 18 · Vite · React Router | Interface utilisateur |
| Base de données | SQLite (`node:sqlite` intégré) | Stockage local des données, zéro dépendance native |
| IA locale | Ollama (Mistral 7B) | Traitement langage, analyse docs |
| Réseau | Intranet uniquement | Zéro flux externe — RGPD natif |

---

## Structure du projet

```
lexora/
├── backend/
│   ├── index.js             # Point d'entrée Express (port 3000)
│   ├── package.json
│   ├── routes/
│   │   ├── taches.js        # CRUD tâches
│   │   ├── factures.js      # CRUD factures
│   │   ├── planning.js      # CRUD planning
│   │   └── assistant.js     # Chat IA via Ollama
│   ├── services/
│   │   └── ollamaService.js # Wrapper fetch → Ollama
│   └── models/
│       └── db.js            # Init SQLite (node:sqlite natif)
├── frontend/
│   ├── index.html
│   ├── vite.config.js       # Proxy /api → localhost:3000
│   ├── package.json
│   └── src/
│       ├── main.jsx
│       ├── App.jsx           # Router + navigation
│       ├── index.css
│       └── pages/
│           ├── Dashboard.jsx
│           ├── Taches.jsx
│           ├── Factures.jsx
│           ├── Planning.jsx
│           └── Assistant.jsx
├── .env                     # Variables d'environnement
└── .gitignore
```

---

## Lancer le projet

### Prérequis

- Node.js **v22+** (le module `node:sqlite` est intégré à partir de v22)
- [Ollama](https://ollama.com) installé sur la machine locale
- npm

### Installation

```bash
# Cloner le projet
git clone https://github.com/poloelo/holberton-portfolio-projet.git
cd holberton-portfolio-projet/lexora

# 1. Lancer le modèle IA (dans un terminal dédié)
ollama pull mistral
ollama serve

# 2. Backend — Terminal 1
cd backend
npm install
npm run dev
# → API disponible sur http://localhost:3000

# 3. Frontend — Terminal 2
cd ../frontend
npm install
npm run dev
# → Interface disponible sur http://localhost:5173
```

### Variables d'environnement

Le fichier `.env` est déjà présent à la racine `lexora/` :

```env
OLLAMA_URL=http://localhost:11434
DB_PATH=./lexora.db
PORT=3000
```

### Endpoints API

| Méthode | Route | Description |
|---------|-------|-------------|
| GET | `/api/health` | Santé du serveur |
| GET/POST/PUT/DELETE | `/api/taches` | Gestion des tâches |
| GET/POST/PUT/DELETE | `/api/factures` | Gestion des factures |
| GET/POST/PUT/DELETE | `/api/planning` | Gestion du planning |
| POST | `/api/assistant` | Chat avec l'IA Ollama |

---

## Conclusion — Étape 2

À la fin de cette deuxième étape, l'équipe a :

- ✅ Défini clairement les rôles (Paul & Fatou)
- ✅ Exploré plusieurs idées de projet
- ✅ Sélectionné un MVP cohérent et réaliste
- ✅ Intégré l'angle IA locale (Ollama) pour la conformité RGPD
- ✅ Mis en place le backend Express avec API REST complète
- ✅ Mis en place le frontend React avec navigation et pages fonctionnelles
- ✅ Intégré SQLite via le module natif `node:sqlite` (Node 22+, zéro compilation)

---

*Rapport Étape 2 · Paul Gioria & Fatou Ndeye · Holberton School · Avril 2026*
