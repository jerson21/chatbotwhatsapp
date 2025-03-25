// src/services/orderService.js
const axios = require('axios');
const { ENDPOINTS } = require('config/constants');

async function consultarEstadoPedido(numOrden) {
    try {
        const response = await axios.post(ENDPOINTS.ORDER_API, { num_orden: numOrden });
        
        if (response.data.error) {
            return "No encontré tu pedido. ¿Podrías verificar el número de orden?";
        }
        
        const pedido = Array.isArray(response.data) ? response.data[0] : response.data;
        
        return formatOrderResponse(pedido);
    } catch (error) {
        console.error("Error consultando pedido:", error);
        return "Hubo un problema al consultar tu pedido. Inténtalo más tarde.";
    }
}

async function consultarEstadoPedidoPorRut(rut) {
    try {
        const response = await axios.post(ENDPOINTS.ORDER_API, { rut });
        
        if (response.data.error) {
            return "No encontré tu pedido. ¿Podrías verificar el RUT?";
        }
        
        const pedidos = Array.isArray(response.data) ? response.data : [response.data];
        return formatMultipleOrdersResponse(pedidos);
    } catch (error) {
        console.error("Error consultando pedidos por RUT:", error);
        return "Hubo un problema al consultar tus pedidos. Inténtalo más tarde.";
    }
}

function formatOrderResponse(pedido) {
    return `📦 *Estado de tu pedido:*
• Estado: *${pedido.estado}*
• Cliente: ${pedido.cliente}
• Modelo: ${pedido.modelo}
• Fecha de ingreso: ${pedido.fecha_ingreso}

¿Hay algo más que quieras saber sobre tu pedido?`;
}

function formatMultipleOrdersResponse(pedidos) {
    let respuesta = "📦 *Estado de tus pedidos:*\n";
    
    pedidos.forEach((pedido, index) => {
        respuesta += `
*Pedido ${index + 1}:*
• Orden: *${pedido.num_orden}*
• Estado: *${pedido.estado}*
• Cliente: ${pedido.cliente}
• Fecha de ingreso: ${pedido.fecha_ingreso}
`;
    });
    
    respuesta += "\n¿Hay algo más que quieras saber sobre tu(s) pedido(s)?";
    return respuesta;
}

module.exports = {
    consultarEstadoPedido,
    consultarEstadoPedidoPorRut
};