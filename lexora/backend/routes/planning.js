import { Router } from 'express';
import db from '../models/db.js';

const router = Router();

router.get('/', (req, res) => {
  const entries = db.prepare('SELECT * FROM planning ORDER BY date, heure_debut').all();
  res.json(entries);
});

router.post('/', (req, res) => {
  const { employe, date, heure_debut, heure_fin, projet } = req.body;
  if (!employe || !date || !heure_debut || !heure_fin) {
    return res.status(400).json({ error: 'employe, date, heure_debut et heure_fin requis' });
  }
  const stmt = db.prepare('INSERT INTO planning (employe, date, heure_debut, heure_fin, projet) VALUES (?, ?, ?, ?, ?)');
  const result = stmt.run(employe, date, heure_debut, heure_fin, projet || null);
  const entry = db.prepare('SELECT * FROM planning WHERE id = ?').get(result.lastInsertRowid);
  res.status(201).json(entry);
});

router.put('/:id', (req, res) => {
  const { employe, date, heure_debut, heure_fin, projet } = req.body;
  const stmt = db.prepare('UPDATE planning SET employe = ?, date = ?, heure_debut = ?, heure_fin = ?, projet = ? WHERE id = ?');
  const result = stmt.run(employe, date, heure_debut, heure_fin, projet, req.params.id);
  if (result.changes === 0) return res.status(404).json({ error: 'Entree non trouvee' });
  const entry = db.prepare('SELECT * FROM planning WHERE id = ?').get(req.params.id);
  res.json(entry);
});

router.delete('/:id', (req, res) => {
  const result = db.prepare('DELETE FROM planning WHERE id = ?').run(req.params.id);
  if (result.changes === 0) return res.status(404).json({ error: 'Entree non trouvee' });
  res.json({ success: true });
});

export default router;
