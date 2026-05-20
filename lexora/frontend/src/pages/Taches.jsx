import { useEffect, useState } from 'react';
import { useToast } from '../contexts/ToastContext.jsx';

const defaultForm = { titre: '', description: '', statut: 'todo', assignee: '' };

const STATUTS = {
  todo:        { label: 'À faire',  cls: 'badge-todo' },
  in_progress: { label: 'En cours', cls: 'badge-in-progress' },
  done:        { label: 'Terminé',  cls: 'badge-done' },
};

function StatusBadge({ statut }) {
  const s = STATUTS[statut] || { label: statut, cls: 'badge-todo' };
  return <span className={`badge ${s.cls}`}>{s.label}</span>;
}

export default function Taches() {
  const [taches, setTaches]     = useState([]);
  const [form, setForm]         = useState(defaultForm);
  const [loading, setLoading]   = useState(true);
  const [saving, setSaving]     = useState(false);
  const [search, setSearch]     = useState('');
  const toast = useToast();

  const load = () =>
    fetch('/api/taches')
      .then(r => r.json())
      .then(data => { setTaches(Array.isArray(data) ? data : []); setLoading(false); })
      .catch(() => { toast('Erreur lors du chargement', 'error'); setLoading(false); });

  useEffect(() => { load(); }, []);

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async e => {
    e.preventDefault();
    setSaving(true);
    try {
      await fetch('/api/taches', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      setForm(defaultForm);
      await load();
      toast('Tâche ajoutée avec succès');
    } catch {
      toast('Erreur lors de l\'ajout', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async id => {
    try {
      await fetch(`/api/taches/${id}`, { method: 'DELETE' });
      setTaches(prev => prev.filter(t => t.id !== id));
      toast('Tâche supprimée');
    } catch {
      toast('Erreur lors de la suppression', 'error');
    }
  };

  const filtered = taches.filter(t =>
    t.titre?.toLowerCase().includes(search.toLowerCase()) ||
    t.assignee?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="page-enter">
      <h1>Tâches</h1>
      <p className="page-subtitle">Gérez et suivez vos tâches d'équipe</p>

      <form onSubmit={handleSubmit}>
        <input name="titre" placeholder="Titre *" value={form.titre} onChange={handleChange} required />
        <input name="description" placeholder="Description" value={form.description} onChange={handleChange} style={{ minWidth: 200 }} />
        <select name="statut" value={form.statut} onChange={handleChange}>
          <option value="todo">À faire</option>
          <option value="in_progress">En cours</option>
          <option value="done">Terminé</option>
        </select>
        <input name="assignee" placeholder="Assigné à" value={form.assignee} onChange={handleChange} />
        <button type="submit" disabled={saving}>
          {saving ? <><span className="spinner" /> Ajout...</> : '+ Ajouter'}
        </button>
      </form>

      <div className="page-toolbar">
        <input
          className="search-input"
          placeholder="Rechercher..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <span className="record-count">{filtered.length} tâche{filtered.length !== 1 ? 's' : ''}</span>
      </div>

      <table>
        <thead>
          <tr>
            <th>Titre</th>
            <th>Description</th>
            <th>Statut</th>
            <th>Assigné à</th>
            <th>Créé le</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {loading && (
            <tr className="loading-row">
              <td colSpan="6"><span className="spinner dark" /> Chargement...</td>
            </tr>
          )}
          {!loading && filtered.map(t => (
            <tr key={t.id}>
              <td style={{ fontWeight: 500 }}>{t.titre}</td>
              <td style={{ color: '#666' }}>{t.description}</td>
              <td><StatusBadge statut={t.statut} /></td>
              <td>{t.assignee || <span style={{ color: '#bbb' }}>—</span>}</td>
              <td style={{ color: '#888', fontSize: '0.85rem' }}>
                {t.created_at ? new Date(t.created_at).toLocaleDateString('fr-FR') : '—'}
              </td>
              <td>
                <button className="danger" onClick={() => handleDelete(t.id)}>Supprimer</button>
              </td>
            </tr>
          ))}
          {!loading && filtered.length === 0 && (
            <tr>
              <td colSpan="6">
                <div className="empty-state">
                  <div className="empty-state-icon">✓</div>
                  <p>{search ? 'Aucune tâche ne correspond à la recherche' : 'Aucune tâche pour le moment'}</p>
                </div>
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
