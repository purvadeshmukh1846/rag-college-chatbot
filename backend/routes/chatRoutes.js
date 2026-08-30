const express = require("express");
const router = express.Router();
const { askQuestion } = require("../controllers/chatController");
const { protect } = require("../middleware/auth");

router.post("/", protect, askQuestion);

module.exports = router;
