import { useState } from 'react';

export default function Assistant() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const sendMessage = async e => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMsg = { role: 'user', text: input.trim() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const res = await fetch('/api/assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: userMsg.text }),
      });
      const data = await res.json();
      setMessages(prev => [...prev, { role: 'assistant', text: data.response || data.error || 'Pas de reponse' }]);
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', text: 'Erreur de connexion a Ollama.' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1>Assistant IA</h1>
      <div className="chat-box">
        <div className="chat-messages">
          {messages.length === 0 && (
            <p style={{ color: '#999', textAlign: 'center', marginTop: '20px' }}>
              Posez une question a votre assistant Lexora...
            </p>
          )}
          {messages.map((msg, i) => (
            <div key={i} className={`message ${msg.role}`}>
              {msg.text}
            </div>
          ))}
          {loading && <div className="message assistant">...</div>}
        </div>
        <form className="chat-input" onSubmit={sendMessage}>
          <input
            type="text"
            placeholder="Votre message..."
            value={input}
            onChange={e => setInput(e.target.value)}
            disabled={loading}
          />
          <button type="submit" disabled={loading}>Envoyer</button>
        </form>
      </div>
    </div>
  );
}
