import { useEffect, useState } from 'react';

export default function Dashboard() {
  const [taches, setTaches] = useState([]);
  const [factures, setFactures] = useState([]);

  useEffect(() => {
    fetch('/api/taches').then(r => r.json()).then(setTaches).catch(() => {});
    fetch('/api/factures').then(r => r.json()).then(setFactures).catch(() => {});
  }, []);

  const tachesEnCours = taches.filter(t => t.statut === 'in_progress').length;
  const facturesImpayees = factures.filter(f => f.statut === 'en attente').length;
  const totalFactures = factures.reduce((sum, f) => sum + (f.montant || 0), 0);

  return (
    <div>
      <h1>Dashboard</h1>
      <p style={{ marginBottom: '24px', color: '#666' }}>Bienvenue sur Lexora — votre ERP intelligent.</p>
      <div className="stats-grid">
        <div className="stat-card">
          <div className="number">{taches.length}</div>
          <div className="label">Taches totales</div>
        </div>
        <div className="stat-card">
          <div className="number">{tachesEnCours}</div>
          <div className="label">En cours</div>
        </div>
        <div className="stat-card">
          <div className="number">{factures.length}</div>
          <div className="label">Factures</div>
        </div>
        <div className="stat-card">
          <div className="number">{facturesImpayees}</div>
          <div className="label">En attente</div>
        </div>
        <div className="stat-card">
          <div className="number">{totalFactures.toFixed(0)} €</div>
          <div className="label">Volume total</div>
        </div>
      </div>
    </div>
  );
}
