// src/config/dynamoConfig.js
const AWS = require('aws-sdk');

AWS.config.update({ region: 'sa-east-1' });

const dynamoClient = new AWS.DynamoDB.DocumentClient();

module.exports = {
    dynamoClient,
    async saveContext(senderID, context) {
        const params = {
            TableName: process.env.DYNAMO_TABLA || "ContextosUsuarios",
            Item: { 
                senderID, 
                ...context,
                ultimaActividad: Date.now()
            }
        };
        await dynamoClient.put(params).promise();
    },
    
    async getContext(senderID) {
        const params = {
            TableName: process.env.DYNAMO_TABLA || "ContextosUsuarios",
            Key: { senderID }
        };
        
        const result = await dynamoClient.get(params).promise();
        return result.Item || {
            senderID,
            historialMensajes: [],
            estadoConversacion: 'inicial',
            ultimaActividad: Date.now(),
            datos: {},
            ultimoPedido: null
        };
    }
};