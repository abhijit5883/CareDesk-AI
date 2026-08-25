require("dotenv").config();

const { askAI } = require("./services/aiService");

async function test() {
  let previousMessages = [];

  const patientMessages = [
    "I am patient 3. I want an appointment with doctor 1 tomorrow at 5:30 PM.",
    "Yes, book it"
  ];

  for (const message of patientMessages) {
    console.log("\nPATIENT:");
    console.log(message);

    const result = await askAI(message, previousMessages, true);

    console.log("\nAI:");
    console.log(result.response);

    // VERY IMPORTANT:
    // Keep the conversation history
    previousMessages = result.messages;
  }
}

test();
