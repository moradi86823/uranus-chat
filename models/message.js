const { Schema, model } = require("mongoose");

const messageSchema = new Schema(
  {
    senderId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    conversationId: {
      type: Schema.Types.ObjectId,
      ref: "Conversation",
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: ["text", "voice", "photo", "video"],
      default: "text",
    },
  },
  { timestamps: true }
);

const Message = model("Message", messageSchema);
module.exports = Message;
