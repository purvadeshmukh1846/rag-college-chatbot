const Chunk = require("../models/Chunk");
const Message = require("../models/Message");
const {
  getEmbedding,
  generateAnswer,
  cosineSimilarity,
} = require("../services/aiService");

const askQuestion = async (req, res) => {
  try {
    const { question } = req.body;
    if (!question) {
      return res.status(400).json({ message: "Question is required" });
    }

    await Message.create({ userId: req.user.id, role: "user", text: question });

    const questionEmbedding = await getEmbedding(question);
    const allChunks = await Chunk.find();

    if (allChunks.length === 0) {
      const answer =
        "No documents have been uploaded yet. Please upload a document first.";
      const aiMsg = await Message.create({
        userId: req.user.id,
        role: "ai",
        text: answer,
        sources: [],
      });
      return res.json({ answer, sources: [], messageId: aiMsg._id });
    }

    const scoredChunks = allChunks.map((chunk) => ({
      chunk,
      score: cosineSimilarity(questionEmbedding, chunk.embedding),
    }));

    scoredChunks.sort((a, b) => b.score - a.score);
    const topChunks = scoredChunks.slice(0, 4).map((item) => item.chunk);

    const answer = await generateAnswer(question, topChunks);
    const sources = topChunks.map((c) => ({
      text: c.text.slice(0, 150) + "...",
    }));

    const aiMsg = await Message.create({
      userId: req.user.id,
      role: "ai",
      text: answer,
      sources,
    });

    res.json({ answer, sources, messageId: aiMsg._id });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error generating answer", error: err.message });
  }
};

const getHistory = async (req, res) => {
  try {
    const messages = await Message.find({ userId: req.user.id }).sort({
      createdAt: 1,
    });
    res.json({ messages });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// Feedback save karnyasathi
const submitFeedback = async (req, res) => {
  try {
    const { messageId, feedback } = req.body; // feedback: 'up' or 'down'
    await Message.findByIdAndUpdate(messageId, { feedback });
    res.json({ message: "Feedback recorded" });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// Suggested questions - documents var based generic suggestions
const getSuggestedQuestions = async (req, res) => {
  try {
    const chunkCount = await Chunk.countDocuments();
    if (chunkCount === 0) {
      return res.json({ suggestions: [] });
    }
    const suggestions = [
      "What is this document about?",
      "Summarize the key points",
      "What are the important dates or deadlines mentioned?",
      "Are there any requirements or eligibility criteria?",
    ];
    res.json({ suggestions });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

module.exports = {
  askQuestion,
  getHistory,
  submitFeedback,
  getSuggestedQuestions,
};
