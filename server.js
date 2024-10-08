const SockJS = require('sockjs-client');
const { Client } = require('@stomp/stompjs');
const ThermalPrinter = require('node-thermal-printer').printer;
const PrinterTypes = require('node-thermal-printer').types;

// Configuración de la impresora
const printer = new ThermalPrinter({
  type: PrinterTypes.EPSON, // O el tipo de impresora que utilices, por ejemplo: STAR, BIXOLON
  interface: 'printer' // Puedes cambiar esto si la impresora está conectada a una interfaz diferente
});

// Función para imprimir un ticket
const printTicket = (message) => {
    console.log('Imprimiendo ticket...');
  
    printer.alignCenter();
  
    // Solo imprimir el atributo idToDisplay
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
const socketUrl = 'http://172.17.200.235:8002/shifts-websocket';
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
