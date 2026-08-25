const {
  checkAvailabilityTool,
} = require("./tools/appointmentTools");

async function test() {
  const result = await checkAvailabilityTool({
    doctorId: 1,
    appointmentDate: "2026-08-25",
    startTime: "17:30",
  });

  console.log(result);
}

test();