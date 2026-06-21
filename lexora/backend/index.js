/**
 * index.js — Point d'entrée du serveur Express (Lexora Backend)
 *
 * Ce fichier :
 *  1. Charge la configuration depuis .env (ou .env.test si NODE_ENV=test)
 *  2. Crée l'application Express
 *  3. Enregistre les middlewares globaux (CORS, helmet, rate-limit, JSON)
 *  4. Monte chaque module de routes sous son préfixe /api/...
 *  5. Lance le serveur sur le port configuré (sauf en mode test)
 *
 * Architecture : un fichier de route = un domaine métier.
 * La base de données est initialisée au premier import de db.js.
 */

import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';

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
import authRouter        from './routes/auth.js';

// ── Configuration ─────────────────────────────────────────────
const __dirname = dirname(fileURLToPath(import.meta.url));
const envFile = process.env.NODE_ENV === 'test' ? './.env.test' : '../.env';
dotenv.config({ path: join(__dirname, envFile) });
 
const PORT = process.env.PORT || 3000;
const app  = express();

// ── Sécurité : Headers HTTP ───────────────────────────────────
app.use(helmet());

// ── Sécurité : CORS strict ────────────────────────────────────
const ALLOWED_ORIGINS = (process.env.ALLOWED_ORIGINS || 'http://localhost:5173')
  .split(',')
  .map(o => o.trim());

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || ALLOWED_ORIGINS.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error(`CORS bloqué pour l'origine : ${origin}`));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
}));

// ── Sécurité : Rate Limiting ──────────────────────────────────
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Trop de requêtes, veuillez réessayer dans 15 minutes.' },
});
app.use('/api/', limiter);

// ── Parsing JSON ──────────────────────────────────────────────
app.use(express.json());

// ── Route de santé ────────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ── Montage des routes ────────────────────────────────────────
app.use('/api/auth',        authRouter);
app.use('/api/taches',      tachesRouter);
app.use('/api/factures',    facturesRouter);
app.use('/api/planning',    planningRouter);
app.use('/api/assistant',   assistantRouter);
app.use('/api/todos',       todosRouter);
app.use('/api/clients',     clientsRouter);
app.use('/api/employes',    employesRouter);     // Protégé par requireAdmin
app.use('/api/automations', automationsRouter);  // Protégé par verifyJWT
app.use('/api/evenements',  evenementsRouter);
app.use('/api/documents',   documentsRouter);

// ── Démarrage du serveur ──────────────────────────────────────
// On ne lance le serveur que si ce fichier est exécuté directement
// (node index.js / npm start). Quand il est importé par les tests
// (supertest), on veut juste l'app Express, sans port ouvert.
if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`Lexora backend running on port ${PORT}`);
  });
}

export default app;