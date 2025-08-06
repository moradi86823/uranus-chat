const bodyParser = require("body-parser");
const cors = require("cors");
const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const connectDB = require("./helpers/database");

const authRoutes = require("./routes/auth_routes");
const jwtAuth = require("./middlewares/jwt_auth");
const errorHandler = require("./middlewares/error_handler");
const socketHandlers = require("./sockets");
const conversationRouter = require("./routes/conversation_routes");
const messageRouter = require("./routes/message_routes");
const userRouter = require("./routes/user_routes");

//dotenv
require("dotenv").config();

connectDB();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*", methods: ["GET", "POST"] },
});

app.use(bodyParser.json());
app.use(cors());
app.use(jwtAuth());
app.use(errorHandler);
socketHandlers(io);

app.set("io", io);

app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/conversations", conversationRouter);
app.use("/api/v1/messages", messageRouter);
app.use("/api/v1/users", userRouter);

app.use("/api/v1/users", (req, res) => {
  return res.status(200).json({
    message: "test",
  });
});

app.use((req, res, next) => {
  res.status(404).json({
    status: 404,
    message: "Not Found",
  });
});

server.listen(process.env.PORT, () => {
  console.log("Server is running!");
});
