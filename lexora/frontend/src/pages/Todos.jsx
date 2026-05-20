import { useState, useEffect } from 'react';

export default function Todos() {
  const [todos, setTodos] = useState([]);
  const [titre, setTitre] = useState('');

  useEffect(() => {
    fetch('/api/todos')
      .then(r => r.json())
      .then(setTodos);
  }, []);

  const ajouter = async () => {
    if (!titre) return;
    await fetch('/api/todos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ titre })
    });
    setTitre('');
    fetch('/api/todos').then(r => r.json()).then(setTodos);
  };

  const supprimer = async (id) => {
    await fetch(`/api/todos/${id}`, { method: 'DELETE' });
    setTodos(todos.filter(t => t.id !== id));
  };

  return (
    <div className="page">
      <h1>Todos</h1>
      <div className="form-row">
        <input
          value={titre}
          onChange={e => setTitre(e.target.value)}
          placeholder="Nouvelle tâche..."
        />
        <button onClick={ajouter}>Ajouter</button>
      </div>
      <ul className="list">
        {todos.map(t => (
          <li key={t.id} className="list-item">
            <span>{t.titre}</span>
            <button onClick={() => supprimer(t.id)}>Supprimer</button>
          </li>
        ))}
      </ul>
    </div>
  );
}
