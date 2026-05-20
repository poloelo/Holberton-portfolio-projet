import { useState } from 'react';

// Données fictives pour simuler l'inventaire et les besoins d'achats
const initialDemandes = [
  { id: 1, article: 'Câbles RJ45 Cat6 (Lot de 10)', qte: 3, departement: 'IT / Infra', urgence: 'Haute', statut: 'Approuvé' },
  { id: 2, article: 'Licences Logiciel CAO (Annuel)', qte: 2, departement: 'Bureau d\'études', urgence: 'Moyenne', statut: 'En attente' },
  { id: 3, article: 'Écrans 27 pouces 4K', qte: 5, departement: 'Logistique', urgence: 'Basse', statut: 'Commandé' },
];

export default function Taches() {
  const [demandes, setDemandes] = useState(initialDemandes);
  const [newArticle, setNewArticle] = useState('');
  const [newQte, setNewQte] = useState(1);
  const [newDept, setNewDept] = useState('Général');
  const [newUrgence, setNewUrgence] = useState('Moyenne');

  // Ajouter un besoin d'achat sur le tas
  const handleAddDemande = (e) => {
    e.preventDefault();
    if (!newArticle.trim()) return;

    const nouvelleEnseigne = {
      id: demandes.length + 1,
      article: newArticle,
      qte: parseInt(newQte),
      departement: newDept,
      urgency: newUrgence,
      statut: 'Validé par l\'IA' // Clin d'œil au futur traitement automatique
    };

    setDemandes([nouvelleEnseigne, ...demandes]);
    setNewArticle('');
    setNewQte(1);
  };

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <h1 style={styles.title}>⚙️ Approvisionnements & Inventaire</h1>
        <p style={styles.subtitle}>Déclarez un besoin de matériel ou un article à acheter. L'IA centralise et prépare les commandes.</p>
      </header>

      {/* Formulaire adaptatif : l'employé remplit ça sur le terrain */}
      <div style={styles.card}>
        <h3 style={{ marginTop: 0, marginBottom: '15px' }}>➕ Signaler un besoin / Article manquant</h3>
        <form onSubmit={handleAddDemande} style={styles.form}>
          <div style={styles.inputGroup}>
            <label style={styles.label}>Nom de l'article / composant</label>
            <input 
              type="text" 
              placeholder="Ex: Disjoncteur 16A, Cartouches d'encre..." 
              value={newArticle} 
              onChange={(e) => setNewArticle(e.target.value)}
              style={styles.input}
              required
            />
          </div>

          <div style={styles.rowInputs}>
            <div style={{ ...styles.inputGroup, flex: 1 }}>
              <label style={styles.label}>Quantité</label>
              <input 
                type="number" 
                min="1" 
                value={newQte} 
                onChange={(e) => setNewQte(e.target.value)}
                style={styles.input}
              />
            </div>

            <div style={{ ...styles.inputGroup, flex: 2 }}>
              <label style={styles.label}>Priorité</label>
              <select 
                value={newUrgence} 
                onChange={(e) => setNewUrgence(e.target.value)}
                style={styles.select}
              >
                <option value="Basse">🟢 Basse</option>
                <option value="Moyenne">🟡 Moyenne</option>
                <option value="Haute">🔴 Haute</option>
              </select>
            </div>
          </div>

          <button type="submit" style={styles.button}>Ajouter à la liste d'achat</button>
        </form>
      </div>

      {/* Liste de suivi */}
      <div style={styles.card}>
        <h3 style={{ marginTop: 0, marginBottom: '15px' }}>📋 Demandes de réapprovisionnement en cours</h3>
        <div style={styles.tableWrapper}>
          <table style={styles.table}>
            <thead>
              <tr style={styles.thRow}>
                <th style={styles.th}>Article</th>
                <th style={styles.th}>Quantité</th>
                <th style={styles.th}>Urgence</th>
                <th style={styles.th}>Statut</th>
              </tr>
            </thead>
            <tbody>
              {demandes.map((item) => (
                <tr key={item.id} style={styles.tr}>
                  <td style={{ ...styles.td, fontWeight: '500' }}>{item.article}</td>
                  <td style={styles.td}>x{item.qte}</td>
                  <td style={styles.td}>
                    <span style={{
                      ...styles.badge,
                      backgroundColor: item.urgence === 'Haute' ? '#ffebee' : item.urgence === 'Moyenne' ? '#fff3e0' : '#e8f5e9',
                      color: item.urgence === 'Haute' ? '#c62828' : item.urgence === 'Moyenne' ? '#ef6c00' : '#2e7d32'
                    }}>
                      {item.urgence}
                    </span>
                  </td>
                  <td style={styles.td}>
                    <span style={{ ...styles.statusDot, backgroundColor: item.statut === 'Commandé' ? '#4caf50' : '#2196f3' }}></span>
                    {item.statut}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    padding: '30px',
    fontFamily: 'system-ui, -apple-system, sans-serif',
    backgroundColor: '#f8f9fa',
    minHeight: '100vh',
  },
  header: { marginBottom: '25px' },
  title: { fontSize: '1.8rem', fontWeight: '700', margin: 0 },
  subtitle: { margin: '5px 0 0 0', color: '#666', fontSize: '0.95rem' },
  card: {
    backgroundColor: '#fff',
    borderRadius: '12px',
    padding: '20px',
    boxShadow: '0 4px 6px rgba(0,0,0,0.02)',
    border: '1px solid #eee',
    marginBottom: '25px',
  },
  form: { display: 'flex', flexDirection: 'column', gap: '15px' },
  inputGroup: { display: 'flex', flexDirection: 'column', gap: '5px' },
  label: { fontSize: '0.85rem', fontWeight: '600', color: '#555' },
  input: {
    padding: '10px',
    borderRadius: '6px',
    border: '1px solid #ccc',
    fontSize: '0.95rem',
  },
  rowInputs: { display: 'flex', gap: '15px' },
  select: {
    padding: '10px',
    borderRadius: '6px',
    border: '1px solid #ccc',
    fontSize: '0.95rem',
    backgroundColor: '#fff',
  },
  button: {
    backgroundColor: '#111',
    color: '#fff',
    border: 'none',
    padding: '12px',
    borderRadius: '6px',
    fontSize: '0.95rem',
    fontWeight: '600',
    cursor: 'pointer',
    marginTop: '5px',
  },
  tableWrapper: { overflowX: 'auto' },
  table: { width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' },
  thRow: { borderBottom: '2px solid #eee', textAlign: 'left' },
  th: { padding: '12px 10px', color: '#666' },
  tr: { borderBottom: '1px solid #f1f1f1' },
  td: { padding: '12px 10px' },
  badge: { padding: '3px 8px', borderRadius: '4px', fontSize: '0.8rem', fontWeight: '600' },
  statusDot: {
    display: 'inline-block',
    width: '8px',
    height: '8px',
    borderRadius: '50%',
    marginRight: '8px',
  }
};