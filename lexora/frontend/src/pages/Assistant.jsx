import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useState, useEffect, useRef } from 'react';

export default function Assistant() {
  // Unification des états (doublons supprimés)
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [image, setImage] = useState(null); 
  const [loading, setLoading] = useState(false);
  
  const fileInputRef = useRef(null); 
  const messagesEndRef = useRef(null);

  // CHARGEMENT UNIQUE DE L'HISTORIQUE DEPUIS LE SERVEUR AU MONTAGE DE LA PAGE
  useEffect(() => {
    const loadHistory = async () => {
      try {
        const response = await fetch('http://localhost:3000/api/assistant/history');
        if (response.ok) {
          const historyFromServer = await response.json();
          // Le serveur renvoie [{ role: 'user', text: '...' }, { role: 'assistant', text: '...' }]
          setMessages(historyFromServer);
        }
      } catch (err) {
        console.error("Erreur lors du chargement de l'historique :", err);
      }
    };

    loadHistory();
  }, []); // S'exécute uniquement à l'ouverture de la page de l'assistant

  // Auto-scroll vers le bas à chaque nouveau message ou indicateur de chargement
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const handleImageChange = (e) => {
    setImage(e.target.files[0]);
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if ((!input.trim() && !image) || loading) return;

    const formData = new FormData();
    formData.append('prompt', input);
    if (image) formData.append('image', image);

    // Maintien de l'affichage utilisateur en local
    const userMsg = { 
        role: 'user', 
        text: input || "Analyse de cette image...",
        imagePreview: image ? URL.createObjectURL(image) : null 
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setImage(null);
    if (fileInputRef.current) fileInputRef.current.value = ""; 
    setLoading(true);

    try {
      const res = await fetch('http://localhost:3000/api/assistant', { 
        method: 'POST',
        body: formData, 
      });
      const data = await res.json();
      
      // --- LOGIQUE D'INTERCEPTION DE L'ACTION (FUNCTION CALLING) ---
      let actionFeedback = "";
      
      if (data.action) {
        const { functionName, arguments: args } = data.action;
        
        // Est-ce que la fonction existe sur la page actuelle ?
        if (window[functionName]) {
          try {
            // Exécution dynamique de la méthode exposée sur l'objet window
            actionFeedback = window[functionName](...Object.values(args));
          } catch (execErr) {
            actionFeedback = `❌ Échec de l'exécution automatique : ${execErr.message}`;
          }
        } else {
          actionFeedback = `⚠️ L'action "${functionName}" a été demandée par Lexora, mais elle n'est pas disponible sur cet écran. Navigue sur la page concernée pour l'exécuter.`;
        }
      }

      // Formatage de la réponse finale de l'assistant
      const assistantMsg = { role: 'assistant', text: data.response || 'Pas de réponse' };
      
      // Injection du retour système graphique dans le flux markdown de la conversation
      if (actionFeedback) {
        assistantMsg.text += `\n\n&nbsp;\n\n> 🤖 **Action système exécutée :** ${actionFeedback}`;
      }

      setMessages(prev => [...prev, assistantMsg]);

    } catch (err) {
      setMessages(prev => [...prev, { role: 'assistant', text: 'Erreur de connexion au serveur.' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '900px', margin: '20px auto', fontFamily: 'system-ui, -apple-system, sans-serif', padding: '0 20px' }}>
      <h2 style={{ fontSize: '1.6rem', fontWeight: '700', marginBottom: '5px' }}>🤖 Assistant Lexora</h2>
      <p style={{ color: '#666', fontSize: '0.9rem', margin: '0 0 20px 0' }}>Propulsé par Gemma 4 Vision • Connecté à votre espace de travail</p>
      
      <div style={{ border: '1px solid #eee', padding: '20px', height: '550px', overflowY: 'auto', borderRadius: '12px', background: '#ffffff', boxShadow: '0 4px 12px rgba(0,0,0,0.02)' }}>
        
        {messages.map((msg, i) => (
          <div key={i} style={{ 
            margin: '15px 0', 
            padding: '15px', 
            borderRadius: '12px',
            backgroundColor: msg.role === 'user' ? '#e3f2fd' : '#f8f9fa',
            border: msg.role === 'user' ? '1px solid #c2e2ff' : '1px solid #eee',
            maxWidth: '85%',
            marginLeft: msg.role === 'user' ? 'auto' : '0',
          }}>
            <strong style={{ color: msg.role === 'user' ? '#1565c0' : '#333', fontSize: '0.85rem' }}>
              {msg.role === 'user' ? '👤 Vous' : '✨ Lexora'}
            </strong>
            
            {msg.imagePreview && (
                <img src={msg.imagePreview} alt="upload" style={{ display: 'block', maxWidth: '200px', marginTop: '10px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }} />
            )}

            <div className="markdown-content" style={{ marginTop: '8px', fontSize: '0.95rem', lineHeight: '1.5', color: '#222' }}>
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {msg.text}
              </ReactMarkdown>
            </div>
          </div>
        ))}

        {loading && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#666', fontStyle: 'italic', fontSize: '0.9rem', margin: '15px 0' }}>
            <span style={{ display: 'inline-block', animation: 'spin 1s linear infinite' }}>✨</span> Lexora analyse votre demande...
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* --- FORMULAIRE D'INPUT --- */}
      <form onSubmit={sendMessage} style={{ marginTop: '15px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <div style={{ display: 'flex', gap: '10px' }}>
            <input 
              style={{ flex: 1, padding: '12px 15px', borderRadius: '8px', border: '1px solid #ccc', fontSize: '0.95rem', outline: 'none' }}
              value={input} 
              onChange={e => setInput(e.target.value)} 
              placeholder="Ex: Planifie une intervention de maintenance demain à 14h..."
            />
            <button type="submit" disabled={loading} style={{ padding: '12px 24px', cursor: 'pointer', backgroundColor: '#2196f3', color: 'white', border: 'none', borderRadius: '8px', fontWeight: '600', transition: 'background 0.2s' }}>
                Envoyer
            </button>
        </div>
        
        <div style={{ backgroundColor: '#f1f3f5', padding: '8px 12px', borderRadius: '6px', display: 'inline-flex', alignItems: 'center', width: 'fit-content' }}>
          <input 
              type="file" 
              accept="image/*" 
              onChange={handleImageChange}
              ref={fileInputRef}
              style={{ fontSize: '0.82rem', color: '#555' }}
          />
        </div>
      </form>
    </div>
  );
}