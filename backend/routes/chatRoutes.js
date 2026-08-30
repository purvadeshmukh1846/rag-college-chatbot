const express = require("express");
const router = express.Router();
const {
  askQuestion,
  getHistory,
  submitFeedback,
  getSuggestedQuestions,
} = require("../controllers/chatController");
const { protect } = require("../middleware/auth");

router.post("/", protect, askQuestion);
router.get("/history", protect, getHistory);
router.post("/feedback", protect, submitFeedback);
router.get("/suggestions", protect, getSuggestedQuestions);

module.exports = router;
