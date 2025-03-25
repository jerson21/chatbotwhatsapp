// src/services/openaiService.js
const axios = require('axios');
const { ENDPOINTS, OPENAI_MODEL } = require('config/constants');

async function generateOpenAIResponse(mensaje, contexto) {
    const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
    
    const systemPrompt = `Eres el asistente virtual de Respaldos Chile, empresa dedicada a la venta de respaldos de cama, bases de cama y productos para el hogar. 
Responde de manera breve, clara y amigable, manteniendo el contexto de la conversación.

Información importante:
- Horario de atención: lunes a viernes de 9:00 AM a 6:00 PM
- Formas de pago: transferencia bancaria, tarjetas de crédito y débito
- Modelos disponibles: Botone Madrid, Liso Venecia, Capitone, entre otros

Si detectas que el usuario quiere consultar por el estado de su pedido, pídele su número de pedido o RUT.
No reveles que eres GPT o que usas OpenAI.`;

    // Preparar mensajes para OpenAI con contexto
    const mensajesParaGPT = [
        { 
            role: "system", 
            content: systemPrompt
        }
    ];

    // Agregar los últimos 5 mensajes del historial
    const mensajesRecientes = contexto.historialMensajes?.slice(-5) || [];
    mensajesRecientes.forEach(msg => {
        mensajesParaGPT.push({
            role: msg.rol === "usuario" ? "user" : "assistant",
            content: msg.mensaje
        });
    });

    // Agregar mensaje actual
    mensajesParaGPT.push({ 
        role: "user", 
        content: mensaje 
    });

    const payload = {
        model: OPENAI_MODEL,
        messages: mensajesParaGPT,
        max_tokens: 150,
        temperature: 0.7
    };

    try {
        const response = await axios.post(ENDPOINTS.OPENAI_API, payload, {
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${OPENAI_API_KEY}`
            }
        });

        return response.data.choices[0].message.content.trim();
    } catch (error) {
        console.error("Error en OpenAI:", error.response?.data || error.message);
        return "Lo siento, hubo un problema al procesar tu solicitud. ¿Puedes intentarlo de nuevo?";
    }
}

module.exports = { generateOpenAIResponse };