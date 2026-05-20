import { useState, useEffect } from 'react'; // Corrigé : Import de useEffect ajouté

// Structure initiale avec gestion des dossiers et des fichiers
const initialItems = [
  { id: 'f1', name: 'Chantier Avril 2026', type: 'folder', description: 'Toutes les pièces comptables et justificatifs du chantier de rénovation', parentId: null },
  { id: 'f2', name: 'Ressources Humaines', type: 'folder', description: 'Contrats, fiches de paie et documents administratifs généraux', parentId: null },
  { id: 1, name: 'Facture_EDF_Avril2026.pdf', type: 'Facture', size: '1.2 MB', date: '12/04/2026', status: 'Traité', description: 'Facture électricité compteur principal', parentId: null },
  { id: 2, name: 'Achat_Fils_Cuivre_6mm.pdf', type: 'Facture', size: '450 KB', date: '18/04/2026', status: 'Vérifié', description: 'Fournitures pour raccordement atelier', parentId: 'f1' },
  { id: 3, name: 'Fiche_Paie_Mars_2026.pdf', type: 'Fiche de paie', size: '850 KB', date: '31/03/2026', status: 'Traité', description: 'Bulletin de salaire Paul', parentId: 'f2' },
  { id: 4, name: 'Contrat_Prestation_Lexora.pdf', type: 'Contrat', size: '2.4 MB', date: '15/01/2026', status: 'Vérifié', description: 'Contrat cadre développement initial', parentId: 'f2' },
];

