// src/utils/intentDetector.js
const INTENTS = {
    ORDER_QUERY: 'consultaPedido',
    ORDER_DETAILS: 'consultaPedidoDetalles',
    WAITING_ORDER: 'esperandoOrden',
    FAQ: 'faq',
    GENERAL_CHAT: 'chatGeneral'
};

function detectIntent(mensaje, contexto) {
    const mensajeLower = mensaje.toLowerCase();
    
    // Orden de prioridad en detección de intención
    const intentChecks = [
        {
            test: /estado.*pedido|cómo va mi pedido|mi pedido está listo|consultar pedido|seguimiento|tracking/i,
            intent: INTENTS.ORDER_QUERY
        },
        {
            test: /^\d{7,8}-[\dkK]$|^\d{4,8}$/,
            intent: INTENTS.WAITING_ORDER
        },
        {
            test: /cuando|cuándo|tiempo|días|entrega|despacho|llegada|estado actual|proceso|avance|novedades|color|tamaño|material|medidas|modelo|pago|precio|costo|valor|monto/i,
            intent: INTENTS.ORDER_DETAILS
        }
    ];
    
    // Verificar intenciones predefinidas
    for (let check of intentChecks) {
        if (check.test.test(mensajeLower)) {
            return check.intent;
        }
    }
    
    // Mantener estado actual si es relevante
    const relevantStates = [
        INTENTS.ORDER_QUERY, 
        INTENTS.WAITING_ORDER, 
        INTENTS.ORDER_DETAILS
    ];
    
    if (relevantStates.includes(contexto.estadoConversacion)) {
        return contexto.estadoConversacion;
    }
    
    // Verificar FAQs
    const faqs = {
        'horario': /horario/,
        'pago': /pago|pagos/,
        'modelos': /modelo|respaldo/
    };
    
    for (let faq in faqs) {
        if (faqs[faq].test(mensajeLower)) {
            return INTENTS.FAQ;
        }
    }
    
    return INTENTS.GENERAL_CHAT;
}

module.exports = { detectIntent, INTENTS };