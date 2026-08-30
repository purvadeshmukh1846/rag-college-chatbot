const Chunk = require("../models/Chunk");
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

    // 1. Question la embedding madhe convert kar
    const questionEmbedding = await getEmbedding(question);

    // 2. Sagळे chunks database madhun ghे
    const allChunks = await Chunk.find();

    if (allChunks.length === 0) {
      return res.json({
        answer:
          "No documents have been uploaded yet. Please upload a document first.",
        sources: [],
      });
    }

    // 3. Pratyek chunk chi similarity calculate kar
    const scoredChunks = allChunks.map((chunk) => ({
      chunk,
      score: cosineSimilarity(questionEmbedding, chunk.embedding),
    }));

    // 4. Top 4 sarvat jast similar chunks nivad
    scoredChunks.sort((a, b) => b.score - a.score);
    const topChunks = scoredChunks.slice(0, 4).map((item) => item.chunk);

    // 5. AI kade answer mागव
    const answer = await generateAnswer(question, topChunks);

    res.json({
      answer,
      sources: topChunks.map((c) => ({ text: c.text.slice(0, 150) + "..." })),
    });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error generating answer", error: err.message });
  }
};

module.exports = { askQuestion };
