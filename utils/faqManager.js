// src/utils/faqManager.js
const FAQs = {
    horario: "📅 Nuestro horario de atención es de lunes a viernes de 9:00 AM a 6:00 PM.",
    pago: "💳 Aceptamos pagos con transferencia bancaria, tarjetas de crédito y débito.",
    modelos: "🛏️ Tenemos más de 10 modelos de respaldos: Botone Madrid, Liso Venecia, Capitone, entre otros.",
    contacto: "📞 Puedes contactarnos al teléfono +56 2 1234 5678 o por email a contacto@respaldoschile.cl"
};

function handleFAQ(mensaje) {
    const mensajeLower = mensaje.toLowerCase();
    
    for (let [key, respuesta] of Object.entries(FAQs)) {
        if (mensajeLower.includes(key)) {
            return respuesta;
        }
    }
    
    // Si no encuentra una FAQ específica
    return "No encontré información específica. ¿Podrías reformular tu pregunta?";
}

module.exports = { handleFAQ };