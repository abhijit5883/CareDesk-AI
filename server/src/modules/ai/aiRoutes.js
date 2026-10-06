const express = require("express");
const { chatWithAI } = require("./aiController");
const { requireAuth } = require("../../middleware/authMiddleware");

const router = express.Router();

router.post("/chat", requireAuth, chatWithAI);

module.exports = router;