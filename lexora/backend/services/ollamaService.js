// Tableau pour stocker l'historique global côté serveur (Mémoire de session)
let conversationHistory = [];

/**
 * Service d'interaction avec Ollama (Gemma 4)
 * @param {string} prompt - Le message de l'utilisateur
 * @param {string|null} imageBase64 - L'image convertie en base64 (optionnel)
 */
export async function chat(prompt, imageBase64 = null) {
  try {
    // 1. Préparation du Contexte Temporel Dynamique
    const now = new Date();
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    const dateConst = now.toLocaleDateString('fr-FR', options);
    const isoToday = now.toISOString().split('T')[0];

    const systemPrompt = `
Vous êtes Lexora, l'assistant IA central d'une application d'organisation.
CONTEXTE TEMPOREL STRICT : Nous sommes le ${dateConst}. La date du jour au format ISO est impérativement "${isoToday}".

COMPORTEMENT :
- Réponds en français de manière directe et amicale (tutoiement naturel).
- Analyse l'historique de la conversation pour comprendre le contexte des demandes.

DIRECTIVES DE DATE/HEURE (IMPÉRATIF) :
- "Demain" correspond à la date du jour (${isoToday}) + 1 jour.
- Formate TOUJOURS les dates au format ISO : YYYY-MM-DD.
- Formate TOUJOURS les heures au format 24h : HH:MM (ex: "14:00"). Ne sois jamais flou.

FORMAT DE SORTIE ACTION :
Si l'utilisateur veut planifier quelque chose ou sauvegarder un document, tu dois impérativement inclure un bloc JSON strict à la toute fin de ta réponse.
- Planifier : {"functionName": "lexoraAddEvent", "arguments": {"title": "...", "date": "YYYY-MM-DD", "time": "HH:MM", "type": "Intervention|Livraison|Réunion|Échéance", "desc": "..."}}
- Stocker : {"functionName": "lexoraAddDocument", "arguments": {"name": "...", "category": "Facture|Contrat|Fiche de paie|Général"}}
`;

    // 2. Initialisation ou mise à jour de l'historique
    if (conversationHistory.length === 0) {
      conversationHistory.push({ role: 'system', content: systemPrompt });
    }

    // Objet message pour Ollama
    const userMessage = { role: 'user', content: prompt || "Analyse de l'image intégrée." };
    
    // Si Gemma 4 Vision a besoin de l'image, Ollama attend un tableau de chaînes base64 dans la clé 'images'
    if (imageBase64) {
      userMessage.images = [imageBase64];
    }

    conversationHistory.push(userMessage);

    // 3. Appel effectif à l'API Ollama locale
    const ollamaResponse = await fetch('http://127.0.0.1:11434/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'gemma4', // Ajuste si ton modèle local s'appelle différemment (ex: gemma2, llava...)
        messages: conversationHistory.map(msg => ({
          role: msg.role,
          content: msg.content,
          ...(msg.images && { images: msg.images })
        })),
        stream: false
      })
    });

    if (!ollamaResponse.ok) {
      throw new Error(`Erreur Ollama Core: ${ollamaResponse.status}`);
    }

    const ollamaData = await ollamaResponse.json();
    const aiRawText = ollamaData.message.content;

    // Enregistrement de la réponse dans la mémoire globale
    conversationHistory.push({ role: 'assistant', content: aiRawText });

    // 4. Extraction de l'action si présente dans le texte de l'IA
    let detectedAction = null;
    const jsonMatch = aiRawText.match(/\{"functionName".*?\}/s);
    
    if (jsonMatch) {
      try {
        detectedAction = JSON.parse(jsonMatch[0]);
      } catch (e) {
        console.error("Erreur d'extraction JSON :", e.message);
      }
    }

    // On nettoie le texte pour enlever le bloc JSON brut de l'affichage utilisateur
    const cleanText = aiRawText.replace(/\{"functionName".*?\}/s, '').trim();

    // On retourne un objet complet au routeur
    return {
      text: cleanText || aiRawText,
      action: detectedAction
    };

  } catch (error) {
    console.error("Erreur Service Ollama :", error);
    throw error;
  }
}

// Fonction bonus pour vider la mémoire si tu crées un bouton reset
export function clearHistory() {
  conversationHistory = [];
}