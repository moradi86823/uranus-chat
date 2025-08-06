const authSocket = require("./auth_handler");
const chatSocket = require("./chat_handler");

module.exports = (io) => {
  io.use(authSocket);
  io.on("connection", (socket) => {
    console.log(`Socket connected : ${socket.id}`);
    chatSocket(io, socket);
    socket.on("disconnect", () =>
      console.log(`Socket disconnected: ${socket.id}`)
    );
  });
};
