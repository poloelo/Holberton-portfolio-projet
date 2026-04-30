import { useEffect, useState } from 'react';

const defaultForm = { client: '', montant: '', statut: 'en attente', date_emission: '', date_echeance: '' };

export default function Factures() {
  const [factures, setFactures] = useState([]);
  const [form, setForm] = useState(defaultForm);

  const load = () => fetch('/api/factures').then(r => r.json()).then(setFactures);

  useEffect(() => { load(); }, []);

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async e => {
    e.preventDefault();
    await fetch('/api/factures', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, montant: parseFloat(form.montant) }),
    });
    setForm(defaultForm);
    load();
  };

  const handleDelete = async id => {
    await fetch(`/api/factures/${id}`, { method: 'DELETE' });
    load();
  };

  return (
    <div>
      <h1>Factures</h1>
      <form onSubmit={handleSubmit}>
        <input name="client" placeholder="Client *" value={form.client} onChange={handleChange} required />
        <input name="montant" type="number" placeholder="Montant (€) *" value={form.montant} onChange={handleChange} required />
        <select name="statut" value={form.statut} onChange={handleChange}>
          <option value="en attente">En attente</option>
          <option value="payee">Payee</option>
          <option value="annulee">Annulee</option>
        </select>
        <input name="date_emission" type="date" placeholder="Date emission" value={form.date_emission} onChange={handleChange} />
        <input name="date_echeance" type="date" placeholder="Date echeance" value={form.date_echeance} onChange={handleChange} />
        <button type="submit">Ajouter</button>
      </form>
      <table>
        <thead>
          <tr>
            <th>Client</th>
            <th>Montant</th>
            <th>Statut</th>
            <th>Emission</th>
            <th>Echeance</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {factures.map(f => (
            <tr key={f.id}>
              <td>{f.client}</td>
              <td>{f.montant} €</td>
              <td>{f.statut}</td>
              <td>{f.date_emission}</td>
              <td>{f.date_echeance}</td>
              <td>
                <button className="danger" onClick={() => handleDelete(f.id)}>Supprimer</button>
              </td>
            </tr>
          ))}
          {factures.length === 0 && (
            <tr><td colSpan="6" style={{ textAlign: 'center', color: '#999' }}>Aucune facture</td></tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
