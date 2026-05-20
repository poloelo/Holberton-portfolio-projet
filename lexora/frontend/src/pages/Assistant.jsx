import { useState, useRef } from 'react'; // Ajout de useRef
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

export default function Assistant() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [image, setImage] = useState(null); // Pour stocker le fichier
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef(null); // Pour vider l'input fichier après envoi

  const handleImageChange = (e) => {
    setImage(e.target.files[0]);
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if ((!input.trim() && !image) || loading) return;

    // Création d'un FormData (indispensable pour envoyer des fichiers)
    const formData = new FormData();
    formData.append('prompt', input);
    if (image) formData.append('image', image);

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
      // ATTENTION : On enlève le header 'Content-Type' car le navigateur le gère seul avec FormData
      const res = await fetch('http://localhost:3000/api/assistant', { 
        method: 'POST',
        body: formData, 
      });
      const data = await res.json();
      setMessages(prev => [...prev, { role: 'assistant', text: data.response || 'Pas de réponse' }]);
    } catch (err) {
      setMessages(prev => [...prev, { role: 'assistant', text: 'Erreur de connexion au serveur.' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '900px', margin: '20px auto', fontFamily: 'Arial' }}>
      <h2>Assistant Lexora (Gemma 4 Vision)</h2>
      <div style={{ border: '1px solid #ddd', padding: '20px', height: '600px', overflowY: 'auto', borderRadius: '10px', background: '#fcfcfc' }}>
        
        {messages.map((msg, i) => (
          <div key={i} style={{ 
            margin: '10px 0', 
            padding: '15px', 
            borderRadius: '10px',
            backgroundColor: msg.role === 'user' ? '#e3f2fd' : '#ffffff',
            border: msg.role === 'user' ? '1px solid #bbdefb' : '1px solid #eee',
          }}>
            <strong>{msg.role === 'user' ? 'Vous :' : 'Lexora :'}</strong>
            
            {/* Si le message contient une image, on l'affiche */}
            {msg.imagePreview && (
                <img src={msg.imagePreview} alt="upload" style={{ display: 'block', maxWidth: '200px', marginTop: '10px', borderRadius: '5px' }} />
            )}

            <div className="markdown-content" style={{ marginTop: '10px' }}>
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {msg.text}
              </ReactMarkdown>
            </div>
          </div>
        ))}

        {loading && <p><em>Lexora analyse les données...</em></p>}
      </div>

      <form onSubmit={sendMessage} style={{ marginTop: '10px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <div style={{ display: 'flex', gap: '10px' }}>
            <input 
              style={{ flex: 1, padding: '10px' }}
              value={input} 
              onChange={e => setInput(e.target.value)} 
              placeholder="Posez une question ou décrivez l'image..."
            />
            <button type="submit" disabled={loading} style={{ padding: '10px 20px', cursor: 'pointer', backgroundColor: '#2196F3', color: 'white', border: 'none', borderRadius: '5px' }}>
                Envoyer
            </button>
        </div>
        
        <input 
            type="file" 
            accept="image/*" 
            onChange={handleImageChange}
            ref={fileInputRef}
            style={{ fontSize: '0.8em' }}
        />
      </form>
    </div>
  );
}