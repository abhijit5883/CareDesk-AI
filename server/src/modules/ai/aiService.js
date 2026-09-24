require("dotenv").config();

const OpenAI = require("openai");

const {
  checkAvailabilityTool,
  bookAppointmentTool,
  cancelAppointmentTool,
  rescheduleAppointmentTool,
  findPatientAppointmentTool,
} = require("../../tools/appointmentTools");

// ============================================================
// DATE HELPERS
// ============================================================

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

// ============================================================
// OPENROUTER CLIENT
// ============================================================

const client = new OpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: process.env.OPENROUTER_API_KEY || "dummy-key-for-initialization",
});

// ============================================================
// TOOL DEFINITIONS
// ============================================================

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
          description:
            "Appointment start time in HH:MM 24-hour format, for example 17:30.",
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
      "Books an appointment only after availability has been checked and the patient has explicitly confirmed the exact available slot.",
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

      required: [
        "patientId",
        "doctorId",
        "appointmentDate",
        "startTime",
      ],
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

const cancelAppointmentFunction = {
  type: "function",
  function: {
    name: "cancel_appointment",
    description:
      "Cancels an existing appointment only after the patient explicitly confirms the cancellation.",
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
      "Reschedules an existing booked appointment only after the new slot has been checked and the patient explicitly confirms the new slot.",
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

// ============================================================
// ALL TOOLS
// ============================================================

const tools = [
  checkAvailabilityFunction,
  bookAppointmentFunction,
  findPatientAppointmentFunction,
  cancelAppointmentFunction,
  rescheduleAppointmentFunction,
];

// ============================================================
// AI SERVICE
// ============================================================

async function askAI(
  message,
  previousMessages = [],
  allowBooking = false
) {
  // Safety against undefined/null/non-array history
  if (!Array.isArray(previousMessages)) {
    previousMessages = [];
  }

  const today = getTodayDate();
  const tomorrow = getTomorrowDate();

  // ==========================================================
  // SYSTEM PROMPT
  // ==========================================================

  const systemMessage = {
    role: "system",

    content: `
You are Riya, the AI receptionist for a dental clinic.

Your job is to help patients with:
- Booking appointments
- Checking appointment availability
- Cancelling appointments
- Rescheduling appointments

The appointment backend is authoritative.
Never claim an appointment was booked, cancelled, or rescheduled unless the corresponding tool successfully confirms it.

============================================================
DATE AND BOOKING WINDOW
============================================================

- Today's date is ${today}.
- Tomorrow's date is ${tomorrow}.
- Resolve relative dates such as "today", "tomorrow", "next Monday", etc. using the current date.
- Never ask the patient to convert a date into YYYY-MM-DD.
- Appointments can be booked up to 7 days ahead.
- Never allow appointments in the past.
- If the patient requests a date beyond the 7-day booking window, explain that appointments can currently be booked only up to 7 days ahead.
- Always use the actual resolved date when calling appointment tools.
- Never use an old example date from the conversation as the current date.

============================================================
BOOKING
============================================================

- A doctor must be explicitly identified before checking availability or booking.
- Never invent or assume a doctor.
- If the doctor is missing, ask which doctor the patient wants.
- A specific appointment time must be provided before checking availability.
- If either doctor or time is missing, ask only for the missing information.
- Only call check_availability when both doctor and time are known.
- Always check availability before booking.

============================================================
WHEN SLOT IS AVAILABLE
============================================================

If check_availability says the requested slot is available:

1. Tell the patient that the exact requested slot is available.
2. Ask for explicit confirmation.
3. Do NOT book yet.

Only call book_appointment after:

1. Doctor is explicitly identified.
2. Date is resolved.
3. Exact time is provided.
4. check_availability confirms that exact slot is available.
5. Patient explicitly confirms that exact slot.

Never book without explicit confirmation.

============================================================
WHEN SLOT IS UNAVAILABLE
============================================================

If check_availability says the requested slot is unavailable:

- NEVER call book_appointment for that unavailable slot.
- Tell the patient that the requested slot is unavailable.
- Offer only the alternatives returned by the tool.
- Never invent alternative times.
- Never choose an alternative on behalf of the patient.

If multiple alternatives are available:

- If the patient says "yes", "book it", "okay", or similar without selecting a specific time, ask which alternative they want.
- Do not automatically choose the first alternative.
- Do not automatically choose the closest alternative.

When the patient selects a specific alternative:

1. Call check_availability again for that exact date, doctor and time.
2. If available, tell the patient it is available.
3. Ask for explicit confirmation.
4. Only after explicit confirmation call book_appointment.

If the selected alternative is no longer available:

- Do not book it.
- Tell the patient.
- Offer the new alternatives returned by check_availability.

============================================================
BOOKING SAFETY
============================================================

- Never book an unavailable appointment.
- Never choose an alternative time for the patient.
- Never interpret an ambiguous "yes" as selecting between multiple options.
- Never skip check_availability.
- If doctor, date, or time changes, check availability again.
- The backend result is authoritative.
- Keep responses short, clear and natural.

============================================================
CANCELLATION
============================================================

For cancellation:

1. First use find_patient_appointment.
2. Use the patient's ID and appointment details to find the appointment.
3. Do not ask for an appointment ID if the appointment can be found.
4. If an appointment is found, clearly tell the patient which appointment was found.
5. Ask for explicit confirmation.
6. Only call cancel_appointment after explicit confirmation.
7. Never cancel without confirmation.
8. Never cancel an already cancelled appointment.
9. After successful cancellation, clearly confirm that it was cancelled.

============================================================
RESCHEDULING
============================================================

For rescheduling:

1. First use find_patient_appointment.
2. Identify the patient's actual current booked appointment.
3. If the patient provides an old appointment time, compare it with the actual appointment returned by the tool.
4. If the details do not match, tell the patient the actual appointment details.
5. Ask whether they want to reschedule that actual appointment.
6. Determine the new date and time.
7. Apply the 7-day booking window to the new date.
8. Check availability for the new date and time.
9. Never reschedule into an unavailable slot.
10. If unavailable, offer only alternatives returned by the tool.
11. Never choose an alternative on behalf of the patient.
12. If the patient selects an alternative, check availability again.
13. Ask for explicit confirmation before rescheduling.
14. Only call reschedule_appointment after availability is confirmed and the patient explicitly confirms.
15. Never reschedule a cancelled appointment.
16. After successful rescheduling, report the actual old appointment and new appointment details.

============================================================
GENERAL BEHAVIOR
============================================================

- Keep responses short and natural.
- Do not expose internal tool details to the patient.
- Do not expose internal IDs unless useful.
- Never claim success before the tool returns success.
- Never make up database information.
`,
  };

  // ==========================================================
  // CONVERSATION
  // ==========================================================

  let messages = [
    systemMessage,
    ...previousMessages,
    {
      role: "user",
      content: message,
    },
  ];

  // ==========================================================
  // TOOL LOOP
  // ==========================================================

  while (true) {
    const response = await client.chat.completions.create({
      model: "openrouter/free",

      messages,

      /*
       * Always expose all tools.
       *
       * allowBooking is handled by the execution layer below.
       * This prevents the model from seeing a tool definition
       * but then receiving "Unknown or unavailable tool".
       */
      tools,

      tool_choice: "auto",
    });

    const assistantMessage = response.choices[0].message;

    console.log("\nAI MESSAGE:");
    console.log(assistantMessage.content);

    // ========================================================
    // NO TOOL CALL
    // ========================================================

    if (!assistantMessage.tool_calls?.length) {
      return {
        response: assistantMessage.content,
        messages,
      };
    }

    // Save assistant message containing tool calls
    messages.push(assistantMessage);

    // ========================================================
    // EXECUTE TOOL CALLS
    // ========================================================

    for (const toolCall of assistantMessage.tool_calls) {
      const toolName = toolCall.function.name;

      let args;

      try {
        args = JSON.parse(toolCall.function.arguments);
      } catch (error) {
        console.error(
          "Invalid tool arguments:",
          toolCall.function.arguments
        );

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
        // ====================================================
        // CHECK AVAILABILITY
        // ====================================================

        if (toolName === "check_availability") {
          result = await checkAvailabilityTool(args);
        }

        // ====================================================
        // FIND PATIENT APPOINTMENT
        // ====================================================

        else if (toolName === "find_patient_appointment") {
          result = await findPatientAppointmentTool(args);
        }

        // ====================================================
        // BOOK APPOINTMENT
        // ====================================================

        else if (toolName === "book_appointment") {
          if (!allowBooking) {
            result = {
              success: false,
              error:
                "Booking is currently disabled. Do not book this appointment.",
            };
          } else {
            result = await bookAppointmentTool(args);
          }
        }

        // ====================================================
        // CANCEL APPOINTMENT
        // ====================================================

        else if (toolName === "cancel_appointment") {
          if (!allowBooking) {
            result = {
              success: false,
              error:
                "Appointment modification is currently disabled.",
            };
          } else {
            result = await cancelAppointmentTool(args);
          }
        }

        // ====================================================
        // RESCHEDULE APPOINTMENT
        // ====================================================

        else if (toolName === "reschedule_appointment") {
          if (!allowBooking) {
            result = {
              success: false,
              error:
                "Appointment modification is currently disabled.",
            };
          } else {
            result = await rescheduleAppointmentTool(args);
          }
        }

        // ====================================================
        // UNKNOWN TOOL
        // ====================================================

        else {
          result = {
            success: false,
            error: `Unknown tool: ${toolName}`,
          };
        }
      } catch (error) {
        console.error(`Tool ${toolName} failed:`, error);

        result = {
          success: false,
          error: error.message,
        };

        // Preserve alternatives if backend provides them
        if (error.alternatives) {
          result.alternatives = error.alternatives;
        }
      }

      console.log("TOOL RESULT:", result);

      // ========================================================
      // SEND TOOL RESULT BACK TO MODEL
      // ========================================================

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