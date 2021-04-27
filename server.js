const path = require('path');
const http = require('http');
const express = require('express');
const socketio = require('socket.io');
const formatMessage = require('./utils/messages');
const {
  userJoin,
  getCurrentUser,
  userLeave,
  getRoomUsers
} = require('./utils/users');

const app = express();
const server = http.createServer(app);
const io = socketio(server);

// Set static folder
app.use(express.static(path.join(__dirname, 'public')));

const botName = 'DodgeBot';

// Run when client connects
io.on('connection', socket => {
  socket.on('joinRoom', ({ username, room }) => {
    const user = userJoin(socket.id, username, room);

    socket.join(user.room);

    // Welcome current user
    socket.emit('message', formatMessage(botName, 'Welcome to DodgeChat !'));

    // Broadcast when a user connects
    socket.broadcast
      .to(user.room)
      .emit(
        'message',
        formatMessage(botName, `${user.username} has joined the chat`)
      );

    // Send users and room info
    io.to(user.room).emit('roomUsers', {
      room: user.room,
      users: getRoomUsers(user.room)
    });
  });

  // Listen for chatMessage
  socket.on('chatMessage', msg => {
    const user = getCurrentUser(socket.id);

    io.to(user.room).emit('message', formatMessage(user.username, msg));
  });

  // Runs when client disconnects
  socket.on('disconnect', () => {
    const user = userLeave(socket.id);

    if (user) {
      io.to(user.room).emit(
        'message',
        formatMessage(botName, `${user.username} has left the chat`)
      );

      // Send users and room info
      io.to(user.room).emit('roomUsers', {
        room: user.room,
        users: getRoomUsers(user.room)
      });
    }
  });
});
// const path = require('path');
// const http = require('http');
// const express = require('express');
// //to use socket
// const socketio = require('socket.io');
// //to use message template
// const formatMessage = require('./utils/messages');
// const {
//   userJoin,
//   getCurrentUser,
//   userLeave,
//   getRoomUsers
// } = require('./utils/users');
//
// const app = express();
// //create server
// const server = http.createServer(app);
// //connect server to socketio
// const io = socketio(server);
//
// //to access frontend set static folder as public
// app.use(express.static(path.join(__dirname, 'public')));
//
// const botName = 'CosMos';
// //run when client connects,where sit listens for a connection and socket is a parameter
// //create a forntend to access tha t
// io.on('connection',socket=>{
//   // console.log('new web socket connection')
//   socket.on('joinRoom', ({ username, room }) => {
//     const user = userJoin(socket.id, username, room);
//
//     socket.join(user.room);
//
//     // Welcome current user
//     socket.emit('message', formatMessage(botName, 'Welcome to ChatCord!'));
//
//     // Broadcast when a user connects
//     socket.broadcast
//       .to(user.room)
//       .emit(
//         'message',
//         formatMessage(botName, `${user.username} has joined the chat`)
//       );
//
//       // Send users and room info
//     io.to(user.room).emit('roomUsers', {
//       room: user.room,
//       users: getRoomUsers(user.room)
//     });
//   });
//
//   // Listen for chatMessage
//   socket.on('chatMessage', msg => {
//     const user = getCurrentUser(socket.id);
//
//     io.to(user.room).emit('message', formatMessage(user.username, msg));
//   });
//
//   // Runs when client disconnects
//   socket.on('disconnect', () => {
//     const user = userLeave(socket.id);
//
//     if (user) {
//       io.to(user.room).emit(
//         'message',
//         formatMessage(botName, `${user.username} has left the chat`)
//       );
//
//       // Send users and room info
//       io.to(user.room).emit('roomUsers', {
//         room: user.room,
//         users: getRoomUsers(user.room)
//       });
//     }
//   });
// });

  //welcomes the user thats connecting
  //  socket.emit('message', formatMessage(botName, 'Welcome to ChatCord!'));
  // //this will broadcast when a user connects to all the clients in the room
  // socket.broadcast.emit('message',formatMessage(botName, `${user.username} has joined the chat`));
  // //this will broadcast disconnect message
  // socket.on('disconnect',()=>{
  //   io.emit('message',formatMessage(botName, `${user.username} has left the chat`));
  // });

//listen for chat message
//   socket.on('chatMessage',(msg)=>{
//     // console.log(msg);
//     io.emit('message',msg);
//   })
// })


const PORT = process.env.PORT || 3000;

server.listen(PORT,()=>console.log(`server running on ${PORT}`));
