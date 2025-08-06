const Conversation = require("../models/conversation");
const Message = require("../models/message");
const User = require("../models/user");

const getConversationMessages = async (req, res) => {
  try {
    const conversationId = req.params.conversationId;
    const conversation = await Conversation.findById(conversationId);
    if (!conversation)
      return res.status(404).json({ message: "Conversation not found" });

    const messages = await Message.find({ conversationId });
    res.status(200).json(messages);
  } catch (err) {
    return res.status(500).json({
      message: err.message,
    });
  }
};

const sendMessage = async (req, res) => {
  try {
    const { senderId, conversationId, content, participants } = req.body;

    const user = await User.findById(senderId);
    if (!user) return res.status(404).json({ message: "User not found" });

    let conversation;

    if (conversationId) {
      conversation = await Conversation.findById(conversationId);
      if (!conversation)
        return res.status(404).json({ message: "Conversation not found" });
    } else {
      // اگر conversationId نداشتیم، بررسی می‌کنیم آیا مکالمه‌ای بین این دو نفر هست
      if (!participants || participants.length !== 2)
        return res.status(400).json({ message: "Invalid participants" });

      conversation = await Conversation.findOne({
        participants: { $all: participants, $size: 2 },
      });

      if (!conversation) {
        conversation = new Conversation({ participants });
        await conversation.save();
      }
    }

    const message = new Message({
      senderId,
      conversationId: conversation.id,
      content,
      type: "text",
    });

    await message.save();

    const io = req.app.get("io");

    conversation.participants.forEach((userId) => {
      io.to(userId.toString()).emit("newMessage", message);
    });

    return res.status(201).json({ message, conversationId: conversation._id });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

module.exports = {
  getConversationMessages,
  sendMessage,
};
