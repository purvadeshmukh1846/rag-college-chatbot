const express = require("express");
const router = express.Router();
const { askQuestion, getHistory } = require("../controllers/chatController");
const { protect } = require("../middleware/auth");

router.post("/", protect, askQuestion);
router.get("/history", protect, getHistory);

module.exports = router;
