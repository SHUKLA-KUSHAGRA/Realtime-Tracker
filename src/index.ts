import express from 'express';
import WebSocket, { WebSocketServer } from 'ws';

const app = express();
app.use(express.json());

const server = app.listen(8080,()=>{
    console.log(`Server up and running at port 8080`);
})

const wss = new WebSocketServer({server});

let clients = new Map();
wss.on('connection', (ws) => {
  console.log('Client connected');

  ws.on('message', (message : any) => {
    try {
      const data = JSON.parse(message);
      const { username, latitude, longitude } = data;
      if (username && latitude !== undefined && longitude !== undefined) {
        // Store or update the user's location
        clients.set(ws, { username, latitude, longitude });
        // Broadcast the updated locations to all clients
        const locations = Array.from(clients.values());
        clients.forEach((_, client) => {
          if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify(locations));
          }
        });
      }
    } catch (error) {
      console.error('Error parsing message:', error);
    }
  });

  ws.on('close', () => {
    console.log('Client disconnected');
    clients.delete(ws);
  });

  ws.on('error', (error) => {
    console.error('WebSocket error:', error);
  });
  
});