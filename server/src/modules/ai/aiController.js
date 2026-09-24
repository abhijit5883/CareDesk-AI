const { askAI } = require("./aiService");

async function chatWithAI(req, res) {
  try {
    const { message, previousMessages, allowBooking = true } = req.body;

    if (!message || typeof message !== "string") {
      return res.status(400).json({
        success: false,
        message: "A text message is required",
      });
    }

    const result = await askAI(message, previousMessages || [], allowBooking);

    res.json({
      success: true,
      response: result.response,
      messages: result.messages,
    });
  } catch (error) {
    console.error("AI Chat Error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to process message with AI Receptionist",
    });
  }
}

module.exports = {
  chatWithAI,
};
