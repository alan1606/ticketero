# Usar una imagen base de Node.js
FROM node:18

# Establecer el directorio de trabajo dentro del contenedor
WORKDIR /app

# Copiar los archivos de la aplicación al contenedor
COPY package*.json ./

# Instalar las dependencias del proyecto
RUN npm install

# Copiar todo el código fuente al contenedor
COPY . .

# Establecer variables de entorno por defecto (puedes cambiarlas al ejecutar)
ENV PRINTER_IP='tcp://172.17.207.195:9100'
ENV SOCKET_URL='http://172.17.200.235:8002/shifts-websocket'

# Comando por defecto para ejecutar la aplicación
CMD ["node", "server.js"]
