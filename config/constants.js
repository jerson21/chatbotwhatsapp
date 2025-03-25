// src/config/constants.js
module.exports = {
    MAX_MESSAGES_HISTORY: 10,
    OPENAI_MODEL: 'gpt-3.5-turbo',
    PLATFORMS: {
        WHATSAPP: 'whatsapp',
        MESSENGER: 'messenger'
    },
    DATABASE: {
        TABLE_CONTEXTS: process.env.DYNAMO_TABLA || "ContextosUsuarios"
    },
    ENDPOINTS: {
        ORDER_API: 'https://respaldoschile.cl/online/dashboard/bd/apiwhatsapp.php',
        OPENAI_API: 'https://api.openai.com/v1/chat/completions',
        MESSENGER_GRAPH: 'https://graph.facebook.com/v13.0/me/messages',
        WHATSAPP_GRAPH: 'https://graph.facebook.com/v13.0/'
    }
};