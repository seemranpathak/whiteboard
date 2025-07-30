import express from 'express';
import connect from './db/connect.js';
import { Server } from 'socket.io';
import http from 'http'

const app = express();
app.use(express.json());

connect();


const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173", // Your React app's origin
    methods: ["GET", "POST"]
  }
});

io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);

  // Handle drawing events
  socket.on('drawing', (data) => {
    socket.broadcast.emit('drawing', data); // Broadcast to others
    // Save to database here
  });

  // Handle cursor movements
  socket.on('cursorMove', (data) => {
    socket.broadcast.emit('cursorMove', data); // Broadcast to others
  });

  // Handle object creation/modification (shapes)
  socket.on('objectModified', (data) => {
    socket.broadcast.emit('objectModified', data);
    // Save to database here
  });

  // Handle clear canvas
  socket.on('clearCanvas', () => {
    socket.broadcast.emit('clearCanvas');
    // Clear from database here
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

server.listen(5000, () => {
  console.log('Socket.IO server listening on port 5000');
});

//     origin: "http://localhost:3000", // Your React app's origin
//     methods: ["GET", "POST"]
//   }
// });

// io.on('connection', (socket) => {
//   console.log('A user connected:', socket.id);

//   // Handle drawing events
//   socket.on('drawing', (data) => {
//     socket.broadcast.emit('drawing', data); // Broadcast to others
//     // Save to database here
//   });

//   // Handle cursor movements
//   socket.on('cursorMove', (data) => {
//     socket.broadcast.emit('cursorMove', data); // Broadcast to others
//   });

//   // Handle object creation/modification (shapes)
//   socket.on('objectModified', (data) => {
//     socket.broadcast.emit('objectModified', data);
//     // Save to database here
//   });

//   //Handle clear canvas
//   socket.on('clearCanvas', () => {
//     socket.broadcast.emit('clearCanvas');
//     // Clear from database here
//   });

//   socket.on('disconnect', () => {
//     console.log('User disconnected:', socket.id);
//   });
// });


// server.listen(4000, () => {
//   console.log('Socket.IO server listening on port 4000');
// });