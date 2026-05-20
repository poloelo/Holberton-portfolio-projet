import { useEffect, useState } from 'react';
import { useToast } from '../contexts/ToastContext.jsx';

const defaultForm = {
  client: '', montant: '', statut: 'en attente',
  date_emission: '', date_echeance: '',
};

const STATUTS = {
  'en attente': { label: 'En attente', cls: 'badge-pending' },
  payee:        { label: 'Payée',      cls: 'badge-paid' },
  annulee:      { label: 'Annulée',    cls: 'badge-cancelled' },
};

function StatusBadge({ statut }) {
  const s = STATUTS[statut] || { label: statut, cls: 'badge-pending' };
  return <span className={`badge ${s.cls}`}>{s.label}</span>;
}

function fmtDate(d) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('fr-FR');
}

function fmtMontant(m) {
  return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(m);
}

export default function Factures() {
  const [factures, setFactures] = useState([]);
  const [form, setForm]         = useState(defaultForm);
  const [loading, setLoading]   = useState(true);
  const [saving, setSaving]     = useState(false);
  const [search, setSearch]     = useState('');
  const toast = useToast();

  const load = () =>
    fetch('/api/factures')
      .then(r => r.json())
      .then(data => { setFactures(Array.isArray(data) ? data : []); setLoading(false); })
      .catch(() => { toast('Erreur lors du chargement', 'error'); setLoading(false); });

  useEffect(() => { load(); }, []);

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async e => {
    e.preventDefault();
    setSaving(true);
    try {
      await fetch('/api/factures', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, montant: parseFloat(form.montant) }),
      });
      setForm(defaultForm);
      await load();
      toast('Facture ajoutée avec succès');
    } catch {
      toast('Erreur lors de l\'ajout', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async id => {
    try {
      await fetch(`/api/factures/${id}`, { method: 'DELETE' });
      setFactures(prev => prev.filter(f => f.id !== id));
      toast('Facture supprimée');
    } catch {
      toast('Erreur lors de la suppression', 'error');
    }
  };

  const filtered = factures.filter(f =>
    f.client?.toLowerCase().includes(search.toLowerCase())
  );

  const totalFiltered = filtered.reduce((s, f) => s + (f.montant || 0), 0);

  return (
    <div className="page-enter">
      <h1>Factures</h1>
      <p className="page-subtitle">Suivi de vos factures clients</p>

      <form onSubmit={handleSubmit}>
        <input name="client"       placeholder="Client *"       value={form.client}       onChange={handleChange} required />
        <input name="montant"      type="number" placeholder="Montant (€) *" value={form.montant} onChange={handleChange} required min="0" step="0.01" />
        <select name="statut" value={form.statut} onChange={handleChange}>
          <option value="en attente">En attente</option>
          <option value="payee">Payée</option>
          <option value="annulee">Annulée</option>
        </select>
        <input name="date_emission" type="date" value={form.date_emission} onChange={handleChange} />
        <input name="date_echeance" type="date" value={form.date_echeance} onChange={handleChange} />
        <button type="submit" disabled={saving}>
          {saving ? <><span className="spinner" /> Ajout...</> : '+ Ajouter'}
        </button>
      </form>

      <div className="page-toolbar">
        <input
          className="search-input"
          placeholder="Rechercher par client..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <span className="record-count">
          {filtered.length} facture{filtered.length !== 1 ? 's' : ''} · Total : {fmtMontant(totalFiltered)}
        </span>
      </div>

      <table>
        <thead>
          <tr>
            <th>Client</th>
            <th>Montant</th>
            <th>Statut</th>
            <th>Émission</th>
            <th>Échéance</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {loading && (
            <tr className="loading-row">
              <td colSpan="6"><span className="spinner dark" /> Chargement...</td>
            </tr>
          )}
          {!loading && filtered.map(f => (
            <tr key={f.id}>
              <td style={{ fontWeight: 500 }}>{f.client}</td>
              <td style={{ fontWeight: 600, color: '#1a1d2e' }}>{fmtMontant(f.montant)}</td>
              <td><StatusBadge statut={f.statut} /></td>
              <td style={{ color: '#888', fontSize: '0.85rem' }}>{fmtDate(f.date_emission)}</td>
              <td style={{ color: '#888', fontSize: '0.85rem' }}>{fmtDate(f.date_echeance)}</td>
              <td>
                <button className="danger" onClick={() => handleDelete(f.id)}>Supprimer</button>
              </td>
            </tr>
          ))}
          {!loading && filtered.length === 0 && (
            <tr>
              <td colSpan="6">
                <div className="empty-state">
                  <div className="empty-state-icon">€</div>
                  <p>{search ? 'Aucune facture ne correspond à la recherche' : 'Aucune facture pour le moment'}</p>
                </div>
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
