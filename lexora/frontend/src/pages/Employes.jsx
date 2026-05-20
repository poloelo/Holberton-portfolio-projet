import { useState, useEffect } from 'react';

const ADMIN_KEY = 'LEXORA_ADMIN_SECRET_2024';

export default function Employes() {
  const [employes, setEmployes] = useState([]);
  const [nom, setNom] = useState('');
  const [poste, setPoste] = useState('');

  const headers = {
    'Content-Type': 'application/json',
    'x-admin-key': ADMIN_KEY
  };

  useEffect(() => {
    fetch('/api/employes', { headers })
      .then(r => r.json())
      .then(setEmployes);
  }, []);

  const ajouter = async () => {
    if (!nom) return;
    await fetch('/api/employes', {
      method: 'POST',
      headers,
      body: JSON.stringify({ nom, poste })
    });
    setNom(''); setPoste('');
    fetch('/api/employes', { headers }).then(r => r.json()).then(setEmployes);
  };

  const supprimer = async (id) => {
    await fetch(`/api/employes/${id}`, { method: 'DELETE', headers });
    setEmployes(employes.filter(e => e.id !== id));
  };

  return (
    <div className="page">
      <h1>Employes <span className="badge-admin">Admin</span></h1>
      <div className="form-row">
        <input value={nom} onChange={e => setNom(e.target.value)} placeholder="Nom de l'employe..." />
        <input value={poste} onChange={e => setPoste(e.target.value)} placeholder="Poste..." />
        <button onClick={ajouter}>Ajouter</button>
      </div>
      <ul className="list">
        {employes.map(e => (
          <li key={e.id} className="list-item">
            <span>{e.nom} — {e.poste}</span>
            <button onClick={() => supprimer(e.id)}>Supprimer</button>
          </li>
        ))}
      </ul>
    </div>
  );
}
