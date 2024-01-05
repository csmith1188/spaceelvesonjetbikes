
const express = require('express');
const path = require('path');
const socketio = require('socket.io');
const PORT = process.env.PORT || 3000;

const app = express();

// Set the view engine to EJS
app.set('view engine', 'ejs');

// Set the path for the views folder
app.set('views', path.join(__dirname, 'views'));

// Set the path for the public folder
app.use(express.static(path.join(__dirname, '../client')));

// Create a new server instance
const server = app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

// Initialize socket.io
const io = socketio(server);

io.on("connection", (socket) => {
    console.log("User connected: " + socket.id);
    socket.on("disconnect", function () {
        console.log("User disconnected: " + socket.id);
    });

    // Listen for client events
    socket.on('update_cl_buttons', (data) => {
        io.emit('update_sv_buttons', data);
    });
    
});

// Define your routes here

// Example route
app.get('/', (req, res) => {
    res.render('index');
});
