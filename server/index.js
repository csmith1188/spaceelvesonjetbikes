
const express = require('express');
const path = require('path');
const http = require('http');
const WebSocket = require('ws');

const PORT = process.env.PORT || 3000;

const app = express();

// Set the view engine to EJS
app.set('view engine', 'ejs');

// Setup the WebSocket server instance
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

// Create a new server instance
server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

// Set the path for the views folder
app.set('views', path.join(__dirname, 'views'));

// Set the path for the public folder
app.use(express.static(path.join(__dirname, '../client')));

// Handle WebSocket connections
wss.on('connection', (ws) => {
    console.log('WebSocket connection established');

    // Handle messages from clients
    ws.on('message', (message) => {
        const data = JSON.parse(message);
        console.log(`Received message: ${message}`);

        // Broadcast the message to all clients
        wss.clients.forEach((client) => {
            // 'client !== ws' to send to non-sender
            if (client.readyState === WebSocket.OPEN) {
                client.send(message);
            }
        });
    });

    // Handle WebSocket connection close
    ws.on('close', () => {
        console.log('WebSocket connection closed');
    });
});

// Define your routes here

// Example route
app.get('/', (req, res) => {
    res.render('index');
});
