// ========== CHATBOT FITCOACH - VERSION FINALE ==========
console.log('🤖 [FINAL] Chatbot script chargé');

// Configuration
const GEMINI_API_KEY = 'DESACTIVE';
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent';

const FITCOACH_CONTEXT = `Tu es l'assistant virtuel de FitCoach, un coach sportif personnel nommé Alex Martin.

INFORMATIONS SUR FITCOACH:
- Coach: Alex Martin, certifié BPJEPS
- Expérience: Plus de 10 ans, 500+ clients accompagnés
- Taux de satisfaction: 98%
- Localisation: 25 Rue du Sport, 75001 Paris
- Contact: +33 6 12 34 56 78 | alex@fitcoach.fr

TARIFS:
- Séance individuelle: 60€
- Pack 10 séances: 500€ (économie de 100€)
- Coaching en ligne: 150€/mois
- Suivi nutritionnel: 80€/mois

SERVICES:
1. Coaching Personnel - Séances individuelles sur-mesure
2. Cours Collectifs - HIIT, CrossFit, Circuit Training
3. Suivi Nutritionnel - Plans alimentaires personnalisés
4. Coaching en Ligne - Programmes à distance avec suivi hebdomadaire

HORAIRES:
- Lundi-Vendredi: 6h00-21h00
- Samedi: 8h00-18h00
- Dimanche: 9h00-14h00

INSTRUCTIONS:
- Réponds de manière amicale, motivante et professionnelle
- Utilise des emojis fitness (💪, 🏋️, 🔥, ⭐, 💯) avec modération
- Encourage les prospects à prendre rendez-vous
- Sois concis mais informatif (max 3-4 lignes par réponse)
- Si on te demande de réserver, propose les coordonnées de contact
- Reste dans le contexte du coaching sportif et fitness`;

// État
let chatbotOpen = false;
let conversationHistory = [];
let useAI = false;

// Réponses intelligentes
const fallbackResponses = {
    'salutation': {
        keywords: ['bonjour', 'salut', 'hello', 'bonsoir', 'coucou', 'hey', 'hi'],
        response: "Bonjour! 👋 Ravi de vous parler!\n\nJe suis l'assistant FitCoach. Comment puis-je vous aider aujourd'hui?\n\nVous pouvez me poser des questions sur nos services, tarifs, horaires ou prendre rendez-vous!"
    },
    'tarifs': {
        keywords: ['tarif', 'prix', 'coût', 'combien', 'payer', 'abonnement', '💰', 'euro', '€'],
        response: "💰 Nos tarifs:\n• Séance individuelle: 60€\n• Pack 10 séances: 500€ (économie de 100€!)\n• Coaching en ligne: 150€/mois\n• Suivi nutritionnel: 80€/mois\n\nIntéressé par un service en particulier?"
    },
    'services': {
        keywords: ['service', 'offre', 'coaching', 'programme', '🏋️', 'proposez', 'propose'],
        response: "🏋️ Nos services:\n\n1️⃣ Coaching Personnel - Séances sur-mesure\n2️⃣ Cours Collectifs - HIIT, CrossFit, Circuit Training\n3️⃣ Suivi Nutritionnel - Plans alimentaires personnalisés\n4️⃣ Coaching en Ligne - Programmes à distance\n\nQuel service vous intéresse?"
    },
    'rdv': {
        keywords: ['rendez-vous', 'réserver', 'rdv', '📅', 'inscription', 'prendre', 'réservation', 'contact'],
        response: "📅 Super! Pour prendre rendez-vous:\n\n📞 Tél: +33 6 12 34 56 78\n📧 Email: alex@fitcoach.fr\n📍 Adresse: 25 Rue du Sport, 75001 Paris\n\nVous pouvez aussi remplir le formulaire de contact sur le site!"
    },
    'horaires': {
        keywords: ['horaire', 'heure', 'ouvert', 'disponibilité', 'quand', 'créneau'],
        response: "⏰ Horaires d'ouverture:\n\n• Lundi-Vendredi: 6h00-21h00\n• Samedi: 8h00-18h00\n• Dimanche: 9h00-14h00\n\nJe suis flexible et peux m'adapter à vos contraintes. Quel créneau vous convient?"
    },
    'nutrition': {
        keywords: ['nutrition', 'nutritionnel', 'alimentation', 'régime', 'manger', 'repas', 'diet'],
        response: "🍎 Suivi Nutritionnel - 80€/mois:\n\n✅ Plan alimentaire personnalisé\n✅ Recettes adaptées\n✅ Suivi hebdomadaire\n✅ Ajustements selon vos progrès\n\n70% de votre transformation vient de l'alimentation! Voulez-vous en savoir plus?"
    },
    'objectifs': {
        keywords: ['objectif', 'perdre', 'poids', 'maigrir', 'mincir', 'muscle', 'muscler', 'transformation'],
        response: "🎯 Je vous aide à atteindre vos objectifs:\n\n💪 Perte de poids\n🏋️ Prise de masse musculaire\n🏃 Amélioration de la condition physique\n🧘 Renforcement et tonification\n\nChaque programme est adapté à VOS besoins. Quel est votre objectif principal?"
    },
    'experience': {
        keywords: ['expérience', 'diplôme', 'certification', 'qualifié', 'compétence', 'alex'],
        response: "👨‍🏫 Mon expérience:\n\n🎓 Certifié BPJEPS\n💼 Plus de 10 ans d'expérience\n👥 500+ clients accompagnés\n⭐ 98% de satisfaction\n\nJe me forme continuellement pour vous offrir le meilleur accompagnement!"
    },
    'motivation': {
        keywords: ['motivation', 'motivé', 'courage', 'difficile', 'abandonner'],
        response: "💪 La motivation est la clé!\n\nJe suis là pour vous accompagner à chaque étape. Ensemble, nous fixons des objectifs réalistes et célébrons chaque victoire.\n\nRappelez-vous: chaque champion était un débutant qui n'a jamais abandonné! Prêt à commencer? 🔥"
    },
    'merci': {
        keywords: ['merci', 'thanks', 'super', 'génial', 'parfait', 'ok', 'cool'],
        response: "Avec plaisir! 😊\n\nN'hésitez pas si vous avez d'autres questions. Je suis là pour vous aider!\n\nBonne journée! 💪"
    },
    'default': "Je peux vous renseigner sur:\n\n💰 Tarifs et formules\n🏋️ Services proposés\n📅 Prise de rendez-vous\n⏰ Horaires d'ouverture\n🍎 Suivi nutritionnel\n\nQue souhaitez-vous savoir?"
};

