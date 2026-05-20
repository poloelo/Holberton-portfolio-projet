import { useEffect, useState } from 'react';
import { useToast } from '../contexts/ToastContext.jsx';

const defaultForm = { employe: '', date: '', heure_debut: '', heure_fin: '', projet: '' };

function fmtDate(d) {
  if (!d) return '—';
  return new Date(d + 'T00:00:00').toLocaleDateString('fr-FR', {
    weekday: 'short', day: 'numeric', month: 'short',
  });
}

export default function Planning() {
  const [entries, setEntries] = useState([]);
  const [form, setForm]       = useState(defaultForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving]   = useState(false);
  const [search, setSearch]   = useState('');
  const toast = useToast();

  const load = () =>
    fetch('/api/planning')
      .then(r => r.json())
      .then(data => { setEntries(Array.isArray(data) ? data : []); setLoading(false); })
      .catch(() => { toast('Erreur lors du chargement', 'error'); setLoading(false); });

  useEffect(() => { load(); }, []);

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async e => {
    e.preventDefault();
    setSaving(true);
    try {
      await fetch('/api/planning', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      setForm(defaultForm);
      await load();
      toast('Entrée ajoutée au planning');
    } catch {
      toast('Erreur lors de l\'ajout', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async id => {
    try {
      await fetch(`/api/planning/${id}`, { method: 'DELETE' });
      setEntries(prev => prev.filter(e => e.id !== id));
      toast('Entrée supprimée');
    } catch {
      toast('Erreur lors de la suppression', 'error');
    }
  };

  const filtered = entries.filter(e =>
    e.employe?.toLowerCase().includes(search.toLowerCase()) ||
    e.projet?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="page-enter">
      <h1>Planning</h1>
      <p className="page-subtitle">Planifiez les horaires de votre équipe</p>

      <form onSubmit={handleSubmit}>
        <input name="employe"    placeholder="Employé *"  value={form.employe}    onChange={handleChange} required />
        <input name="date"       type="date"               value={form.date}       onChange={handleChange} required />
        <input name="heure_debut" type="time"              value={form.heure_debut} onChange={handleChange} required />
        <input name="heure_fin"  type="time"               value={form.heure_fin}  onChange={handleChange} required />
        <input name="projet"     placeholder="Projet"      value={form.projet}     onChange={handleChange} />
        <button type="submit" disabled={saving}>
          {saving ? <><span className="spinner" /> Ajout...</> : '+ Ajouter'}
        </button>
      </form>

      <div className="page-toolbar">
        <input
          className="search-input"
          placeholder="Rechercher employé ou projet..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <span className="record-count">{filtered.length} entrée{filtered.length !== 1 ? 's' : ''}</span>
      </div>

      <table>
        <thead>
          <tr>
            <th>Employé</th>
            <th>Date</th>
            <th>Début</th>
            <th>Fin</th>
            <th>Durée</th>
            <th>Projet</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {loading && (
            <tr className="loading-row">
              <td colSpan="7"><span className="spinner dark" /> Chargement...</td>
            </tr>
          )}
          {!loading && filtered.map(e => {
            const duration = (() => {
              if (!e.heure_debut || !e.heure_fin) return null;
              const [h1, m1] = e.heure_debut.split(':').map(Number);
              const [h2, m2] = e.heure_fin.split(':').map(Number);
              const mins = (h2 * 60 + m2) - (h1 * 60 + m1);
              if (mins <= 0) return null;
              return `${Math.floor(mins / 60)}h${mins % 60 > 0 ? (mins % 60) + 'min' : ''}`;
            })();
            return (
              <tr key={e.id}>
                <td style={{ fontWeight: 500 }}>{e.employe}</td>
                <td style={{ color: '#555' }}>{fmtDate(e.date)}</td>
                <td>{e.heure_debut}</td>
                <td>{e.heure_fin}</td>
                <td>
                  {duration && (
                    <span className="badge badge-in-progress">{duration}</span>
                  )}
                </td>
                <td style={{ color: '#666' }}>{e.projet || <span style={{ color: '#bbb' }}>—</span>}</td>
                <td>
                  <button className="danger" onClick={() => handleDelete(e.id)}>Supprimer</button>
                </td>
              </tr>
            );
          })}
          {!loading && filtered.length === 0 && (
            <tr>
              <td colSpan="7">
                <div className="empty-state">
                  <div className="empty-state-icon">◫</div>
                  <p>{search ? 'Aucune entrée ne correspond à la recherche' : 'Aucune entrée dans le planning'}</p>
                </div>
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
