const socket = io();

socket.on("message", (message) => {
  console.log(message);
});

// // Connect to socketio server at localhost:3000
// socket = io.connect('http://localhost:3000');
// // Log socketio events
// socket.on('connect', () => {
//     console.log('Connected to socket.io server');
// });
// socket.on('disconnect', () => {
//     console.log('Disconnected from socket.io server');
// });
// // Listen for server events
// socket.on('message', (data) => {
//     console.log(data);
// });