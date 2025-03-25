// src/handlers/messageHandler.js
const { detectIntent, INTENTS } = require('utils/intentDetector');
const { getContext, updateContext } = require('services/contextService');
const { consultarEstadoPedido, consultarEstadoPedidoPorRut } = require('services/orderService');
const { generateOpenAIResponse } = require('services/openaiService');
const { handleFAQ } = require('utils/faqManager');

async function processMessage(message, senderID, platform) {
    // Obtener contexto actual
    let context = await getContext(senderID);
    
    // Almacenar último mensaje para historial
    context.ultimoMensaje = message;
    
    // Detectar intención
    const intent = detectIntent(message, context);
    
    // Actualizar estado de conversación
    context.estadoConversacion = intent;
    
    let response;
    
    // Procesar mensaje según intención
    switch (intent) {
        case INTENTS.ORDER_QUERY:
            // Si es un número de pedido o RUT válido
            if (/^\d{4,8}$/.test(message)) {
                response = await consultarEstadoPedido(message);
            } else if (/^\d{7,8}-[\dkK]$/.test(message)) {
                response = await consultarEstadoPedidoPorRut(message);
            } else {
                response = "Para consultar tu pedido, necesito tu número de pedido o RUT.";
            }
            break;
        
        case INTENTS.WAITING_ORDER:
            if (/^\d{4,8}$/.test(message)) {
                response = await consultarEstadoPedido(message);
            } else if (/^\d{7,8}-[\dkK]$/.test(message)) {
                response = await consultarEstadoPedidoPorRut(message);
            } else {
                response = "Por favor, ingresa un número de pedido válido o RUT.";
            }
            break;
        
        case INTENTS.ORDER_DETAILS:
            // Si ya hay un pedido en contexto, dar más detalles
            if (context.ultimoPedido) {
                response = `Detalles del pedido:\n• Estado: ${context.ultimoPedido.estado}\n• Modelo: ${context.ultimoPedido.modelo}`;
            } else {
                response = "Primero consulta tu pedido por número o RUT.";
            }
            break;
        
        case INTENTS.FAQ:
            response = handleFAQ(message);
            break;
        
        default:
            // Usar OpenAI para respuestas generales
            response = await generateOpenAIResponse(message, context);
    }
    
    // Actualizar y guardar contexto
    await updateContext(senderID, context, response);
    
    return response;
}

module.exports = { processMessage };