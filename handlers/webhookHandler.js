// src/handlers/webhookHandler.js
const { processMessage } = require('./messageHandler');
const { PLATFORMS } = require('config/constants');

exports.handler = async (event) => {
    console.log("Evento recibido:", JSON.stringify(event, null, 2));
    
    // Verificación de webhook
    if (event.queryStringParameters && event.queryStringParameters["hub.mode"] === "subscribe") {
        return handleWebhookVerification(event);
    }
    
    try {
        const body = JSON.parse(event.body || '{}');
        const platform = detectPlatform(body);
        
        if (platform) {
            const messages = extractMessages(body, platform);
            
            for (const { senderID, userMessage, platformInfo } of messages) {
                const responseText = await processMessage(userMessage, senderID, platform);
                await sendResponse(responseText, senderID, platform, platformInfo);
            }
        }
        
        return { statusCode: 200, body: "EVENT_RECEIVED" };
    } catch (error) {
        console.error("Error procesando webhook:", error);
        return { statusCode: 500, body: "Error processing webhook" };
    }
};

function detectPlatform(body) {
    if (body.object === "page") return PLATFORMS.MESSENGER;
    if (body.object === "whatsapp_business_account") return PLATFORMS.WHATSAPP;
    return null;
}

function extractMessages(body, platform) {
    const messages = [];
    
    if (platform === PLATFORMS.MESSENGER) {
        body.entry.forEach(entry => {
            entry.messaging.forEach(event => {
                if (event.message && event.message.text) {
                    messages.push({
                        senderID: event.sender.id,
                        userMessage: event.message.text,
                        platformInfo: { pageID: entry.id }
                    });
                }
            });
        });
    }
    
    if (platform === PLATFORMS.WHATSAPP) {
        body.entry.forEach(entry => {
            entry.changes.forEach(change => {
                if (change.value.messages) {
                    change.value.messages.forEach(message => {
                        messages.push({
                            senderID: message.from,
                            userMessage: message.text.body,
                            platformInfo: { 
                                phoneNumberId: change.value.metadata.phone_number_id 
                            }
                        });
                    });
                }
            });
        });
    }
    
    return messages;
}

async function sendResponse(responseText, senderID, platform, platformInfo) {
    const axios = require('axios');
    const { ENDPOINTS } = require('../config/constants');
    
    if (platform === PLATFORMS.MESSENGER) {
        const PAGE_ACCESS_TOKEN = process.env.PAGE_ACCESS_TOKEN;
        const url = `${ENDPOINTS.MESSENGER_GRAPH}me/messages?access_token=${PAGE_ACCESS_TOKEN}`;
        
        await axios.post(url, {
            recipient: { id: senderID },
            message: { text: responseText }
        });
    }
    
    if (platform === PLATFORMS.WHATSAPP) {
        const WHATSAPP_ACCESS_TOKEN = process.env.WHATSAPP_ACCESS_TOKEN;
        const url = `${ENDPOINTS.WHATSAPP_GRAPH}${platformInfo.phoneNumberId}/messages`;
        
        await axios.post(url, {
            messaging_product: "whatsapp",
            to: senderID,
            text: { body: responseText }
        }, {
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${WHATSAPP_ACCESS_TOKEN}`
            }
        });
    }
}