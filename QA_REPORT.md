# QA Report — Lexora MVP

**Date :** 2026-06-08  
**Testeur :** Keish (sam99-web)  
**Branche :** keish/docker-security  

---

## Environnement de test

- Docker Desktop v29.4.3
- Windows 11 / WSL2
- curl pour les tests API

---

## Résultats des tests

| # | Test | Méthode | Résultat attendu | Résultat obtenu | Statut |
|---|------|---------|-----------------|-----------------|--------|
| 1 | Health check | `GET /api/health` | `{"status":"ok"}` | `{"status":"ok","timestamp":"..."}` |  PASS |
| 2 | Helmet headers | `curl -I /api/health` | Headers sécurité présents | CSP, X-Frame-Options, HSTS, nosniff... |  PASS |
| 3 | Rate limiting | 101 requêtes en boucle | 429 à partir de la 101e | 200 x100 puis 429 |  PASS |
| 4 | Frontend Nginx | `curl -I http://localhost:80` | 200 OK | 200 OK, nginx/1.31.1 |  PASS |
| 5 | CORS strict | Origin: evil.com | 500 / bloqué | HTTP 500, origine rejetée |  PASS |
| 6 | Route protégée sans token | `GET /api/employes` | 401 Token manquant | `{"error":"Token manquant"}` |  PASS |
| 7 | Login mauvais identifiants | `POST /api/auth/login` | 401 Identifiants incorrects | `{"error":"Identifiants incorrects"}` |  PASS |
| 8 | Login bloqué rate limit | `POST /api/auth/login` x101 | 429 après limite | `{"error":"Trop de requêtes..."}` |  PASS |

---

## Verdict

**PASS — MVP fonctionnel, sécurité validée.**

### Points validés
- Docker : build multi-stage, volumes persistants, health check
- Helmet : 12 headers de sécurité actifs sur toutes les routes
- CORS strict : origines non autorisées bloquées (HTTP 500)
- Rate limiting : 100 req/15min, `429` retourné au-delà
- Auth JWT : routes admin protégées, erreurs propres

---
Pas de problème, voici une version totalement épurée sans aucun émoji.

---

## Tests de Paul Gioria (Backend complet & Sécurité)

**Date :** 2026-06-10

**Environnement :** Node.js 18, Express 4, SQLite (better-sqlite3), base fraîche (lexora.db réinitialisée avant chaque run)

### Vue d'ensemble du pipeline

| Test | Statut |
| --- | --- |
| Backend démarre, SQLite initialisé | PASS |
| Login JWT avec bons identifiants | PASS |
| Login JWT avec mauvais identifiants | PASS |
| Routes admin sans token -> 401 | PASS |
| Routes admin avec token valide -> 200 | PASS |
| Token forgé/expiré -> 401 propre | PASS |
| Ancien header x-admin-key -> 401 | PASS |
| Suppression récursive dossiers | PASS |
| Frontend build Vite (1423 modules) | PASS |
| Routes publiques sans token -> 200 | PASS |

---

### JWT, Authentification & Sécurité des routes

| # | Test | Commande / Méthode | Résultat attendu | Résultat obtenu | Statut |
| --- | --- | --- | --- | --- | --- |
| J-1 | Seed admin au démarrage | Backend démarré avec ADMIN_EMAIL + ADMIN_PASSWORD dans .env | Log Compte admin créé + ligne en base | Compte admin créé : admin@lexora.fr | PASS |
| J-2 | Login admin valide | POST /api/auth/login { email, password } corrects | 200 + { token, user } | JWT signé retourné, user.role = "admin" | PASS |
| J-3 | Login mauvais mot de passe | POST /api/auth/login password erroné | 401 + { error } | {"error":"Identifiants incorrects"} | PASS |
| J-4 | Login email inexistant | POST /api/auth/login email inconnu | 401 + { error } | {"error":"Identifiants incorrects"} | PASS |
| J-5 | Login champs vides | POST /api/auth/login {} | 400 + { error } | {"error":"Email et mot de passe requis"} | PASS |
| J-6 | Route admin sans token | GET /api/employes sans header | 401 | {"error":"Token manquant"} | PASS |
| J-7 | Route admin avec token valide | GET /api/employes + Authorization: Bearer  | 200 + tableau JSON | Liste des employés retournée | PASS |
| J-8 | Token forgé (mauvaise signature) | GET /api/employes + token modifié manuellement | 401 | {"error":"Token invalide"} | PASS |
| J-9 | Création employé avec token admin | POST /api/employes + Authorization: Bearer  | 201 + employé créé | { id, nom, prenom, email, ... } | PASS |
| J-10 | Login employé non-admin | POST /api/auth/login avec compte role=employe | 200 + JWT avec role=employe | Token généré, accès routes publiques OK | PASS |
| J-11 | Dotenv chargé avant db.js | Vérification ordre des imports ES modules | Admin seedé correctement | env.js importé en premier -> seed OK | PASS |

