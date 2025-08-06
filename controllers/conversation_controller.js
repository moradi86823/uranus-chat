const Conversation = require("../models/conversation");
const User = require("../models/user");
const Message = require("../models/message");

const createConversation = async (req, res) => {
  try {
    const { participants, groupName, isGroup } = req.body;

    participants.forEach(async (userId) => {
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({
          message: "User not found",
        });
      }
    });

    const conversation = new Conversation({
      participants,
      groupName,
      isGroup,
    });
    await conversation.save();
    const io = req.app.get("io");
    conversation.participants.forEach((userId) => {
      console.log(userId);

      io.emit("joinUserRoom", { userId: userId.toString() });
    });
    io.emit("joinRoom", { conversationId: conversation.id });
    return res.status(201).json({
      message: "Conversation created",
    });
  } catch (err) {
    return res.status(500).json({
      message: err.message,
    });
  }
};

const getUserConversations = async (req, res) => {
  try {
    const results = [];
    const userId = req.params.userId;
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    const conversations = await Conversation.find({ participants: userId });

    for (const conv of conversations) {
      const lastMessage = await Message.findOne({ conversationId: conv.id })
        .sort({ createdAt: -1 })
        .limit(1);
      if (!conv.isGroup) {
        const otherUserId = conv.participants.find(
          (id) => id.toString() !== user._id.toString()
        );

        const otherUser = await User.findById(otherUserId);

        results.push({
          conversationId: conv.id,
          otherUser: otherUser.name,
          otherUserId: otherUser.id,
          groupName: "",
          lastMessage: lastMessage,
          isGroup: conv.isGroup,
        });
      } else {
        results.push({
          conversationId: conv.id,
          groupName: conv.groupName,
          otherUser: "",
          otherUserId: "",
          lastMessage: lastMessage,
          isGroup: conv.isGroup,
        });
      }
    }
    res.status(200).json(results);
  } catch (err) {
    return res.status(500).json({
      message: err.message,
    });
  }
};

module.exports = {
  createConversation,
  getUserConversations,
};
