const { Schema, model } = require("mongoose");

const tokenSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  refreshToken: {
    type: String,
    required: true,
  },
  accessToken: String,
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 60 * 86400,
  },
});

const Token = model("Token", tokenSchema);
module.exports = Token;
