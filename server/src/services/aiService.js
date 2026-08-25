require("dotenv").config();
function getTodayDate() {
  const now = new Date();

  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function getTomorrowDate() {
  const tomorrow = new Date();

  tomorrow.setDate(tomorrow.getDate() + 1);

  const year = tomorrow.getFullYear();
  const month = String(tomorrow.getMonth() + 1).padStart(2, "0");
  const day = String(tomorrow.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

const OpenAI = require("openai");
const {
  checkAvailabilityTool,
  bookAppointmentTool,
  cancelAppointmentTool,
  rescheduleAppointmentTool,
  findPatientAppointmentTool,
} = require("../tools/appointmentTools");

const client = new OpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: process.env.OPENROUTER_API_KEY,
});

const checkAvailabilityFunction = {
  type: "function",
  function: {
    name: "check_availability",
    description:
      "Checks whether a doctor's appointment slot is available on a specific date and time.",
    parameters: {
      type: "object",
      properties: {
        doctorId: {
          type: "integer",
          description: "The ID of the doctor.",
        },
        appointmentDate: {
          type: "string",
          description: "Appointment date in YYYY-MM-DD format.",
        },
        startTime: {
          type: "string",
          description: "Appointment start time in HH:MM 24-hour format.",
        },
      },
      required: ["doctorId", "appointmentDate", "startTime"],
    },
  },
};

const bookAppointmentFunction = {
  type: "function",
  function: {
    name: "book_appointment",
    description:
      "Books an appointment. Only use this after checking availability AND receiving explicit confirmation from the patient.",
    parameters: {
      type: "object",
      properties: {
        patientId: {
          type: "integer",
          description: "The ID of the patient.",
        },
        doctorId: {
          type: "integer",
          description: "The ID of the doctor.",
        },
        appointmentDate: {
          type: "string",
          description: "Appointment date in YYYY-MM-DD format.",
        },
        startTime: {
          type: "string",
          description: "Appointment start time in HH:MM 24-hour format.",
        },
        reason: {
          type: "string",
          description: "Optional reason for the appointment.",
        },
      },
      required: ["patientId", "doctorId", "appointmentDate", "startTime"],
    },
  },
};

const cancelAppointmentFunction = {
  type: "function",
  function: {
    name: "cancel_appointment",
    description:
      "Cancels an existing appointment after the patient clearly requests cancellation.",
    parameters: {
      type: "object",
      properties: {
        appointmentId: {
          type: "integer",
          description: "The appointment ID.",
        },
      },
      required: ["appointmentId"],
    },
  },
};

const rescheduleAppointmentFunction = {
  type: "function",
  function: {
    name: "reschedule_appointment",
    description:
      "Reschedules an existing booked appointment to a new date and time.",
    parameters: {
      type: "object",
      properties: {
        appointmentId: {
          type: "integer",
          description: "The appointment ID.",
        },
        newDate: {
          type: "string",
          description: "New appointment date in YYYY-MM-DD format.",
        },
        newTime: {
          type: "string",
          description: "New appointment time in HH:MM 24-hour format.",
        },
      },
      required: ["appointmentId", "newDate", "newTime"],
    },
  },
};
const findPatientAppointmentFunction = {
  type: "function",
  function: {
    name: "find_patient_appointment",
    description:
      "Finds a patient's existing booked appointment using patient ID and optional doctor, date, and time.",
    parameters: {
      type: "object",
      properties: {
        patientId: {
          type: "integer",
          description: "The patient's ID.",
        },
        doctorId: {
          type: "integer",
          description: "The doctor's ID, if known.",
        },
        appointmentDate: {
          type: "string",
          description: "Appointment date in YYYY-MM-DD format.",
        },
        startTime: {
          type: "string",
          description: "Appointment time in HH:MM 24-hour format.",
        },
      },
      required: ["patientId"],
    },
  },
};

const tools = [
  checkAvailabilityFunction,
  bookAppointmentFunction,
  cancelAppointmentFunction,
  rescheduleAppointmentFunction,
  findPatientAppointmentFunction,
];

async function askAI(message, previousMessages = [], allowBooking = false) {
  const today = getTodayDate();
  const tomorrow = getTomorrowDate();
  const systemMessage = {
    role: "system",
    content: `
You are Riya, the AI receptionist for a dental clinic.



Rules:

DATE AND BOOKING WINDOW:
- Today's date is ${today}.
- Tomorrow's date is ${tomorrow}.
- Resolve relative dates such as "today", "tomorrow", "next Monday", etc. using the current date.
- Never ask the patient to convert a date into YYYY-MM-DD.
- Appointments can be booked up to 7 days ahead.
- Never allow appointments in the past.
- If the patient requests a date beyond the 7-day booking window, explain that appointments can currently be booked only up to 7 days ahead.
- Always use the actual resolved date when calling appointment tools.

BOOKING:
- Never invent or assume an appointment time.
- If the patient has not provided a specific time, ask what time they prefer.
- Only call check_availability after the patient provides a specific appointment time.
- Always check availability before booking an appointment.
- If check_availability says the requested slot is unavailable, NEVER call book_appointment for that slot.
- If a slot is unavailable, tell the patient and offer the available alternatives returned by the tool.
- Only call book_appointment after:
  1. check_availability confirms that the requested slot is available.
  2. The patient explicitly confirms that exact slot.
- Never book an appointment without explicit patient confirmation.
- Never book an unavailable appointment.
- If the patient changes the requested time, check availability again for the new time.
- Keep responses short, clear, and natural.

CANCELLATION:
- For cancellation, first use find_patient_appointment to identify the patient's current booked appointment.
- Never ask the patient for an appointment ID if the appointment can be found using their patient ID and appointment details.
- If an appointment is found, clearly tell the patient which appointment was found.
- Ask for explicit confirmation before cancelling.
- Only call cancel_appointment after the patient explicitly confirms the cancellation.
- Never cancel an appointment without confirmation.
- Never cancel an appointment that is already cancelled.
- After successful cancellation, clearly tell the patient that the appointment has been cancelled.

RESCHEDULING:
- For rescheduling, first use find_patient_appointment to identify the patient's current booked appointment.
- If the patient provides an old appointment time, compare it with the actual appointment returned by the tool.
- If the details do not match, clearly tell the patient the actual appointment details and ask whether they want to reschedule that appointment.
- Determine the new requested date and time from the patient's message.
- Apply the 7-day booking-window rule to the new date.
- Before rescheduling, call check_availability for the new date and time.
- Never reschedule into an unavailable slot.
- If the new slot is unavailable, tell the patient and offer the alternatives returned by check_availability.
- Ask for explicit confirmation before calling reschedule_appointment.
- Only call reschedule_appointment after the new slot has been confirmed available and the patient explicitly confirms.
- Never reschedule a cancelled appointment.
- After successful rescheduling, report the actual old appointment time and the actual new appointment time returned by the system.
`,
  };

  let messages = [
    systemMessage,
    ...previousMessages,
    {
      role: "user",
      content: message,
    },
  ];

  while (true) {
    const response = await client.chat.completions.create({
      model: "openrouter/free",

      messages,

      tools: allowBooking ? tools : [checkAvailabilityFunction],

      tool_choice: "auto",
    });

    const assistantMessage = response.choices[0].message;

    console.log("\nAI MESSAGE:");
    console.log(assistantMessage.content);

    // No tool call → final response
    if (!assistantMessage.tool_calls?.length) {
      return {
        response: assistantMessage.content,
        messages,
      };
    }

    // Save assistant tool-call message
    messages.push(assistantMessage);

    for (const toolCall of assistantMessage.tool_calls) {
      const toolName = toolCall.function.name;

      let args;

      try {
        args = JSON.parse(toolCall.function.arguments);
      } catch (error) {
        console.error("Invalid tool arguments:", toolCall.function.arguments);

        messages.push({
          role: "tool",
          tool_call_id: toolCall.id,
          content: JSON.stringify({
            success: false,
            error: "Invalid tool arguments",
          }),
        });

        continue;
      }

      console.log("\nAI WANTS TO CALL:", toolName);
      console.log("Arguments:", args);

      let result;

      try {
        if (toolName === "check_availability") {
          result = await checkAvailabilityTool(args);
        } else if (toolName === "find_patient_appointment") {
          result = await findPatientAppointmentTool(args);
        } else if (toolName === "book_appointment" && allowBooking) {
          result = await bookAppointmentTool(args);
        } else if (toolName === "cancel_appointment") {
          result = await cancelAppointmentTool(args);
        } else if (toolName === "reschedule_appointment") {
          result = await rescheduleAppointmentTool(args);
        } else {
          result = {
            success: false,
            error: "Unknown or unavailable tool",
          };
        }
      } catch (error) {
        result = {
          success: false,
          error: error.message,
        };
      }

      console.log("TOOL RESULT:", result);

      messages.push({
        role: "tool",
        tool_call_id: toolCall.id,
        content: JSON.stringify(result),
      });
    }
  }
}

module.exports = {
  askAI,
};
