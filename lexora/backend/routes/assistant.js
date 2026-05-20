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
    
    // Si une image est présente, on la convertit en Base64 pour Ollama
    if (imageFile) {
      imageBase64 = imageFile.buffer.toString('base64');
    }

    // On envoie le prompt et l'image (si elle existe) au service Ollama
    const response = await chat(prompt, imageBase64);
    
    res.json({ response });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur Ollama', details: err.message });
  }
});

export default router;