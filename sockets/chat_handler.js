const chatHandler = (io, socket) => {
  console.log(`Chat handlers attached for: ${socket.id}`);

  socket.on("joinRoom", (conversationId) => {
    socket.join(conversationId);
    console.log(`Socket ${socket.id} joined room: ${conversationId}`);
  });

  socket.on("joinUserRoom", ({ userId }) => {
    socket.join(userId);
    console.log("user connected");
  });

  socket.on("leaveRoom", (conversationId) => {
    socket.leave(conversationId);
    console.log(`Socket ${socket.id} left room: ${conversationId}`);
  });

  socket.on("typing", ({ conversationId, senderId }) => {
    socket.to(conversationId).emit("typing", { senderId });
  });
};

module.exports = chatHandler;