---

### Coffre-fort documentaire

| # | Test | Commande / Méthode | Résultat attendu | Résultat obtenu | Statut |
| --- | --- | --- | --- | --- | --- |
| C-1 | Création dossier racine | POST /api/documents/dossiers { nom: "Dossier Test" } | 201 + dossier créé avec parent_id: null | { id: 1, nom: "Dossier Test", parent_id: null } | PASS |
| C-2 | Création sous-dossier | POST /api/documents/dossiers { nom: "Sous-dossier", parent_id: 1 } | 201 + dossier avec parent_id: 1 | { id: 2, parent_id: 1 } | PASS |
| C-3 | Liste des dossiers | GET /api/documents/dossiers | 200 + tableau | Liste complète des dossiers | PASS |
| C-4 | Suppression dossier racine (récursive) | DELETE /api/documents/dossiers/1 | 200 + suppression en cascade du sous-dossier | Dossier parent + enfants supprimés | PASS |
| C-5 | Upload fichier (multipart) | POST /api/documents/upload multipart/form-data { file } | 201 + métadonnées fichier | { id, nom, nom_fichier, type, taille } | PASS |
| C-6 | Upload dans un dossier | POST /api/documents/upload + dossier_id: 1 | 201 + dossier_id: 1 dans la réponse | Fichier associé au dossier | PASS |
| C-7 | Liste documents (racine) | GET /api/documents | 200 + tableau | Liste des documents sans dossier | PASS |
| C-8 | Liste documents filtrée | GET /api/documents?dossier_id=1 | 200 + documents du dossier 1 uniquement | Filtre appliqué correctement | PASS |
| C-9 | Téléchargement fichier | GET /api/documents/:id/download | 200 + stream fichier binaire | Fichier retourné avec bon Content-Disposition | PASS |
| C-10 | Suppression document | DELETE /api/documents/:id | 200 + fichier retiré du disque et de la DB | { success: true }, fichier physique supprimé | PASS |
| C-11 | Suppression document inexistant | DELETE /api/documents/9999 | 404 | {"error":"Document non trouvé"} | PASS |

---

### Intégration & CRUD complet — Tous modules

| # | Module | POST | GET | PUT (statut) | DELETE | Statut |
| --- | --- | --- | --- | --- | --- | --- |
| M-1 | Tâches | OK | OK | OK in_progress | OK | PASS |
| M-2 | Todos | OK | OK | — | OK | PASS |
| M-3 | Clients | OK | OK | — | OK | PASS |
| M-4 | Factures | OK | OK | OK payee | OK | PASS |
| M-5 | Planning | OK | OK | — | OK | PASS |
| M-6 | Événements | OK | OK | — | OK | PASS |
| M-7 | Employés (admin) | OK | OK | — | — | PASS |
| M-8 | Automations (admin) | OK | OK | — | — | PASS |
| M-9 | Dossiers | OK | OK | — | OK | PASS |
| M-10 | Documents | OK upload | OK | — | OK | PASS |

---

### Bilan de la suite de tests

> **Résultat : 32 / 32 tests passés** (10 tests globaux + 11 JWT/Auth + 11 Coffre-fort)

```
- Seed admin via .env -> compte créé au 1er démarrage
- Cycle complet d'authentification JWT (Login / Middleware / Validation)
- Protection des routes d'administration (401 non authentifié, 200 valide)
- Sécurité renforcée : rejet immédiat des signatures et tokens altérés
- Structure documentaire : CRUD dossiers complet avec cascade récursive
- Gestion des fichiers : upload multipart, download stream et nettoyage physique du disque
- Build de production Frontend validé (Vite)

```
