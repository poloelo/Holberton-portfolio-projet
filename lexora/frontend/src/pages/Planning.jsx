import { useEffect, useState } from 'react';

const defaultForm = { employe: '', date: '', heure_debut: '', heure_fin: '', projet: '' };

export default function Planning() {
  const [entries, setEntries] = useState([]);
  const [form, setForm] = useState(defaultForm);

  const load = () => fetch('/api/planning').then(r => r.json()).then(setEntries);

  useEffect(() => { load(); }, []);

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async e => {
    e.preventDefault();
    await fetch('/api/planning', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });
    setForm(defaultForm);
    load();
  };

  const handleDelete = async id => {
    await fetch(`/api/planning/${id}`, { method: 'DELETE' });
    load();
  };

  return (
    <div>
      <h1>Planning</h1>
      <form onSubmit={handleSubmit}>
        <input name="employe" placeholder="Employe *" value={form.employe} onChange={handleChange} required />
        <input name="date" type="date" placeholder="Date *" value={form.date} onChange={handleChange} required />
        <input name="heure_debut" type="time" placeholder="Debut *" value={form.heure_debut} onChange={handleChange} required />
        <input name="heure_fin" type="time" placeholder="Fin *" value={form.heure_fin} onChange={handleChange} required />
        <input name="projet" placeholder="Projet" value={form.projet} onChange={handleChange} />
        <button type="submit">Ajouter</button>
      </form>
      <table>
        <thead>
          <tr>
            <th>Employe</th>
            <th>Date</th>
            <th>Debut</th>
            <th>Fin</th>
            <th>Projet</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {entries.map(e => (
            <tr key={e.id}>
              <td>{e.employe}</td>
              <td>{e.date}</td>
              <td>{e.heure_debut}</td>
              <td>{e.heure_fin}</td>
              <td>{e.projet}</td>
              <td>
                <button className="danger" onClick={() => handleDelete(e.id)}>Supprimer</button>
              </td>
            </tr>
          ))}
          {entries.length === 0 && (
            <tr><td colSpan="6" style={{ textAlign: 'center', color: '#999' }}>Aucune entree</td></tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
