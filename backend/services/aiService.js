const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Text ला embedding madhe convert karnyasathi
async function getEmbedding(text) {
  const model = genAI.getGenerativeModel({ model: "gemini-embedding-001" });
  const result = await model.embedContent(text);
  return result.embedding.values;
}

// Chunking function - pura text ghеऊन chhote pieces madhe todते
function chunkText(text, chunkSize = 800, overlap = 100) {
  const chunks = [];
  let start = 0;
  while (start < text.length) {
    const end = start + chunkSize;
    chunks.push(text.slice(start, end));
    start = end - overlap;
  }
  return chunks.filter((c) => c.trim().length > 20);
}

// AI कडून answer मिळवण्यासाठी
async function generateAnswer(question, contextChunks) {
  const model = genAI.getGenerativeModel({ model: "gemini-3.6-flash" });

  const context = contextChunks
    .map((c, i) => `[Source ${i + 1}]: ${c.text}`)
    .join("\n\n");

  const prompt = `You are a helpful college assistant. Answer the question using ONLY the context below. If the context does not contain the answer, say "I don't have information about that in the uploaded documents."

Context:
${context}

Question: ${question}

Answer:`;

  const result = await model.generateContent(prompt);
  return result.response.text();
}

// Cosine similarity calculate karnyasathi (2 vectors kitpat similar aahet)
function cosineSimilarity(vecA, vecB) {
  let dotProduct = 0,
    normA = 0,
    normB = 0;
  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

module.exports = { getEmbedding, chunkText, generateAnswer, cosineSimilarity };
