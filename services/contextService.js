// src/services/contextService.js
const { dynamoClient } = require('config/dynamoConfig');
const { MAX_MESSAGES_HISTORY, DATABASE } = require('config/constants');

async function getContext(senderID) {
    const params = {
        TableName: DATABASE.TABLE_CONTEXTS,
        Key: { senderID }
    };
    
    try {
        const result = await dynamoClient.get(params).promise();
        return result.Item || createDefaultContext(senderID);
    } catch (error) {
        console.error("Error recuperando contexto:", error);
        return createDefaultContext(senderID);
    }
}

function createDefaultContext(senderID) {
    return {
        senderID,
        historialMensajes: [],
        estadoConversacion: 'inicial',
        ultimaActividad: Date.now(),
        datos: {},
        ultimoPedido: null
    };
}

async function updateContext(senderID, contexto, respuesta) {
    // Limitar historial de mensajes
    if (contexto.historialMensajes.length > MAX_MESSAGES_HISTORY) {
        contexto.historialMensajes = contexto.historialMensajes.slice(-MAX_MESSAGES_HISTORY);
    }
    
    // Agregar mensaje de usuario y respuesta
    contexto.historialMensajes.push({
        rol: "usuario",
        mensaje: contexto.ultimoMensaje,
        timestamp: Date.now()
    });
    
    contexto.historialMensajes.push({
        rol: "bot",
        mensaje: respuesta,
        timestamp: Date.now()
    });
    
    // Actualizar contexto en DynamoDB
    const params = {
        TableName: DATABASE.TABLE_CONTEXTS,
        Item: { 
            senderID, 
            ...contexto,
            ultimaActividad: Date.now()
        }
    };
    
    try {
        await dynamoClient.put(params).promise();
    } catch (error) {
        console.error("Error actualizando contexto:", error);
    }
    
    return contexto;
}

module.exports = { 
    getContext, 
    updateContext 
};