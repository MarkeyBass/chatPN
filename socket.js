const socket = require('socket.io');
const httpsServer = require('./index')


// Socket setup
const io = socket(httpsServer);

const socketListening = io.on('connection', (socket) => {
  console.log('socket is connected', socket.id);

  // hendle chat event
  socket.on('chat', (data) => {
    console.log(data)
    // referring all computers conected to the socket
    io.sockets.emit('chat', data);
  });
    
  socket.on('typing', (data) => {
    socket.broadcast.emit('typing', data)
  });
});

module.exports = { socketListening };

