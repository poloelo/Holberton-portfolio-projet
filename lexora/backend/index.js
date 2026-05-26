/**
 * index.js — Point d'entrée du serveur Express (Lexora Backend)
 *
 * Ce fichier :
 *  1. Charge la configuration depuis .env
 *  2. Crée l'application Express
 *  3. Enregistre les middlewares globaux (CORS, JSON)
 *  4. Monte chaque module de routes sous son préfixe /api/...
 *  5. Lance le serveur sur le port configuré
 *
 * Architecture : un fichier de route = un domaine métier.
 * La base de données est initialisée au premier import de db.js.
 */

import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import express from 'express';
import cors from 'cors';

// ── Import des modules de routes ──────────────────────────────
import tachesRouter      from './routes/taches.js';
import facturesRouter    from './routes/factures.js';
import planningRouter    from './routes/planning.js';
import assistantRouter   from './routes/assistant.js';
import todosRouter       from './routes/todos.js';
import clientsRouter     from './routes/clients.js';
import employesRouter    from './routes/employes.js';
import automationsRouter from './routes/automations.js';
import evenementsRouter  from './routes/evenements.js';
import documentsRouter   from './routes/documents.js';

// ── Configuration ─────────────────────────────────────────────
// __dirname n'existe pas en ES modules (type: "module"), on le recrée.
const __dirname = dirname(fileURLToPath(import.meta.url));

// Charge le fichier .env situé un cran au-dessus (lexora/.env)
dotenv.config({ path: join(__dirname, '../.env') });

// ── Application Express ───────────────────────────────────────
const app  = express();
const PORT = process.env.PORT || 3000;

// Middleware CORS : autorise les requêtes cross-origin (utile en développement
// quand le frontend tourne sur un port différent du backend).
// En production, Nginx sert les deux sur le même domaine donc CORS n'est
// pas strictement nécessaire, mais on le laisse pour la flexibilité.
app.use(cors());

// Middleware JSON : parse automatiquement les corps de requête JSON
// et rend req.body disponible dans les handlers.
app.use(express.json());

// ── Route de santé ────────────────────────────────────────────
// Utilisée par Docker / load-balancers pour vérifier que le service est vivant.
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ── Montage des routes ────────────────────────────────────────
// Chaque préfixe correspond à un module métier indépendant.
app.use('/api/taches',      tachesRouter);
app.use('/api/factures',    facturesRouter);
app.use('/api/planning',    planningRouter);
app.use('/api/assistant',   assistantRouter);
app.use('/api/todos',       todosRouter);
app.use('/api/clients',     clientsRouter);
app.use('/api/employes',    employesRouter);     // Protégé par isAdmin
app.use('/api/automations', automationsRouter);  // Protégé par isAdmin
app.use('/api/evenements',  evenementsRouter);
app.use('/api/documents',   documentsRouter);

// ── Démarrage du serveur ──────────────────────────────────────
app.listen(PORT, () => {
  console.log(`✅ Lexora backend running on port ${PORT}`);
});
