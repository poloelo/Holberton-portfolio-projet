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

## Tests de Paul Gioria (backend complet)

| Test | Statut |
|------|--------|
| Backend démarre, SQLite initialisé |  PASS |
| Login JWT avec bons identifiants |  PASS |
| Login JWT avec mauvais identifiants |  PASS |
| Routes admin sans token → 401 |  PASS |
| Routes admin avec token valide → 200 | PASS |
| Token forgé/expiré → 401 propre |  PASS |
| Ancien header x-admin-key → 401 |  PASS |
| Suppression récursive dossiers |  PASS |
| Frontend build Vite (1423 modules) |  PASS |
| Routes publiques sans token → 200 |  PASS |