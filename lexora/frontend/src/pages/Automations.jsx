import { useState, useEffect } from 'react';

const ADMIN_KEY = 'LEXORA_ADMIN_SECRET_2024';

export default function Automations() {
  const [automations, setAutomations] = useState([]);
  const [nom, setNom] = useState('');
  const [action, setAction] = useState('');

  const headers = {
    'Content-Type': 'application/json',
    'x-admin-key': ADMIN_KEY
  };

  useEffect(() => {
    fetch('/api/automations', { headers })
      .then(r => r.json())
      .then(setAutomations);
  }, []);

  const ajouter = async () => {
    if (!nom) return;
    await fetch('/api/automations', {
      method: 'POST',
      headers,
      body: JSON.stringify({ nom, action })
    });
    setNom(''); setAction('');
    fetch('/api/automations', { headers }).then(r => r.json()).then(setAutomations);
  };

  const supprimer = async (id) => {
    await fetch(`/api/automations/${id}`, { method: 'DELETE', headers });
    setAutomations(automations.filter(a => a.id !== id));
  };

  return (
    <div className="page">
      <h1>Automations <span className="badge-admin">Admin</span></h1>
      <div className="form-row">
        <input value={nom} onChange={e => setNom(e.target.value)} placeholder="Nom de l'automation..." />
        <input value={action} onChange={e => setAction(e.target.value)} placeholder="Action..." />
        <button onClick={ajouter}>Ajouter</button>
      </div>
      <ul className="list">
        {automations.map(a => (
          <li key={a.id} className="list-item">
            <span>{a.nom} — {a.action}</span>
            <button onClick={() => supprimer(a.id)}>Supprimer</button>
          </li>
        ))}
      </ul>
    </div>
  );
}
