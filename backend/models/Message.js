const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    role: { type: String, enum: ["user", "ai"], required: true },
    text: { type: String, required: true },
    sources: [{ text: String }],
    feedback: { type: String, enum: ["up", "down", null], default: null },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Message", messageSchema);