export default function Factures() {
  const [items, setItems] = useState(initialItems);
  const [currentFolderId, setCurrentFolderId] = useState(null); // null = Racine (Root)
  const [dragActive, setDragActive] = useState(false);
  
  // States pour la création de dossier
  const [showFolderForm, setShowFolderForm] = useState(false);
  const [folderName, setFolderName] = useState('');
  const [folderDesc, setFolderDesc] = useState('');

  // Filtrer les éléments à afficher selon le dossier actuel
  const currentItems = items.filter(item => item.parentId === currentFolderId);

  // --- COUPLAGE IA (FUNCTION CALLING) ---
  // Placé proprement à l'intérieur du composant, synchronisé avec l'état 'items'
  useEffect(() => {
    window.lexoraAddDocument = (name, category, size) => {
      const newDoc = {
        id: Date.now(),
        name,
        type: category || 'Document',
        size: size || '42 KB',
        date: new Date().toLocaleDateString('fr-FR'),
        status: 'Chiffré & Traité',
        description: 'Document stocké automatiquement par l\'assistant Lexora.',
        parentId: currentFolderId // Très puissant : l'IA range le doc LA où l'utilisateur se trouve !
      };

      setItems(prevItems => [newDoc, ...prevItems]);
      return `Le document "${name}" a été chiffré et sauvegardé avec succès dans le dossier actuel.`;
    };

    return () => {
      delete window.lexoraAddDocument;
    };
  }, [currentFolderId]); // Re-déclenche si on change de dossier pour que l'IA écrive au bon endroit

  // Construire le chemin (Fil d'Ariane) pour la navigation
  const getBreadcrumbs = () => {
    const crumbs = [];
    let currentId = currentFolderId;
    while (currentId !== null) {
      const folder = items.find(item => item.id === currentId);
      if (folder) {
        crumbs.unshift(folder);
        currentId = folder.parentId;
      } else {
        break;
      }
    }
    return crumbs;
  };

  // Création d'un nouveau dossier
  const handleCreateFolder = (e) => {
    e.preventDefault();
    if (!folderName.trim()) return;

    const newFolder = {
      id: 'f_' + Date.now(),
      name: folderName,
      type: 'folder',
      description: folderDesc,
      parentId: currentFolderId
    };

    setItems([...items, newFolder]);
    setFolderName('');
    setFolderDesc('');
    setShowFolderForm(false);
  };

  // Ajouter un fichier (Simulé)
  const addNewFile = (fileName, fileSize) => {
    const newFile = {
      id: Date.now(),
      name: fileName,
      type: fileName.toLowerCase().includes('facture') ? 'Facture' : 'Document',
      size: typeof fileSize === 'number' ? `${(fileSize / (1024 * 1024)).toFixed(2)} MB` : fileSize,
      date: new Date().toLocaleDateString('fr-FR'),
      status: 'En cours d\'analyse...',
      description: 'Déposé via l\'interface',
      parentId: currentFolderId 
    };
    setItems([newFile, ...items]);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      addNewFile(file.name, file.size);
    }
  };

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <div>
          <h1 style={styles.title}>📁 Coffre-fort Documentaire</h1>
          <p style={styles.subtitle}>Organisez vos fichiers en dossiers et laissez l'IA extraire les données importantes.</p>
        </div>
      </header>

      {/* Barre d'outils et Fil d'Ariane */}
      <div style={styles.toolbar}>
        <div style={styles.breadcrumbs}>
          <span 
            style={{ ...styles.crumbLink, fontWeight: currentFolderId === null ? '700' : '400' }}
            onClick={() => setCurrentFolderId(null)}
          >
            🏠 Racine
          </span>
          {getBreadcrumbs().map((crumb) => (
            <span key={crumb.id}>
              <span style={styles.crumbSeparator}>/</span>
              <span 
                style={{ ...styles.crumbLink, fontWeight: currentFolderId === crumb.id ? '700' : '400' }}
                onClick={() => setCurrentFolderId(crumb.id)}
              >
                {crumb.name}
              </span>
            </span>
          ))}
        </div>

        <button 
          onClick={() => setShowFolderForm(!showFolderForm)} 
          style={styles.secondaryButton}
        >
          📁 {showFolderForm ? 'Annuler' : 'Nouveau dossier'}
        </button>
      </div>

      {/* Formulaire de création de dossier */}
      {showFolderForm && (
        <form onSubmit={handleCreateFolder} style={styles.folderForm}>
          <input 
            type="text" 
            placeholder="Nom du dossier (ex: Chantier Matériel)" 
            value={folderName}
            onChange={(e) => setFolderName(e.target.value)}
            style={styles.input}
            required
          />
          <input 
            type="text" 
            placeholder="Description, notes ou mots-clés..." 
            value={folderDesc}
            onChange={(e) => setFolderDesc(e.target.value)}
            style={styles.input}
          />
          <button type="submit" style={styles.primaryButton}>Créer le dossier</button>
        </form>
      )}

      {/* Zone de Drag & Drop */}
      <div 
        style={{
          ...styles.dropZone,
          backgroundColor: dragActive ? '#e3f2fd' : '#ffffff',
          borderColor: dragActive ? '#2196f3' : '#cccccc'
        }}
        onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
        onDragLeave={() => setDragActive(false)}
        onDrop={handleDrop}
      >
        <span style={{ fontSize: '2rem' }}>📤</span>
        <p style={{ margin: '5px 0', fontWeight: '500', fontSize: '0.9rem' }}>
          Glissez un fichier ici pour l'ajouter au dossier actuel
        </p>
        <label style={styles.inlineUpload}>
          ou parcourez vos fichiers
          <input type="file" style={{ display: 'none' }} onChange={(e) => e.target.files[0] && addNewFile(e.target.files[0].name, e.target.files[0].size)} />
        </label>
      </div>

      {/* Grille et Tableau Adaptatifs */}
      <div style={styles.explorerCard}>
        <div style={styles.tableWrapper}>
          <table style={styles.table}>
            <thead>
              <tr style={styles.thRow}>
                <th style={styles.th}>Nom</th>
                <th style={styles.th}>Description</th>
                <th style={styles.th}>Détails</th>
                <th style={styles.th}>Statut / Type</th>
              </tr>
            </thead>
            <tbody>
              {currentItems.length === 0 && (
                <tr>
                  <td colSpan="4" style={styles.emptyTd}>Ce dossier est vide. Glissez-y des fichiers pour commencer.</td>
                </tr>
              )}

              {currentItems.map((item) => {
                const isFolder = item.type === 'folder';
                return (
                  <tr 
                    key={item.id} 
                    style={styles.tr}
                    onClick={() => isFolder && setCurrentFolderId(item.id)}
                  >
                    <td style={{ ...styles.td, fontWeight: '500', cursor: isFolder ? 'pointer' : 'default' }}>
                      <span style={{ marginRight: '8px', fontSize: '1.1rem' }}>{isFolder ? '📁' : '📄'}</span>
                      <span style={{ color: isFolder ? '#111' : '#1e88e5' }}>{item.name}</span>
                    </td>

                    <td style={{ ...styles.td, color: '#666', fontSize: '0.85rem' }}>
                      {item.description || <em style={{ color: '#bbb' }}>Aucune description</em>}
                    </td>

                    <td style={styles.td}>
                      {isFolder ? <span style={{ color: '#999' }}>Dossier</span> : item.size}
                    </td>

                    <td style={styles.td}>
                      {isFolder ? (
                        <span style={styles.badgeFolder}>Dossier</span>
                      ) : (
                        <span style={{
                          ...styles.badgeStatus,
                          backgroundColor: item.status.includes('cours') ? '#fff3e0' : '#e8f5e9',
                          color: item.status.includes('cours') ? '#f57c00' : '#2e7d32',
                        }}>
                          {item.status}
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ... Les styles restent inchangés et fonctionnels ...
const styles = {
  container: { padding: '30px', fontFamily: 'system-ui, -apple-system, sans-serif', backgroundColor: '#f8f9fa', minHeight: '100vh' },
  header: { marginBottom: '20px' },
  title: { fontSize: '1.6rem', fontWeight: '700', margin: 0 },
  subtitle: { margin: '5px 0 0 0', color: '#666', fontSize: '0.9rem' },
  
  toolbar: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#fff', padding: '12px 20px', borderRadius: '10px', border: '1px solid #eee', marginBottom: '15px', gap: '10px', flexWrap: 'wrap' },
  breadcrumbs: { display: 'flex', alignItems: 'center', fontSize: '0.9rem', flexWrap: 'wrap' },
  crumbLink: { cursor: 'pointer', color: '#111', ':hover': { textDecoration: 'underline' } },
  crumbSeparator: { margin: '0 8px', color: '#ccc' },
  
  folderForm: { display: 'flex', gap: '10px', backgroundColor: '#fff', padding: '15px', borderRadius: '10px', border: '1px solid #eee', marginBottom: '15px', flexWrap: 'wrap' },
  input: { padding: '8px 12px', borderRadius: '6px', border: '1px solid #ccc', fontSize: '0.9rem', flex: '1', minWidth: '200px' },
  primaryButton: { backgroundColor: '#111', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: '6px', fontWeight: '500', cursor: 'pointer' },
  secondaryButton: { backgroundColor: '#fff', color: '#333', border: '1px solid #ccc', padding: '8px 16px', borderRadius: '6px', fontWeight: '500', cursor: 'pointer' },
  
  dropZone: { border: '2px dashed #ccc', borderRadius: '10px', padding: '20px', textAlign: 'center', marginBottom: '20px', cursor: 'pointer', transition: 'all 0.2s' },
  inlineUpload: { color: '#1e88e5', textDecoration: 'underline', cursor: 'pointer', fontSize: '0.9rem', fontWeight: '500' },
  
  explorerCard: { backgroundColor: '#fff', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.02)', border: '1px solid #eee', overflow: 'hidden' },
  tableWrapper: { overflowX: 'auto' },
  table: { width: '100%', borderCollapse: 'collapse', fontSize: '0.88rem', textAlign: 'left' },
  thRow: { borderBottom: '2px solid #eee', backgroundColor: '#fafafa' },
  th: { padding: '12px 15px', color: '#666', fontWeight: '600' },
  tr: { borderBottom: '1px solid #f5f5f5', ':hover': { backgroundColor: '#f9f9f9' } },
  td: { padding: '14px 15px', color: '#333', verticalAlign: 'middle' },
  emptyTd: { padding: '40px', textAlign: 'center', color: '#999', fontStyle: 'italic' },
  
  badgeStatus: { padding: '4px 8px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: '600' },
  badgeFolder: { backgroundColor: '#e0f7fa', color: '#006064', padding: '4px 8px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: '600' }
};