const express = require("express");
const router = express.Router();
const multer = require("multer");
const {
  uploadDocument,
  getDocuments,
  deleteDocument,
} = require("../controllers/documentController");
const { protect } = require("../middleware/auth");

const upload = multer({ dest: "uploads/" });

router.post("/", protect, upload.single("file"), uploadDocument);
router.get("/", protect, getDocuments);
router.delete("/:id", protect, deleteDocument);

module.exports = router;
