const mongoose = require("mongoose");

const chunkSchema = new mongoose.Schema(
  {
    documentId: { type: mongoose.Schema.Types.ObjectId, ref: "Document" },
    text: { type: String, required: true },
    embedding: { type: [Number], required: true },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Chunk", chunkSchema);
