import { useState, useEffect } from 'react';
import { useToast } from '../contexts/ToastContext.jsx';

export default function Todos() {
  const [todos, setTodos]     = useState([]);
  const [titre, setTitre]     = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving]   = useState(false);
  const toast = useToast();

  const load = () =>
    fetch('/api/todos')
      .then(r => r.json())
      .then(data => { setTodos(Array.isArray(data) ? data : []); setLoading(false); })
      .catch(() => { toast('Erreur lors du chargement', 'error'); setLoading(false); });

  useEffect(() => { load(); }, []);

  const ajouter = async e => {
    e.preventDefault();
    if (!titre.trim()) return;
    setSaving(true);
    try {
      await fetch('/api/todos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ titre }),
      });
      setTitre('');
      await load();
      toast('Todo ajouté');
    } catch {
      toast('Erreur lors de l\'ajout', 'error');
    } finally {
      setSaving(false);
    }
  };

  const supprimer = async id => {
    try {
      await fetch(`/api/todos/${id}`, { method: 'DELETE' });
      setTodos(prev => prev.filter(t => t.id !== id));
      toast('Todo supprimé');
    } catch {
      toast('Erreur lors de la suppression', 'error');
    }
  };

  return (
    <div className="page-enter">
      <h1>Todos</h1>
      <p className="page-subtitle">Votre liste de tâches rapides</p>

      <form onSubmit={ajouter}>
        <input
          value={titre}
          onChange={e => setTitre(e.target.value)}
          placeholder="Nouvelle tâche rapide..."
          style={{ flex: 1, minWidth: 240 }}
        />
        <button type="submit" disabled={saving}>
          {saving ? <><span className="spinner" /> Ajout...</> : '+ Ajouter'}
        </button>
      </form>

      {loading ? (
        <div className="client-list">
          {[1, 2, 3].map(i => (
            <div key={i} className="client-item">
              <div className="skeleton" style={{ width: '60%', height: 16 }} />
            </div>
          ))}
        </div>
      ) : todos.length === 0 ? (
        <div className="client-list">
          <div className="empty-state">
            <div className="empty-state-icon">☑</div>
            <p>Aucun todo pour le moment</p>
          </div>
        </div>
      ) : (
        <div className="client-list">
          {todos.map(t => (
            <div key={t.id} className="client-item">
              <span style={{ fontWeight: 500 }}>{t.titre}</span>
              <button className="danger" onClick={() => supprimer(t.id)}>Supprimer</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
