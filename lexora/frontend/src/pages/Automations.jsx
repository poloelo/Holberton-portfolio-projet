import { useState, useEffect } from 'react';
import { useToast } from '../contexts/ToastContext.jsx';

const ADMIN_KEY = 'LEXORA_ADMIN_SECRET_2024';
const headers = { 'Content-Type': 'application/json', 'x-admin-key': ADMIN_KEY };

export default function Automations() {
  const [automations, setAutomations] = useState([]);
  const [nom, setNom]                 = useState('');
  const [action, setAction]           = useState('');
  const [loading, setLoading]         = useState(true);
  const [saving, setSaving]           = useState(false);
  const [search, setSearch]           = useState('');
  const toast = useToast();

  const load = () =>
    fetch('/api/automations', { headers })
      .then(r => r.json())
      .then(data => { setAutomations(Array.isArray(data) ? data : []); setLoading(false); })
      .catch(() => { toast('Erreur lors du chargement', 'error'); setLoading(false); });

  useEffect(() => { load(); }, []);

  const ajouter = async e => {
    e.preventDefault();
    if (!nom.trim()) return;
    setSaving(true);
    try {
      await fetch('/api/automations', {
        method: 'POST',
        headers,
        body: JSON.stringify({ nom, action }),
      });
      setNom(''); setAction('');
      await load();
      toast('Automation ajoutée avec succès');
    } catch {
      toast('Erreur lors de l\'ajout', 'error');
    } finally {
      setSaving(false);
    }
  };

  const supprimer = async id => {
    try {
      await fetch(`/api/automations/${id}`, { method: 'DELETE', headers });
      setAutomations(prev => prev.filter(a => a.id !== id));
      toast('Automation supprimée');
    } catch {
      toast('Erreur lors de la suppression', 'error');
    }
  };

  const filtered = automations.filter(a =>
    a.nom?.toLowerCase().includes(search.toLowerCase()) ||
    a.action?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="page-enter">
      <h1>
        Automations{' '}
        <span className="badge badge-cancelled" style={{ fontSize: '0.7rem', verticalAlign: 'middle' }}>
          Admin
        </span>
      </h1>
      <p className="page-subtitle">Automatisez vos processus — accès administrateur requis</p>

      <form onSubmit={ajouter}>
        <input value={nom}    onChange={e => setNom(e.target.value)}    placeholder="Nom de l'automation *" required />
        <input value={action} onChange={e => setAction(e.target.value)} placeholder="Action déclenchée" style={{ minWidth: 220 }} />
        <button type="submit" disabled={saving}>
          {saving ? <><span className="spinner" /> Ajout...</> : '+ Ajouter'}
        </button>
      </form>

      <div className="page-toolbar">
        <input
          className="search-input"
          placeholder="Rechercher une automation..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <span className="record-count">{filtered.length} automation{filtered.length !== 1 ? 's' : ''}</span>
      </div>

      {loading ? (
        <div className="client-list">
          {[1, 2, 3].map(i => (
            <div key={i} className="client-item">
              <div className="client-info">
                <div className="skeleton" style={{ width: 150, height: 16 }} />
                <div className="skeleton" style={{ width: 200, height: 13, marginTop: 5 }} />
              </div>
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="client-list">
          <div className="empty-state">
            <div className="empty-state-icon">⚙</div>
            <p>{search ? 'Aucune automation ne correspond à la recherche' : 'Aucune automation configurée'}</p>
          </div>
        </div>
      ) : (
        <div className="client-list">
          {filtered.map(a => (
            <div key={a.id} className="client-item">
              <div className="client-info">
                <span className="client-name">{a.nom}</span>
                {a.action && <span className="client-email">⚡ {a.action}</span>}
              </div>
              <button className="danger" onClick={() => supprimer(a.id)}>Supprimer</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
