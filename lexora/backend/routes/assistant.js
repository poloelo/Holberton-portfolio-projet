import { Router } from 'express';
import { chat } from '../services/ollamaService.js';

const router = Router();

router.post('/', async (req, res) => {
  const { prompt } = req.body;
  if (!prompt) return res.status(400).json({ error: 'prompt requis' });
  try {
    const response = await chat(prompt);
    res.json({ response });
  } catch (err) {
    res.status(500).json({ error: 'Erreur Ollama', details: err.message });
  }
});

export default router;
