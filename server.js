const SockJS = require('sockjs-client');
const { Client } = require('@stomp/stompjs');
const ThermalPrinter = require('node-thermal-printer').printer;
const PrinterTypes = require('node-thermal-printer').types;

// Configuración de la impresora
const ipAddress = process.env.PRINTER_IP || 'tcp://172.17.207.195:9100'; // Usa una variable de entorno, o un valor por defecto
const printer = new ThermalPrinter({
  type: PrinterTypes.EPSON,
  interface: ipAddress
});


// Función para imprimir un ticket
const printTicket = (message) => {
  console.log('Imprimiendo ticket...');
  
  printer.clear(); // Asegúrate de limpiar el buffer antes de empezar

  printer.alignCenter();

  // Aumentar el tamaño de la letra
  printer.setTextSize(3, 3); // Aumenta el tamaño de la letra al doble en ancho y alto

  // Imprimir el atributo idToDisplay
  printer.println(message.idToDisplay);
  
  printer.newLine();
  printer.cut();

  // Ejecutar la impresión
  printer.execute().then(() => {
    console.log('Ticket impreso correctamente.');
  }).catch((error) => {
    console.error('Error al imprimir el ticket:', error);
  });
};

  
  

// Conexión con el servidor WebSocket
const socketUrl = process.env.SOCKET_URL || 'http://172.17.200.235:8002/shifts-websocket'; // Usa la variable de entorno o un valor por defecto
const socket = new SockJS(socketUrl);

const stompClient = new Client({
  webSocketFactory: () => socket,
  reconnectDelay: 5000, // Intentar reconectar cada 5 segundos si se pierde la conexión
});

// Cuando se conecta al WebSocket
stompClient.onConnect = () => {
  console.log('Conectado al WebSocket');

  // Suscribirse al topic correspondiente (ejemplo con "alan")
  stompClient.subscribe('/topic/user/alan', (message) => {
    const content = JSON.parse(message.body);
    console.log('Mensaje recibido:', content);

    // Validar si el mensaje contiene el atributo arrivedTime
    if (content.arrivedTime) {
      // Imprimir ticket al recibir el mensaje
      printTicket(content);
    } else {
      console.log('El mensaje recibido no tiene el atributo arrivedTime. No se imprimirá el ticket.');
    }
  });
};

// Manejo de errores de STOMP
stompClient.onStompError = (frame) => {
  console.error('Error en STOMP:', frame.headers['message']);
};

// Activar la conexión WebSocket
stompClient.activate();
