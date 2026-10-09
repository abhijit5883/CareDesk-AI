const express = require("express");
const {
  verifyWebhookController,
  incomingWebhookController,
} = require("./whatsappController");

const router = express.Router();

router.get("/webhook", verifyWebhookController);
router.post("/webhook", incomingWebhookController);

module.exports = router;
