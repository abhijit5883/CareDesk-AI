const { verifyWebhook, handleIncomingWebhook } = require("./whatsappService");

/**
 * GET /api/whatsapp/webhook
 * Meta webhook verification (subscription handshake).
 */
const verifyWebhookController = (req, res) => {
  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];

  const result = verifyWebhook(mode, token, challenge);
  return res.status(result.status).send(result.body);
};

/**
 * POST /api/whatsapp/webhook
 * Receives incoming webhook events from Meta.
 * Returns 200 immediately so Meta does not retry.
 */
const incomingWebhookController = (req, res) => {
  handleIncomingWebhook(req.body);
  return res.sendStatus(200);
};

module.exports = { verifyWebhookController, incomingWebhookController };
