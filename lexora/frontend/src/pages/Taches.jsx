import { useEffect, useState } from 'react';

const defaultForm = { titre: '', description: '', statut: 'todo', assignee: '' };

export default function Taches() {
  const [taches, setTaches] = useState([]);
  const [form, setForm] = useState(defaultForm);

  const load = () => fetch('/api/taches').then(r => r.json()).then(setTaches);

  useEffect(() => { load(); }, []);

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async e => {
    e.preventDefault();
    await fetch('/api/taches', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });
    setForm(defaultForm);
    load();
  };

  const handleDelete = async id => {
    await fetch(`/api/taches/${id}`, { method: 'DELETE' });
    load();
  };

  return (
    <div>
      <h1>Taches</h1>
      <form onSubmit={handleSubmit}>
        <input name="titre" placeholder="Titre *" value={form.titre} onChange={handleChange} required />
        <input name="description" placeholder="Description" value={form.description} onChange={handleChange} />
        <select name="statut" value={form.statut} onChange={handleChange}>
          <option value="todo">A faire</option>
          <option value="in_progress">En cours</option>
          <option value="done">Termine</option>
        </select>
        <input name="assignee" placeholder="Assignee" value={form.assignee} onChange={handleChange} />
        <button type="submit">Ajouter</button>
      </form>
      <table>
        <thead>
          <tr>
            <th>Titre</th>
            <th>Description</th>
            <th>Statut</th>
            <th>Assignee</th>
            <th>Cree le</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {taches.map(t => (
            <tr key={t.id}>
              <td>{t.titre}</td>
              <td>{t.description}</td>
              <td>{t.statut}</td>
              <td>{t.assignee}</td>
              <td>{t.created_at}</td>
              <td>
                <button className="danger" onClick={() => handleDelete(t.id)}>Supprimer</button>
              </td>
            </tr>
          ))}
          {taches.length === 0 && (
            <tr><td colSpan="6" style={{ textAlign: 'center', color: '#999' }}>Aucune tache</td></tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