// Variables
let chatbotToggle;
let chatbotWindow;
let chatbotClose;
let chatbotMessages;
let chatbotInput;
let chatbotSend;
let quickReplyButtons;

console.log('🔍 [FINAL] Attente du chargement du DOM...');

// Initialisation
document.addEventListener('DOMContentLoaded', () => {
    console.log('✅ [FINAL] DOM chargé, initialisation du chatbot...');

    chatbotToggle = document.getElementById('chatbot-toggle');
    chatbotWindow = document.getElementById('chatbot-window');
    chatbotClose = document.getElementById('chatbot-close');
    chatbotMessages = document.getElementById('chatbot-messages');
    chatbotInput = document.getElementById('chatbot-input');
    chatbotSend = document.getElementById('chatbot-send');
    quickReplyButtons = document.querySelectorAll('.quick-reply-btn');

    console.log('📋 [FINAL] Éléments trouvés:', {
        chatbotToggle: !!chatbotToggle,
        chatbotWindow: !!chatbotWindow,
        chatbotClose: !!chatbotClose,
        chatbotMessages: !!chatbotMessages,
        chatbotInput: !!chatbotInput,
        chatbotSend: !!chatbotSend,
        quickReplyButtons: quickReplyButtons.length
    });

    if (!chatbotToggle) {
        console.error('❌ [FINAL] Bouton chatbot-toggle non trouvé!');
        return;
    }

    chatbotToggle.addEventListener('click', () => {
        console.log('🖱️ [FINAL] Clic sur le bouton chatbot');
        toggleChatbot();
    });

    if (chatbotClose) {
        chatbotClose.addEventListener('click', () => {
            console.log('🖱️ [FINAL] Clic sur fermer');
            toggleChatbot();
        });
    }

    if (chatbotSend) {
        chatbotSend.addEventListener('click', sendMessage);
    }

    if (chatbotInput) {
        chatbotInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') sendMessage();
        });
    }

    quickReplyButtons.forEach(button => {
        button.addEventListener('click', () => {
            chatbotInput.value = button.getAttribute('data-message');
            sendMessage();
        });
    });

    console.log('✅ [FINAL] Événements attachés');
    console.log('ℹ️ [FINAL] Mode IA:', useAI ? 'Actif' : 'Désactivé');
    console.log('✅ [FINAL] Initialisation terminée avec succès');
});

