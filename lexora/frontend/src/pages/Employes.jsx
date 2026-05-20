import { useState, useEffect } from 'react';
import { useToast } from '../contexts/ToastContext.jsx';

const ADMIN_KEY = 'LEXORA_ADMIN_SECRET_2024';
const headers = { 'Content-Type': 'application/json', 'x-admin-key': ADMIN_KEY };

export default function Employes() {
  const [employes, setEmployes] = useState([]);
  const [nom, setNom]           = useState('');
  const [poste, setPoste]       = useState('');
  const [loading, setLoading]   = useState(true);
  const [saving, setSaving]     = useState(false);
  const [search, setSearch]     = useState('');
  const toast = useToast();

  const load = () =>
    fetch('/api/employes', { headers })
      .then(r => r.json())
      .then(data => { setEmployes(Array.isArray(data) ? data : []); setLoading(false); })
      .catch(() => { toast('Erreur lors du chargement', 'error'); setLoading(false); });

  useEffect(() => { load(); }, []);

  const ajouter = async e => {
    e.preventDefault();
    if (!nom.trim()) return;
    setSaving(true);
    try {
      await fetch('/api/employes', {
        method: 'POST',
        headers,
        body: JSON.stringify({ nom, poste }),
      });
      setNom(''); setPoste('');
      await load();
      toast('Employé ajouté avec succès');
    } catch {
      toast('Erreur lors de l\'ajout', 'error');
    } finally {
      setSaving(false);
    }
  };

  const supprimer = async id => {
    try {
      await fetch(`/api/employes/${id}`, { method: 'DELETE', headers });
      setEmployes(prev => prev.filter(e => e.id !== id));
      toast('Employé supprimé');
    } catch {
      toast('Erreur lors de la suppression', 'error');
    }
  };

  const filtered = employes.filter(e =>
    e.nom?.toLowerCase().includes(search.toLowerCase()) ||
    e.poste?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="page-enter">
      <h1>
        Employés{' '}
        <span className="badge badge-cancelled" style={{ fontSize: '0.7rem', verticalAlign: 'middle' }}>
          Admin
        </span>
      </h1>
      <p className="page-subtitle">Gestion des employés — accès administrateur requis</p>

      <form onSubmit={ajouter}>
        <input value={nom}   onChange={e => setNom(e.target.value)}   placeholder="Nom de l'employé *" required />
        <input value={poste} onChange={e => setPoste(e.target.value)} placeholder="Poste" />
        <button type="submit" disabled={saving}>
          {saving ? <><span className="spinner" /> Ajout...</> : '+ Ajouter'}
        </button>
      </form>

      <div className="page-toolbar">
        <input
          className="search-input"
          placeholder="Rechercher un employé..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <span className="record-count">{filtered.length} employé{filtered.length !== 1 ? 's' : ''}</span>
      </div>

      {loading ? (
        <div className="client-list">
          {[1, 2, 3].map(i => (
            <div key={i} className="client-item">
              <div className="client-info">
                <div className="skeleton" style={{ width: 140, height: 16 }} />
                <div className="skeleton" style={{ width: 100, height: 13, marginTop: 5 }} />
              </div>
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="client-list">
          <div className="empty-state">
            <div className="empty-state-icon">◎</div>
            <p>{search ? 'Aucun employé ne correspond à la recherche' : 'Aucun employé enregistré'}</p>
          </div>
        </div>
      ) : (
        <div className="client-list">
          {filtered.map(e => (
            <div key={e.id} className="client-item">
              <div className="client-info">
                <span className="client-name">{e.nom}</span>
                {e.poste && <span className="client-email">{e.poste}</span>}
              </div>
              <button className="danger" onClick={() => supprimer(e.id)}>Supprimer</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
