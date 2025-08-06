const { Schema, model } = require("mongoose");

const conversationSchema = new Schema(
  {
    participants: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    isGroup: {
      type: Boolean,
      default: false,
    },
    groupName: String,
  },
  { timestamps: true }
);

const Conversation = model("Conversation", conversationSchema);
module.exports = Conversation;