function toggleChatbot() {
    console.log('🔄 [FINAL] Toggle chatbot appelé, état actuel:', chatbotOpen);
    chatbotOpen = !chatbotOpen;

    if (chatbotOpen) {
        console.log('📖 [FINAL] Ouverture du chatbot');
        chatbotWindow.classList.add('active');
        chatbotToggle.classList.add('hidden');
        if (chatbotInput) chatbotInput.focus();
    } else {
        console.log('📕 [FINAL] Fermeture du chatbot');
        chatbotWindow.classList.remove('active');
        chatbotToggle.classList.remove('hidden');
    }
    console.log('✅ [FINAL] Classes appliquées:', {
        window: chatbotWindow.className,
        toggle: chatbotToggle.className
    });
}

async function sendMessage() {
    const message = chatbotInput.value.trim();
    if (!message) return;

    console.log('📤 [FINAL] Envoi message:', message);

    addMessage(message, 'user');
    conversationHistory.push({ role: 'user', content: message });
    chatbotInput.value = '';
    chatbotInput.disabled = true;
    chatbotSend.disabled = true;

    showTypingIndicator();

    try {
        let response;
        if (useAI) {
            console.log('🤖 [FINAL] Appel API Gemini...');
            response = await getGeminiResponse(message);
        } else {
            console.log('📋 [FINAL] Mode fallback');
            await new Promise(resolve => setTimeout(resolve, 1000));
            response = getFallbackResponse(message);
        }

        removeTypingIndicator();
        addMessage(response, 'bot');
        conversationHistory.push({ role: 'assistant', content: response });
    } catch (error) {
        console.error('❌ [FINAL] Erreur:', error);
        removeTypingIndicator();
        addMessage("Désolé, j'ai rencontré une erreur. Pouvez-vous reformuler votre question? 😅", 'bot');
    } finally {
        chatbotInput.disabled = false;
        chatbotSend.disabled = false;
        chatbotInput.focus();
    }
}

async function getGeminiResponse(userMessage) {
    const requestBody = {
        contents: [{
            parts: [
                { text: FITCOACH_CONTEXT },
                { text: `Question client: ${userMessage}\n\nRéponds de manière concise et professionnelle:` }
            ]
        }],
        generationConfig: {
            temperature: 0.7,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 200,
        }
    };

    const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
        throw new Error(`API Error: ${response.status}`);
    }

    const data = await response.json();
    return data.candidates[0].content.parts[0].text;
}

function getFallbackResponse(message) {
    const messageLower = message.toLowerCase();
    for (const category in fallbackResponses) {
        const { keywords, response } = fallbackResponses[category];
        if (keywords) {
            for (const keyword of keywords) {
                if (messageLower.includes(keyword.toLowerCase())) {
                    return response;
                }
            }
        }
    }
    return fallbackResponses.default;
}

function addMessage(text, sender) {
    const messageDiv = document.createElement('div');
    messageDiv.classList.add('message');
    messageDiv.classList.add(sender === 'user' ? 'user-message' : 'bot-message');

    const avatarDiv = document.createElement('div');
    avatarDiv.classList.add('message-avatar');
    avatarDiv.innerHTML = sender === 'user' ? '<i class="fas fa-user"></i>' : '<i class="fas fa-robot"></i>';

    const contentDiv = document.createElement('div');
    contentDiv.classList.add('message-content');

    const textP = document.createElement('p');
    textP.innerHTML = text.replace(/\n/g, '<br>');

    contentDiv.appendChild(textP);
    messageDiv.appendChild(avatarDiv);
    messageDiv.appendChild(contentDiv);

    chatbotMessages.appendChild(messageDiv);
    chatbotMessages.scrollTop = chatbotMessages.scrollHeight;
}

function showTypingIndicator() {
    const typingDiv = document.createElement('div');
    typingDiv.classList.add('message', 'bot-message');
    typingDiv.id = 'typing-indicator-message';

    const avatarDiv = document.createElement('div');
    avatarDiv.classList.add('message-avatar');
    avatarDiv.innerHTML = '<i class="fas fa-robot"></i>';

    const typingIndicator = document.createElement('div');
    typingIndicator.classList.add('typing-indicator');
    typingIndicator.innerHTML = '<div class="typing-dot"></div><div class="typing-dot"></div><div class="typing-dot"></div>';

    typingDiv.appendChild(avatarDiv);
    typingDiv.appendChild(typingIndicator);
    chatbotMessages.appendChild(typingDiv);
    chatbotMessages.scrollTop = chatbotMessages.scrollHeight;
}

function removeTypingIndicator() {
    const indicator = document.getElementById('typing-indicator-message');
    if (indicator) indicator.remove();
}

console.log('✅ [FINAL] Script chatbot chargé complètement');
