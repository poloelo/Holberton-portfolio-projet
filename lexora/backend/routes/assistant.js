import { Router } from 'express';
import { chat } from '../services/ollamaService.js';
import multer from 'multer';

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

// On utilise upload.single('image') pour capturer le fichier envoyé par le frontend
router.post('/', upload.single('image'), async (req, res) => {
  const { prompt } = req.body;
  const imageFile = req.file;

  if (!prompt && !imageFile) {
    return res.status(400).json({ error: 'Prompt ou image requis' });
  }

  try {
    let imageBase64 = null;
    if (imageFile) {
      imageBase64 = imageFile.buffer.toString('base64');
    }

    // Le service renvoie désormais { text, action }
    const result = await chat(prompt, imageBase64);
    
    // On renvoie le format attendu par ton composant Assistant.jsx
    res.json({ 
      response: result.text, 
      action: result.action 
    });
    
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur Ollama', details: err.message });
  }
});

export default router;