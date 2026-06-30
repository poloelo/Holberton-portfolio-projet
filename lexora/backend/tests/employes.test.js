/**
 * employes.test.js — Tests d'intégration du contrôle d'accès par rôle.
 *
 * Exécutés avec Vitest + supertest contre l'app Express réelle (sans ouvrir
 * de port réseau). Vérifient la correction de la faille d'élévation de
 * privilège : seules les requêtes admin peuvent lire/modifier/supprimer des
 * employés ; un employé authentifié ne peut pas s'auto-promouvoir admin.
 *
 * Une base SQLite temporaire est utilisée (DB_PATH), supprimée à la fin.
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const TEST_DB = path.join(__dirname, 'test-lexora.db');

// IMPORTANT : configurer l'environnement AVANT d'importer l'app/la db,
// car ces modules lisent process.env dès leur chargement.
process.env.JWT_SECRET = 'test-secret-employes';
process.env.DB_PATH = TEST_DB;

let app, db, adminToken, employeToken, employeId;

beforeAll(async () => {
  // Repartir d'une base propre
  if (fs.existsSync(TEST_DB)) fs.unlinkSync(TEST_DB);

  ({ default: app } = await import('../index.js'));
  ({ default: db } = await import('../models/db.js'));

  const hash = bcrypt.hashSync('motdepasse', 10);

  const admin = db.prepare(
    "INSERT INTO employes (nom, email, role, password_hash) VALUES (?, ?, 'admin', ?)"
  ).run('Boss', 'admin@test.fr', hash);

  const emp = db.prepare(
    "INSERT INTO employes (nom, email, role, password_hash) VALUES (?, ?, 'employe', ?)"
  ).run('Worker', 'worker@test.fr', hash);
  employeId = emp.lastInsertRowid;

  const sign = (id, email, role) =>
    jwt.sign({ id, email, role, nom: 'Test' }, process.env.JWT_SECRET, { expiresIn: '1h' });

  adminToken   = sign(admin.lastInsertRowid, 'admin@test.fr', 'admin');
  employeToken = sign(employeId, 'worker@test.fr', 'employe');
});

afterAll(() => {
  if (db) db.close();
  if (fs.existsSync(TEST_DB)) fs.unlinkSync(TEST_DB);
});

describe('Protection par rôle — /api/employes', () => {
  it('1. Requête sans token → 401', async () => {
    const res = await request(app).get('/api/employes');
    expect(res.status).toBe(401);
  });

  it('2. Employé non-admin → 403', async () => {
    const res = await request(app)
      .get('/api/employes')
      .set('Authorization', `Bearer ${employeToken}`);
    expect(res.status).toBe(403);
  });

  it('3. Admin → 200, liste retournée', async () => {
    const res = await request(app)
      .get('/api/employes')
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it('4. Auto-promotion bloquée (PUT non-admin, role:admin) → 403, rôle inchangé', async () => {
    const res = await request(app)
      .put(`/api/employes/${employeId}`)
      .set('Authorization', `Bearer ${employeToken}`)
      .send({ nom: 'Worker', email: 'worker@test.fr', role: 'admin' });
    expect(res.status).toBe(403);

    const row = db.prepare('SELECT role FROM employes WHERE id = ?').get(employeId);
    expect(row.role).toBe('employe'); // toujours employé, pas admin
  });

  it('5. Suppression bloquée (DELETE non-admin) → 403, employé présent', async () => {
    const res = await request(app)
      .delete(`/api/employes/${employeId}`)
      .set('Authorization', `Bearer ${employeToken}`);
    expect(res.status).toBe(403);

    const row = db.prepare('SELECT id FROM employes WHERE id = ?').get(employeId);
    expect(row).toBeTruthy(); // toujours présent
  });

  it('6. Suppression admin (DELETE admin) → 200, employé supprimé', async () => {
    const res = await request(app)
      .delete(`/api/employes/${employeId}`)
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.status).toBe(200);

    const row = db.prepare('SELECT id FROM employes WHERE id = ?').get(employeId);
    expect(row).toBeFalsy(); // bien supprimé
  });
});
