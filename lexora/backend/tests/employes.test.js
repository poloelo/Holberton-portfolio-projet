/**
 * employes.test.js — Vérifie que les routes /api/employes sont bien
 * réservées aux admins (et pas seulement aux utilisateurs authentifiés).
 *
 * Contexte : avant correction, le middleware utilisé était `verifyJWT`
 * (vérifie juste un token valide). N'importe quel employé connecté
 * pouvait donc lire/modifier/supprimer des employés, y compris
 * s'auto-promouvoir admin via PUT /:id.
 *
 * La correction utilise `requireAdmin`, qui vérifie en plus
 * `req.admin.role === 'admin'` avant de laisser passer.
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import jwt from 'jsonwebtoken';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

import app from '../index.js';
import db from '../models/db.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const TEST_DB_PATH = path.resolve(__dirname, '../test.db');

// Deux employés de test : un admin, un non-admin.
// On insère directement en base (pas besoin de bcrypt ici car on
// ne teste pas /login, on génère directement les tokens).
let adminToken;
let employeToken;

beforeAll(() => {
  const insert = db.prepare(`
    INSERT INTO employes (nom, prenom, email, role)
    VALUES (?, ?, ?, ?)
  `);
  const admin   = insert.run('Admin', 'Test', 'admin.test@lexora.fr', 'admin');
  const employe = insert.run('Employe', 'Test', 'employe.test@lexora.fr', 'employe');

  adminToken = jwt.sign(
    { id: admin.lastInsertRowid, email: 'admin.test@lexora.fr', role: 'admin' },
    process.env.JWT_SECRET,
    { expiresIn: '1h' }
  );

  employeToken = jwt.sign(
    { id: employe.lastInsertRowid, email: 'employe.test@lexora.fr', role: 'employe' },
    process.env.JWT_SECRET,
    { expiresIn: '1h' }
  );
});

afterAll(() => {
  // Nettoyage : on supprime le fichier de DB de test pour repartir propre
  // à la prochaine exécution.
  db.close();
  if (fs.existsSync(TEST_DB_PATH)) fs.unlinkSync(TEST_DB_PATH);
});

describe('GET /api/employes — protection par rôle', () => {
  it('refuse une requête sans token (401)', async () => {
    const res = await request(app).get('/api/employes');
    expect(res.status).toBe(401);
  });

  it('refuse un employé non-admin (403)', async () => {
    const res = await request(app)
      .get('/api/employes')
      .set('Authorization', `Bearer ${employeToken}`);
    expect(res.status).toBe(403);
    expect(res.body.error).toMatch(/administrateur/i);
  });

  it('autorise un admin (200)', async () => {
    const res = await request(app)
      .get('/api/employes')
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });
});

describe('PUT /api/employes/:id — un non-admin ne peut pas se promouvoir', () => {
  it('refuse à un employé non-admin de modifier un employé (403)', async () => {
    const insert = db.prepare(`
      INSERT INTO employes (nom, prenom, email, role) VALUES (?, ?, ?, ?)
    `);
    const cible = insert.run('Cible', 'Test', 'cible.test@lexora.fr', 'employe');

    const res = await request(app)
      .put(`/api/employes/${cible.lastInsertRowid}`)
      .set('Authorization', `Bearer ${employeToken}`)
      .send({ role: 'admin' });

    expect(res.status).toBe(403);

    // Vérification supplémentaire : le rôle en base n'a pas changé
    const verif = db.prepare('SELECT role FROM employes WHERE id = ?').get(cible.lastInsertRowid);
    expect(verif.role).toBe('employe');
  });
});

describe('DELETE /api/employes/:id — réservé aux admins', () => {
  it('refuse à un employé non-admin de supprimer un employé (403)', async () => {
    const insert = db.prepare(`
      INSERT INTO employes (nom, prenom, email, role) VALUES (?, ?, ?, ?)
    `);
    const cible = insert.run('ASupprimer', 'Test', 'asupprimer.test@lexora.fr', 'employe');

    const res = await request(app)
      .delete(`/api/employes/${cible.lastInsertRowid}`)
      .set('Authorization', `Bearer ${employeToken}`);

    expect(res.status).toBe(403);

    // L'employé existe toujours en base
    const verif = db.prepare('SELECT id FROM employes WHERE id = ?').get(cible.lastInsertRowid);
    expect(verif).toBeTruthy();
  });

  it('autorise un admin à supprimer un employé (200)', async () => {
    const insert = db.prepare(`
      INSERT INTO employes (nom, prenom, email, role) VALUES (?, ?, ?, ?)
    `);
    const cible = insert.run('ASupprimer2', 'Test', 'asupprimer2.test@lexora.fr', 'employe');

    const res = await request(app)
      .delete(`/api/employes/${cible.lastInsertRowid}`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
  });
});