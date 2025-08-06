const { Router } = require("express");
const messageController = require("../controllers/message_controller");

const messageRouter = Router();

messageRouter.get(
  "/:conversationId",
  messageController.getConversationMessages
);
messageRouter.post("/", messageController.sendMessage);

module.exports = messageRouter;
