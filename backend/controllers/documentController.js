const fs = require("fs");
const pdfParse = require("pdf-parse");
const Document = require("../models/Document");
const Chunk = require("../models/Chunk");
const { getEmbedding, chunkText } = require("../services/aiService");

// Upload + process document
const uploadDocument = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const dataBuffer = fs.readFileSync(req.file.path);
    const pdfData = await pdfParse(dataBuffer);
    const fullText = pdfData.text;

    const document = await Document.create({
      title: req.body.title || req.file.originalname,
      filename: req.file.originalname,
      uploadedBy: req.user.id,
    });

    const textChunks = chunkText(fullText);

    for (const text of textChunks) {
      const embedding = await getEmbedding(text);
      await Chunk.create({
        documentId: document._id,
        text,
        embedding,
      });
    }

    fs.unlinkSync(req.file.path); // temp file delete kar

    res.status(201).json({
      message: "Document uploaded and processed",
      document,
      chunksCreated: textChunks.length,
    });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error processing document", error: err.message });
  }
};

// List all documents
const getDocuments = async (req, res) => {
  try {
    const documents = await Document.find().sort({ createdAt: -1 });
    res.json({ documents });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// Delete document + its chunks
const deleteDocument = async (req, res) => {
  try {
    await Chunk.deleteMany({ documentId: req.params.id });
    await Document.findByIdAndDelete(req.params.id);
    res.json({ message: "Document deleted" });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

module.exports = { uploadDocument, getDocuments, deleteDocument };
