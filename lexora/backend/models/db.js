import { DatabaseSync } from 'node:sqlite';
import path from 'path';

const dbPath = process.env.DB_PATH || './lexora.db';
const db = new DatabaseSync(path.resolve(dbPath));

db.exec(`
  CREATE TABLE IF NOT EXISTS taches (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    titre TEXT NOT NULL,
    description TEXT,
    statut TEXT DEFAULT 'todo',
    assignee TEXT,
    created_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS factures (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    client TEXT NOT NULL,
    montant REAL NOT NULL,
    statut TEXT DEFAULT 'en attente',
    date_emission TEXT,
    date_echeance TEXT
  );

  CREATE TABLE IF NOT EXISTS planning (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    employe TEXT NOT NULL,
    date TEXT NOT NULL,
    heure_debut TEXT NOT NULL,
    heure_fin TEXT NOT NULL,
    projet TEXT
  );
`);

export default db;
