import Database from 'better-sqlite3';
import path from 'path';

const dbPath = process.env.DB_PATH || './lexora.db';
const db = new Database(path.resolve(dbPath));

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
  CREATE TABLE IF NOT EXISTS todos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    titre TEXT NOT NULL,
    description TEXT,
    date TEXT,
    priorite TEXT DEFAULT 'normale',
    statut TEXT DEFAULT 'à faire',
    created_at TEXT DEFAULT (datetime('now'))
  );
  CREATE TABLE IF NOT EXISTS clients (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    type_client TEXT DEFAULT 'particulier',
    email TEXT NOT NULL,
    telephone TEXT,
    adresse TEXT,
    nom TEXT,
    prenom TEXT,
    raison_sociale TEXT,
    siret TEXT,
    tva TEXT,
    contact_nom TEXT,
    created_at TEXT DEFAULT (datetime('now'))
  );
  CREATE TABLE IF NOT EXISTS employes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nom TEXT NOT NULL,
    prenom TEXT,
    email TEXT NOT NULL,
    poste TEXT,
    departement TEXT,
    salaire REAL,
    date_embauche TEXT,
    role TEXT DEFAULT 'employe',
    created_at TEXT DEFAULT (datetime('now'))
  );
  CREATE TABLE IF NOT EXISTS automations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nom TEXT NOT NULL,
    description TEXT,
    type TEXT,
    frequence TEXT,
    action TEXT NOT NULL,
    actif INTEGER DEFAULT 1,
    created_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS evenements (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    titre TEXT NOT NULL,
    description TEXT,
    date_debut TEXT NOT NULL,
    date_fin TEXT,
    type TEXT DEFAULT 'evenement',
    couleur TEXT DEFAULT '#7c6af7',
    created_by TEXT,
    created_at TEXT DEFAULT (datetime('now'))
  );

  -- Dossiers du coffre-fort (arborescence par parent_id)
  CREATE TABLE IF NOT EXISTS dossiers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nom TEXT NOT NULL,
    description TEXT,
    parent_id INTEGER,
    created_at TEXT DEFAULT (datetime('now'))
  );

  -- Documents/fichiers stockés dans le coffre-fort
  CREATE TABLE IF NOT EXISTS documents (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nom TEXT NOT NULL,
    nom_fichier TEXT NOT NULL,
    type TEXT,
    taille TEXT,
    statut TEXT DEFAULT 'En cours',
    description TEXT,
    dossier_id INTEGER,
    created_at TEXT DEFAULT (datetime('now'))
  );
`);

export default db;

