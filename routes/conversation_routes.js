const { Router } = require("express");
const conversationController = require("../controllers/conversation_controller");

const conversationRouter = Router();

conversationRouter.post("/", conversationController.createConversation);
conversationRouter.get("/:userId", conversationController.getUserConversations);

module.exports = conversationRouter;
