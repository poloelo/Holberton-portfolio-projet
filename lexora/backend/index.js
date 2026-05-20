import express from 'express';
import multer from 'multer';

const router = express.Router();
const upload = multer(); // Configuration pour intercepter le FormData (et les images)

// Tableau en mémoire vive pour stocker l'historique des messages côté serveur
let conversationHistory = [];

// 1. ROUTE PRINCIPALE : Réception des messages et appels à l'IA
router.post('/', upload.single('image'), async (req, res) => {
  try {
    const userPrompt = req.body.prompt;
    const uploadedFile = req.file; // Contient l'image si elle a été transmise

    // Génération du contexte de temps dynamique (Gemma sait exactement quel jour on est)
    const now = new Date();
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    const dateConst = now.toLocaleDateString('fr-FR', options);
    const isoToday = now.toISOString().split('T')[0];

    // System prompt ultra-précis pour brider le comportement et forcer le format des dates
    const systemPrompt = `
Vous êtes Lexora, l'assistant IA centralisé d'une application d'organisation professionnelle.
CONTEXTE TEMPOREL STRICT : Nous sommes le ${dateConst}. La date du jour au format ISO est impérativement "${isoToday}".

COMPORTEMENT & MEMOIRE :
- Vous parlez un français clair, direct, amical (tutoiement de rigueur).
- Vous analysez l'historique fourni pour comprendre les requêtes relatives (ex: "fais-le à la même heure").

DIRECTIVES DE DATE ET HEURE POUR LE FUNCTION CALLING :
- "Demain" correspond mathématiquement à la date du jour (${isoToday}) + 1 jour.
- Formatez TOUJOURS les dates au format ISO : YYYY-MM-DD (Ex: 2026-05-21).
- Formatez TOUJOURS les heures au format 24h : HH:MM (Ex: 14:00). Ne soyez jamais flou.

FORMAT DE SORTIE IMPÉRATIF :
Si l'utilisateur demande une action (planifier un rendez-vous ou sauvegarder un document), vous devez impérativement inclure un bloc d'action à la fin de votre réponse textuelle. Vos décisions doivent se traduire par l'appel d'une de ces fonctions :
1. Pour planifier : {"functionName": "lexoraAddEvent", "arguments": {"title": "...", "date": "YYYY-MM-DD", "time": "HH:MM", "type": "Intervention|Livraison|Réunion|Échéance", "desc": "..."}}
2. Pour stocker un doc : {"functionName": "lexoraAddDocument", "arguments": {"name": "...", "category": "Facture|Contrat|Fiche de paie|Général"}}
`;

    // Initialisation du premier message système si l'historique est neuf
    if (conversationHistory.length === 0) {
      conversationHistory.push({ role: 'system', content: systemPrompt });
    }

    // Sauvegarde du message de l'utilisateur dans la mémoire du serveur
    conversationHistory.push({ role: 'user', content: userPrompt || "Analyse du fichier image joint..." });

    // =========================================================================
    // [ICI] ZONE DE CONNEXION AVEC TON MODÈLE GEMMA (Ollama ou autre API)
    // Tu dois passer l'intégralité du tableau `conversationHistory` à ton modèle.
    // =========================================================================
    
    // Simulation d'une détection par l'IA (Exemple si l'utilisateur dit de noter un truc pour demain)
    let aiTextResponse = "Je m'en occupe tout de suite, c'est ajouté à votre planning.";
    let detectedAction = null;

    if (userPrompt && (userPrompt.toLowerCase().includes('planifie') || userPrompt.toLowerCase().includes('note'))) {
      detectedAction = {
        functionName: "lexoraAddEvent",
        arguments: {
          title: "Intervention planifiée par l'assistant",
          date: "2026-05-21", // Calculé automatiquement par l'IA (aujourd'hui + 1)
          time: "14:00",
          type: "Intervention",
          desc: `Planifié automatiquement suite à la demande : "${userPrompt}"`
        }
      };
    }
    // =========================================================================

    // Sauvegarde de la réponse générée par l'IA dans l'historique de session
    conversationHistory.push({ role: 'assistant', content: aiTextResponse });

    // Envoi de la réponse finale structurée à ton interface React
    res.json({
      response: aiTextResponse,
      action: detectedAction
    });

  } catch (error) {
    console.error("Erreur routeur Assistant :", error);
    res.status(500).json({ error: "Erreur lors du traitement de la demande par l'IA." });
  }
});

// 2. ROUTE SECONDAIRE : Récupérer l'historique au chargement de la page React
router.get('/history', (req, res) => {
  // On extrait les messages mais on masque le prompt système au client pour garder l'affichage propre
  const publicHistory = conversationHistory
    .filter(msg => msg.role !== 'system')
    .map(msg => ({
      role: msg.role,
      text: msg.content
    }));
  res.json(publicHistory);
});

// 3. ROUTE Optionnelle : Permettre de vider la mémoire depuis l'interface (Bouton reset)
router.delete('/history', (req, res) => {
  conversationHistory = [];
  res.json({ status: 'success', message: 'Mémoire de Lexora réinitialisée.' });
});

export default router;