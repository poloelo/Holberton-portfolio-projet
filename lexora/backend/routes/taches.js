import { Router } from 'express';
import db from '../models/db.js';

const router = Router();

router.get('/', (req, res) => {
  const taches = db.prepare('SELECT * FROM taches ORDER BY created_at DESC').all();
  res.json(taches);
});

router.post('/', (req, res) => {
  const { titre, description, statut, assignee } = req.body;
  if (!titre) return res.status(400).json({ error: 'titre requis' });
  const stmt = db.prepare('INSERT INTO taches (titre, description, statut, assignee) VALUES (?, ?, ?, ?)');
  const result = stmt.run(titre, description || null, statut || 'todo', assignee || null);
  const tache = db.prepare('SELECT * FROM taches WHERE id = ?').get(result.lastInsertRowid);
  res.status(201).json(tache);
});

router.put('/:id', (req, res) => {
  const { titre, description, statut, assignee } = req.body;
  const stmt = db.prepare('UPDATE taches SET titre = ?, description = ?, statut = ?, assignee = ? WHERE id = ?');
  const result = stmt.run(titre, description, statut, assignee, req.params.id);
  if (result.changes === 0) return res.status(404).json({ error: 'Tache non trouvee' });
  const tache = db.prepare('SELECT * FROM taches WHERE id = ?').get(req.params.id);
  res.json(tache);
});

router.delete('/:id', (req, res) => {
  const result = db.prepare('DELETE FROM taches WHERE id = ?').run(req.params.id);
  if (result.changes === 0) return res.status(404).json({ error: 'Tache non trouvee' });
  res.json({ success: true });
});

export default router;
