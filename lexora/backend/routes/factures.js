import { Router } from 'express';
import db from '../models/db.js';

const router = Router();

router.get('/', (req, res) => {
  const factures = db.prepare('SELECT * FROM factures ORDER BY id DESC').all();
  res.json(factures);
});

router.post('/', (req, res) => {
  const { client, montant, statut, date_emission, date_echeance } = req.body;
  if (!client || montant === undefined) return res.status(400).json({ error: 'client et montant requis' });
  const stmt = db.prepare('INSERT INTO factures (client, montant, statut, date_emission, date_echeance) VALUES (?, ?, ?, ?, ?)');
  const result = stmt.run(client, montant, statut || 'en attente', date_emission || null, date_echeance || null);
  const facture = db.prepare('SELECT * FROM factures WHERE id = ?').get(result.lastInsertRowid);
  res.status(201).json(facture);
});

router.put('/:id', (req, res) => {
  const { client, montant, statut, date_emission, date_echeance } = req.body;
  const stmt = db.prepare('UPDATE factures SET client = ?, montant = ?, statut = ?, date_emission = ?, date_echeance = ? WHERE id = ?');
  const result = stmt.run(client, montant, statut, date_emission, date_echeance, req.params.id);
  if (result.changes === 0) return res.status(404).json({ error: 'Facture non trouvee' });
  const facture = db.prepare('SELECT * FROM factures WHERE id = ?').get(req.params.id);
  res.json(facture);
});

router.delete('/:id', (req, res) => {
  const result = db.prepare('DELETE FROM factures WHERE id = ?').run(req.params.id);
  if (result.changes === 0) return res.status(404).json({ error: 'Facture non trouvee' });
  res.json({ success: true });
});

export default router;
