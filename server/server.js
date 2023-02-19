const { Server } = require("socket.io");
const { instrument } = require("@socket.io/admin-ui");
// init socket io
const port = 3000;

//FIXME - "https://admin.socket.io" in cors not working
const cors = {
  origin: ["http://localhost:8080", "https://admin.socket.io"],
};
const io = new Server(port, { cors });

const userIo = io.of("/user");
userIo.on("connection", (socket) => {
  console.log(`connected to user namespace with username : ${socket.username}`);
});

// middleware
userIo.use((socket, next) => {
  //NOTE - if we call next, means we successfully goes to the next middleware
  //      if we call next with error, means we enconter some type of problem and will tell to user the typ of error
  console.log("token", socket.handshake.auth.token);
  if (socket.handshake.auth.token) {
    socket.username = getUsernameFromToken(socket.handshake.auth.token);
    next();
  } else {
    next(new Error("Please send token"));
  }
});

function getUsernameFromToken(token) {
  // NOTE - here you could get token from database from example
  return token;
}

// NOTE - create socket on connection
//      => each time a client connect to the server, log a random id
io.on("connection", (socket) => {
  console.log("id", socket.id);

  // NOTE - listen to the custom event from the client
  //   socket.on("custom-event", (numberValue, stringValue, objectValue) => {
  //     console.log(numberValue, stringValue, objectValue);
  //   });

  socket.on("send-message", (message, room) => {
    //NOTE - if you want to emit to all the socket => use io.emit
    // io.emit("received-message", message);
    //NOTE - if you want to emit to all the socket except the one who emit the event=> use socket.broadcast.emit
    if (room === "") {
      socket.broadcast.emit("received-message", message);
    } else {
      // NOTE - if we want to send message to unique room instead of all connected client => socket.to
      //        (with .to, the broadcast is implicit so no need to precise except of yourself)
      socket.to(room).emit("received-message", message);
    }
  });

  //NOTE - listen to join-room event, to talk to several people but not all
  socket.on("join-room", (room, cb) => {
    socket.join(room, cb);
    cb(`Joined ${room}`);
  });

  //NOTE - listen to ping event
  //NOTE - volatile means if I can't send the message, forget it completely
  socket.volatile.on("ping", (n) => {
    console.log(n);
  });
});

// NOTE - auth is false since we don't have authentification
instrument(io, {
  auth: false,
});
