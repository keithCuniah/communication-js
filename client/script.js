import { io } from "socket.io-client";

const joinRoomButton = document.getElementById("room-button");
const messageInput = document.getElementById("message-input");
const roomInput = document.getElementById("room-input");
const form = document.getElementById("form");

// NOTE - init socket and connect to the server url
const socket = io("http://localhost:3000");
const userSocket = io("http://localhost:3000/user", {
  auth: { token: "test" },
});

//NOTE - event everytime we connect to our server
socket.on("connect", () => {
  displayMessage(`You connect with id :${socket.id}`);
  // NOTE - emit event from client to server.
  //        Be sure to put the emit on the connect callback and not after, or you may have problem ...
  // socket.emit("custom-event", 10, "Hola from client", { a: "a" });
});

userSocket.on("connect-error", (error) => {
  displayMessage(error);
});

socket.on("received-message", (message) => {
  displayMessage(message);
});

form.addEventListener("submit", (e) => {
  e.preventDefault();
  const message = messageInput.value;
  const room = roomInput.value;

  if (message === "") return;
  displayMessage(message);

  socket.emit("send-message", message, room);

  messageInput.value = "";
});

joinRoomButton.addEventListener("click", () => {
  const room = roomInput.value;

  // NOTE - this is if we want to talk to several people but not everyone
  socket.emit("join-room", room, (message) => {
    displayMessage(message);
  });
});

function displayMessage(message) {
  const div = document.createElement("div");
  div.textContent = message;
  document.getElementById("message-container").append(div);
}

let count = 0;
setInterval(() => {
  socket.emit("ping", ++count, 1000);
});
//NOTE - eventListner for connection/disconnection of socket
document.addEventListener("keydown", (e) => {
  if (e.target.matches("input")) return;

  if (e.key === "c") socket.connect();
  if (e.key === "d") socket.disconnect();
});
