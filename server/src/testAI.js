const { askAI } = require("./services/aiService");

async function test() {
  console.log("\n==============================");
  console.log("   ALTERNATIVE SLOT TEST");
  console.log("==============================\n");

  let previousMessages = [];

  // ==========================================================
  // STEP 1: Request an unavailable slot
  // ==========================================================

  const firstMessage =
    "I am patient 3. I want an appointment tomorrow at 6:30 PM with doctor 1.";

  console.log("PATIENT:");
  console.log(firstMessage);

  let result = await askAI(
    firstMessage,
    previousMessages,
    true // Enable booking/modifications
  );

  console.log("\nAI:");
  console.log(result.response);

  previousMessages = result.messages;

  // ==========================================================
  // STEP 2: Ambiguous confirmation
  // AI should NOT choose an alternative automatically
  // ==========================================================

  const secondMessage = "Yes, book it.";

  console.log("\nPATIENT:");
  console.log(secondMessage);

  result = await askAI(
    secondMessage,
    previousMessages,
    true
  );

  console.log("\nAI:");
  console.log(result.response);

  previousMessages = result.messages;

  // ==========================================================
  // STEP 3: Patient explicitly selects alternative
  // ==========================================================

  const thirdMessage = "7:00 PM";

  console.log("\nPATIENT:");
  console.log(thirdMessage);

  result = await askAI(
    thirdMessage,
    previousMessages,
    true
  );

  console.log("\nAI:");
  console.log(result.response);

  previousMessages = result.messages;

  // ==========================================================
  // STEP 4: Explicit confirmation
  // ==========================================================

  const fourthMessage = "Yes, book it.";

  console.log("\nPATIENT:");
  console.log(fourthMessage);

  result = await askAI(
    fourthMessage,
    previousMessages,
    true
  );

  console.log("\nAI:");
  console.log(result.response);

  console.log("\n==============================");
  console.log("       TEST COMPLETED");
  console.log("==============================\n");
}

test().catch((error) => {
  console.error("\n❌ TEST ERROR:");
  console.error(error);
});