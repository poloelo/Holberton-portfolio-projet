import { useState, useEffect } from 'react';

export default function Clients() {
  const [clients, setClients] = useState([]);
  const [nom, setNom] = useState('');
  const [email, setEmail] = useState('');

  useEffect(() => {
    fetch('/api/clients')
      .then(r => r.json())
      .then(setClients);
  }, []);

  const ajouter = async () => {
    if (!nom) return;
    await fetch('/api/clients', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nom, email })
    });
    setNom(''); setEmail('');
    fetch('/api/clients').then(r => r.json()).then(setClients);
  };

  const supprimer = async (id) => {
    await fetch(`/api/clients/${id}`, { method: 'DELETE' });
    setClients(clients.filter(c => c.id !== id));
  };

  return (
    <div className="page">
      <h1>Clients</h1>
      <div className="form-row">
        <input value={nom} onChange={e => setNom(e.target.value)} placeholder="Nom du client..." />
        <input value={email} onChange={e => setEmail(e.target.value)} placeholder="Email..." />
        <button onClick={ajouter}>Ajouter</button>
      </div>
      <ul className="list">
        {clients.map(c => (
          <li key={c.id} className="list-item">
            <span>{c.nom} — {c.email}</span>
            <button onClick={() => supprimer(c.id)}>Supprimer</button>
          </li>
        ))}
      </ul>
    </div>
  );
}
