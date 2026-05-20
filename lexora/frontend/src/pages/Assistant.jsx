import { useState, useRef, useEffect } from 'react';

function fmtTime(date) {
  return date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
}

export default function Assistant() {
  const [messages, setMessages] = useState([]);
  const [input, setInput]       = useState('');
  const [loading, setLoading]   = useState(false);
  const bottomRef               = useRef(null);
  const inputRef                = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const sendMessage = async e => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMsg = { role: 'user', text: input.trim(), time: new Date() };
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
      setMessages(prev => [
        ...prev,
        { role: 'assistant', text: data.response || data.error || 'Pas de réponse', time: new Date() },
      ]);
    } catch {
      setMessages(prev => [
        ...prev,
        { role: 'assistant', text: 'Erreur de connexion à Ollama.', time: new Date() },
      ]);
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  };

  return (
    <div className="page-enter">
      <h1>Assistant IA</h1>
      <p className="page-subtitle">Posez vos questions à votre assistant Lexora</p>

      <div className="chat-box">
        <div className="chat-messages">
          {messages.length === 0 && !loading && (
            <div style={{ textAlign: 'center', margin: 'auto', color: '#aaa' }}>
              <div style={{ fontSize: '2.5rem', marginBottom: 12 }}>◈</div>
              <p style={{ fontSize: '0.95rem' }}>Bonjour ! Comment puis-je vous aider ?</p>
              <p style={{ fontSize: '0.82rem', marginTop: 6 }}>
                Posez une question sur vos tâches, factures ou votre activité.
              </p>
            </div>
          )}

          {messages.map((msg, i) => (
            <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: msg.role === 'user' ? 'flex-end' : 'flex-start' }}>
              <div className={`message ${msg.role}`}>{msg.text}</div>
              <span className="message-meta" style={{ textAlign: msg.role === 'user' ? 'right' : 'left' }}>
                {msg.role === 'user' ? 'Vous' : 'Lexora IA'} · {fmtTime(msg.time)}
              </span>
            </div>
          ))}

          {loading && (
            <div>
              <div className="message assistant typing-dots">
                <span /><span /><span />
              </div>
              <span className="message-meta">Lexora IA répond...</span>
            </div>
          )}

          <div ref={bottomRef} />
        </div>

        <form className="chat-input" onSubmit={sendMessage}>
          <input
            ref={inputRef}
            type="text"
            placeholder={loading ? 'En attente de la réponse...' : 'Votre message...'}
            value={input}
            onChange={e => setInput(e.target.value)}
            disabled={loading}
          />
          <button type="submit" disabled={loading || !input.trim()}>
            {loading ? <span className="spinner" /> : 'Envoyer'}
          </button>
        </form>
      </div>
    </div>
  );
}
