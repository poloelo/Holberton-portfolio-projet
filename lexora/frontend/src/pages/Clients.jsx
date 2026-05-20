import { useState, useEffect } from 'react';
import { useToast } from '../contexts/ToastContext.jsx';

export default function Clients() {
  const [clients, setClients] = useState([]);
  const [nom, setNom]         = useState('');
  const [email, setEmail]     = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving]   = useState(false);
  const [search, setSearch]   = useState('');
  const toast = useToast();

  const load = () =>
    fetch('/api/clients')
      .then(r => r.json())
      .then(data => { setClients(Array.isArray(data) ? data : []); setLoading(false); })
      .catch(() => { toast('Erreur lors du chargement', 'error'); setLoading(false); });

  useEffect(() => { load(); }, []);

  const ajouter = async e => {
    e.preventDefault();
    if (!nom.trim()) return;
    setSaving(true);
    try {
      await fetch('/api/clients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nom, email }),
      });
      setNom(''); setEmail('');
      await load();
      toast('Client ajouté avec succès');
    } catch {
      toast('Erreur lors de l\'ajout', 'error');
    } finally {
      setSaving(false);
    }
  };

  const supprimer = async id => {
    try {
      await fetch(`/api/clients/${id}`, { method: 'DELETE' });
      setClients(prev => prev.filter(c => c.id !== id));
      toast('Client supprimé');
    } catch {
      toast('Erreur lors de la suppression', 'error');
    }
  };

  const filtered = clients.filter(c =>
    c.nom?.toLowerCase().includes(search.toLowerCase()) ||
    c.email?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="page-enter">
      <h1>Clients</h1>
      <p className="page-subtitle">Gérez votre portefeuille clients</p>

      <form onSubmit={ajouter}>
        <input
          value={nom}
          onChange={e => setNom(e.target.value)}
          placeholder="Nom du client *"
          required
        />
        <input
          value={email}
          onChange={e => setEmail(e.target.value)}
          placeholder="Email"
          type="email"
        />
        <button type="submit" disabled={saving}>
          {saving ? <><span className="spinner" /> Ajout...</> : '+ Ajouter'}
        </button>
      </form>

      <div className="page-toolbar">
        <input
          className="search-input"
          placeholder="Rechercher un client..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <span className="record-count">{filtered.length} client{filtered.length !== 1 ? 's' : ''}</span>
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
            <div className="empty-state-icon">◉</div>
            <p>{search ? 'Aucun client ne correspond à la recherche' : 'Aucun client pour le moment'}</p>
          </div>
        </div>
      ) : (
        <div className="client-list">
          {filtered.map(c => (
            <div key={c.id} className="client-item">
              <div className="client-info">
                <span className="client-name">{c.nom}</span>
                {c.email && <span className="client-email">{c.email}</span>}
              </div>
              <button className="danger" onClick={() => supprimer(c.id)}>Supprimer</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
