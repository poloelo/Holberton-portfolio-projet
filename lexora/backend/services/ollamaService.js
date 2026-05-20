import axios from 'axios';

export const chat = async (prompt, imageBase64 = null) => {
  try {
    const payload = {
      model: 'gemma4', // Assure-toi d'avoir fait "ollama run gemma4"
      messages: [
        {
          role: 'user',
          content: prompt || "Analyse cette image",
          // Ollama attend un tableau d'images en base64
          images: imageBase64 ? [imageBase64] : []
        }
      ],
      stream: false // Pour avoir la réponse d'un coup
    };

    const res = await axios.post('http://localhost:11434/api/chat', payload);
    return res.data.message.content;
  } catch (err) {
    throw new Error('Impossible de contacter Ollama : ' + err.message);
  }
};