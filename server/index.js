
const express = require('express');
const path = require('path');
const http = require('http');
const WebSocket = require('ws');

const Game = require('./engine/game/game.js');

const PORT = process.env.PORT || 3000;

const app = express();

// Set the view engine to EJS
app.set('view engine', 'ejs');

// Setup the WebSocket server instance
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });
global.wss = wss;

// Create a new server instance
server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

// Set the path for the views folder
app.set('views', path.join(__dirname, 'views'));

// Set the path for the public folder
app.use(express.static(path.join(__dirname, '../client')));

global.game = new Game();

// Define your routes here

// Example route
app.get('/', (req, res) => {
    res.render('index');
});

setInterval(() => { game.step(); }, 1000 / 60);