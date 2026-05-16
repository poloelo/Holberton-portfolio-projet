import express from 'express';
import db from '../models/db.js';

const router = express.Router();

// Middleware Admin
const isAdmin = (req, res, next) => {
  const adminKey = req.headers['x-admin-key'];
  if (adminKey !== process.env.ADMIN_KEY) {
    return res.status(403).json({ error: 'Accès refusé — Admin uniquement' });
  }
  next();
};

// GET — Tous les employés (Admin)
router.get('/', isAdmin, (req, res) => {
  try {
    const employes = db.prepare('SELECT * FROM employes ORDER BY nom ASC').all();
    res.json(employes);
  } catch (err) {
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// GET — Un employé par ID (Admin)
router.get('/:id', isAdmin, (req, res) => {
  try {
    const employe = db.prepare('SELECT * FROM employes WHERE id = ?').get(req.params.id);
    if (!employe) return res.status(404).json({ error: 'Employé non trouvé' });
    res.json(employe);
  } catch (err) {
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// POST — Créer un employé (Admin)
router.post('/', isAdmin, (req, res) => {
  try {
    const { nom, prenom, email, poste, departement, salaire, date_embauche, role } = req.body;
    if (!nom) return res.status(400).json({ error: 'nom requis' });
    if (!email) return res.status(400).json({ error: 'email requis' });
    const stmt = db.prepare(`
      INSERT INTO employes (nom, prenom, email, poste, departement, salaire, date_embauche, role)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);
    const result = stmt.run(nom, prenom, email, poste, departement, salaire, date_embauche, role || 'employe');
    const employe = db.prepare('SELECT * FROM employes WHERE id = ?').get(result.lastInsertRowid);
    res.status(201).json(employe);
  } catch (err) {
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// PUT — Modifier un employé (Admin)
router.put('/:id', isAdmin, (req, res) => {
  try {
    const { nom, prenom, email, poste, departement, salaire, date_embauche, role } = req.body;
    const employe = db.prepare('SELECT * FROM employes WHERE id = ?').get(req.params.id);
    if (!employe) return res.status(404).json({ error: 'Employé non trouvé' });
    db.prepare(`
      UPDATE employes SET nom = ?, prenom = ?, email = ?, poste = ?,
      departement = ?, salaire = ?, date_embauche = ?, role = ?
      WHERE id = ?
    `).run(nom, prenom, email, poste, departement, salaire, date_embauche, role, req.params.id);
    const updated = db.prepare('SELECT * FROM employes WHERE id = ?').get(req.params.id);
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// DELETE — Supprimer un employé (Admin)
router.delete('/:id', isAdmin, (req, res) => {
  try {
    const employe = db.prepare('SELECT * FROM employes WHERE id = ?').get(req.params.id);
    if (!employe) return res.status(404).json({ error: 'Employé non trouvé' });
    db.prepare('DELETE FROM employes WHERE id = ?').run(req.params.id);
    res.json({ message: 'Employé supprimé' });
  } catch (err) {
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

export default router;
