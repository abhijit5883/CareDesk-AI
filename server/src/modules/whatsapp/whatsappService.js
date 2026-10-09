/**
 * WhatsApp Webhook Service
 *
 * Handles verification and incoming message processing for Meta's WhatsApp webhook.
 * WHATSAPP_VERIFY_TOKEN must be set in .env
 */

/**
 * Verifies the webhook subscription request from Meta.
 * @param {string} mode - hub.mode from query params
 * @param {string} token - hub.verify_token from query params
 * @param {string} challenge - hub.challenge from query params
 * @returns {{ status: number, body: string|number }}
 */
const verifyWebhook = (mode, token, challenge) => {
  const verifyToken = process.env.WHATSAPP_VERIFY_TOKEN;

  if (mode === "subscribe" && token === verifyToken) {
    console.log("[WhatsApp] Webhook verified successfully.");
    return { status: 200, body: challenge };
  }

  console.warn("[WhatsApp] Webhook verification failed.");
  return { status: 403, body: "Forbidden" };
};

/**
 * Processes an incoming webhook payload from Meta.
 * For now, simply logs the payload — no AI or booking integration yet.
 * @param {object} payload - The full request body from Meta
 */
const handleIncomingWebhook = (payload) => {
  console.log(
    "[WhatsApp] Incoming webhook payload:",
    JSON.stringify(payload, null, 2)
  );
};

module.exports = { verifyWebhook, handleIncomingWebhook };
