import express from 'express';
import db from '../models/db.js';

const router = express.Router();

// GET — Récupérer tous les todos
router.get('/', (req, res) => {
  try {
    const todos = db.prepare('SELECT * FROM todos ORDER BY date ASC').all();
    res.json(todos);
  } catch (err) {
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// POST — Créer un todo
router.post('/', (req, res) => {
  try {
    const { titre, description, date, priorite, statut } = req.body;
    if (!titre) return res.status(400).json({ error: 'titre requis' });
    const stmt = db.prepare(`
      INSERT INTO todos (titre, description, date, priorite, statut)
      VALUES (?, ?, ?, ?, ?)
    `);
    const result = stmt.run(titre, description, date, priorite || 'normale', statut || 'à faire');
    const todo = db.prepare('SELECT * FROM todos WHERE id = ?').get(result.lastInsertRowid);
    res.status(201).json(todo);
  } catch (err) {
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// PUT — Modifier un todo
router.put('/:id', (req, res) => {
  try {
    const { titre, description, date, priorite, statut } = req.body;
    const stmt = db.prepare(`
      UPDATE todos SET titre = ?, description = ?, date = ?, priorite = ?, statut = ?
      WHERE id = ?
    `);
    stmt.run(titre, description, date, priorite, statut, req.params.id);
    const todo = db.prepare('SELECT * FROM todos WHERE id = ?').get(req.params.id);
    if (!todo) return res.status(404).json({ error: 'Todo non trouvé' });
    res.json(todo);
  } catch (err) {
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// DELETE — Supprimer un todo
router.delete('/:id', (req, res) => {
  try {
    const todo = db.prepare('SELECT * FROM todos WHERE id = ?').get(req.params.id);
    if (!todo) return res.status(404).json({ error: 'Todo non trouvé' });
    db.prepare('DELETE FROM todos WHERE id = ?').run(req.params.id);
    res.json({ message: 'Todo supprimé' });
  } catch (err) {
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

export default router;