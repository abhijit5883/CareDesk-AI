require("dotenv").config();

const OpenAI = require("openai");

const {
  checkAvailabilityTool,
  bookAppointmentTool,
  cancelAppointmentTool,
  rescheduleAppointmentTool,
  findPatientAppointmentTool,
} = require("../../tools/appointmentTools");

const {
  findPatientTool,
  createPatientTool,
} = require("../../tools/patientTools");

const {
  findDoctorTool,
} = require("../../tools/doctorTools");

// ============================================================
// DATE HELPERS
// ============================================================

function formatDate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function getTodayDate() {
  return formatDate(new Date());
}

function getTomorrowDate() {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);

  return formatDate(tomorrow);
}

// ============================================================
// OPENROUTER CLIENT
// ============================================================

const client = new OpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey:
    process.env.OPENROUTER_API_KEY ||
    "dummy-key-for-initialization",
});

// ============================================================
// TOOL DEFINITIONS
// ============================================================

// ============================================================
// CHECK AVAILABILITY
// ============================================================

const checkAvailabilityFunction = {
  type: "function",

  function: {
    name: "check_availability",

    description:
      "Check whether a specific doctor has an appointment slot available at the hospital on a specific date and time. Use this before booking or rescheduling.",

    parameters: {
      type: "object",

      properties: {
        doctorId: {
          type: "integer",
          description:
            "Internal doctor ID obtained from find_doctor. Never invent this ID.",
        },

        appointmentDate: {
          type: "string",
          description:
            "Appointment date in YYYY-MM-DD format.",
        },

        startTime: {
          type: "string",
          description:
            "Appointment start time in HH:MM 24-hour format. Example: 10:00, 12:30, 16:00, 20:30.",
        },
      },

      required: [
        "doctorId",
        "appointmentDate",
        "startTime",
      ],
    },
  },
};

// ============================================================
// FIND PATIENT
// ============================================================

const findPatientFunction = {
  type: "function",

  function: {
    name: "find_patient",

    description:
      "Find an existing patient in the current hospital using the patient's name or phone number. Never invent a patient ID.",

    parameters: {
      type: "object",

      properties: {
        name: {
          type: "string",
          description:
            "Patient's name if known.",
        },

        phone: {
          type: "string",
          description:
            "Patient's phone number if known.",
        },
      },

      required: [],
    },
  },
};

// ============================================================
// FIND DOCTOR
// ============================================================

const findDoctorFunction = {
  type: "function",

  function: {
    name: "find_doctor",

    description:
      "Find doctors in the current hospital by doctor name or medical specialization. Use this when the patient names a doctor or asks for a specialist such as cardiologist, dentist, dermatologist, orthopedic doctor, neurologist, etc. Never guess or invent doctor IDs.",

    parameters: {
      type: "object",

      properties: {
        name: {
          type: "string",
          description:
            "Doctor name OR medical specialization provided by the patient. Examples: 'Amit Sharma', 'Dr Sharma', 'cardiologist', 'dentist', 'orthopedic'.",
        },
      },

      required: ["name"],
    },
  },
};

// ============================================================
// CREATE PATIENT
// ============================================================

const createPatientFunction = {
  type: "function",

  function: {
    name: "create_patient",

    description:
      "Register a new patient in the current hospital after required patient information has been collected.",

    parameters: {
      type: "object",

      properties: {
        name: {
          type: "string",
          description:
            "Patient's full name.",
        },

        phone: {
          type: "string",
          description:
            "Patient's phone number.",
        },

        email: {
          type: "string",
          description:
            "Patient's email address if provided.",
        },
      },

      required: [
        "name",
        "phone",
      ],
    },
  },
};

// ============================================================
// BOOK APPOINTMENT
// ============================================================

const bookAppointmentFunction = {
  type: "function",

  function: {
    name: "book_appointment",

    description:
      "Book an appointment only after the doctor, patient, date and exact time are known, availability has been successfully checked, and the patient has explicitly confirmed the exact slot.",

    parameters: {
      type: "object",

      properties: {
        patientId: {
          type: "integer",
          description:
            "Internal patient ID obtained from find_patient or create_patient. Never ask the patient for this ID.",
        },

        doctorId: {
          type: "integer",
          description:
            "Internal doctor ID obtained from find_doctor. Never invent this ID.",
        },

        appointmentDate: {
          type: "string",
          description:
            "Appointment date in YYYY-MM-DD format.",
        },

        startTime: {
          type: "string",
          description:
            "Appointment start time in HH:MM 24-hour format.",
        },

        reason: {
          type: "string",
          description:
            "Optional reason for the appointment.",
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

// ============================================================
// FIND PATIENT APPOINTMENT
// ============================================================

const findPatientAppointmentFunction = {
  type: "function",

  function: {
    name: "find_patient_appointment",

    description:
      "Find an existing booked appointment belonging to the current patient in the current hospital. Use this before cancellation or rescheduling.",

    parameters: {
      type: "object",

      properties: {
        patientId: {
          type: "integer",
          description:
            "Internal patient ID obtained from find_patient. Never ask the patient for this ID.",
        },

        doctorId: {
          type: "integer",
          description:
            "Optional doctor ID if known.",
        },

        appointmentDate: {
          type: "string",
          description:
            "Optional appointment date in YYYY-MM-DD format.",
        },

        startTime: {
          type: "string",
          description:
            "Optional appointment start time in HH:MM format.",
        },
      },

      required: ["patientId"],
    },
  },
};

// ============================================================
// CANCEL APPOINTMENT
// ============================================================

const cancelAppointmentFunction = {
  type: "function",

  function: {
    name: "cancel_appointment",

    description:
      "Cancel an existing appointment only after the appointment has been found and the patient has explicitly confirmed the cancellation.",

    parameters: {
      type: "object",

      properties: {
        appointmentId: {
          type: "integer",
          description:
            "Internal appointment ID obtained from find_patient_appointment. Never invent this ID.",
        },
      },

      required: ["appointmentId"],
    },
  },
};

// ============================================================
// RESCHEDULE APPOINTMENT
// ============================================================

const rescheduleAppointmentFunction = {
  type: "function",

  function: {
    name: "reschedule_appointment",

    description:
      "Reschedule an existing appointment only after the existing appointment has been found, the new slot has been checked for availability, and the patient has explicitly confirmed the new slot.",

    parameters: {
      type: "object",

      properties: {
        appointmentId: {
          type: "integer",
          description:
            "Internal appointment ID obtained from find_patient_appointment.",
        },

        newDate: {
          type: "string",
          description:
            "New appointment date in YYYY-MM-DD format.",
        },

        newTime: {
          type: "string",
          description:
            "New appointment start time in HH:MM 24-hour format.",
        },
      },

      required: [
        "appointmentId",
        "newDate",
        "newTime",
      ],
    },
  },
};

// ============================================================
// ALL TOOLS
// ============================================================

const tools = [
  checkAvailabilityFunction,

  findPatientFunction,

  findDoctorFunction,

  createPatientFunction,

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
  allowBooking = false,
  clinicId
) {
  // ==========================================================
  // BASIC VALIDATION
  // ==========================================================

  if (!clinicId) {
    throw new Error(
      "Hospital context is missing. Please authenticate again."
    );
  }

  if (!message || typeof message !== "string") {
    throw new Error("A valid message is required.");
  }

  // ==========================================================
  // NORMALIZE HISTORY
  // ==========================================================

  if (!Array.isArray(previousMessages)) {
    previousMessages = [];
  }

  /*
   * Do not allow the frontend to inject arbitrary system
   * messages into the conversation.
   *
   * Only keep normal conversation messages.
   */

  previousMessages = previousMessages.filter((msg) => {
    if (!msg || typeof msg !== "object") {
      return false;
    }

    if (!["user", "assistant"].includes(msg.role)) {
      return false;
    }

    if (
      typeof msg.content !== "string" ||
      !msg.content.trim()
    ) {
      return false;
    }

    return true;
  });

  // ==========================================================
  // DATES
  // ==========================================================

  const today = getTodayDate();
  const tomorrow = getTomorrowDate();

  // ==========================================================
  // SYSTEM PROMPT
  // ==========================================================

  const systemMessage = {
    role: "system",

    content: `
You are Riya, the AI receptionist for a hospital.

You help patients with:

- Finding doctors
- Finding doctors by medical specialization
- Registering new patients
- Booking appointments
- Checking appointment availability
- Cancelling appointments
- Rescheduling appointments
- Answering basic appointment-related questions

You are a hospital receptionist.

Never call the hospital a dental clinic or clinic unless the hospital's actual name contains that word.

============================================================
IMPORTANT BACKEND RULE
============================================================

The appointment backend is authoritative.

Never claim that an appointment was:

- booked
- cancelled
- rescheduled

unless the corresponding backend tool successfully confirms it.

Never invent database information.

Never invent:

- patients
- doctors
- appointment IDs
- patient IDs
- doctor IDs
- appointment times
- availability

Internal database IDs are for internal tool use only.

Never ask the patient for:

- patient ID
- doctor ID
- appointment ID

============================================================
CURRENT DATE
============================================================

Today's date is ${today}.

Tomorrow's date is ${tomorrow}.

Resolve natural date expressions such as:

- today
- tomorrow
- day after tomorrow
- next Monday
- this Saturday
- next Saturday

into the correct YYYY-MM-DD date internally.

Never ask the patient to convert dates into YYYY-MM-DD.

Never use an old example date as the current date.

============================================================
BOOKING WINDOW
============================================================

Appointments can currently be booked up to 7 days ahead.

Never allow appointments in the past.

If a patient requests a date beyond the 7-day booking window:

- explain that appointments can currently be booked only up to 7 days ahead
- do not call booking tools

============================================================
HOSPITAL APPOINTMENT SCHEDULE
============================================================

The hospital is open for appointments:

Monday through Saturday.

Sunday is closed.

Morning session:

10:00 AM - 1:30 PM

Evening session:

4:00 PM - 9:00 PM

Appointments are 30 minutes long.

Valid morning appointment START times are:

10:00
10:30
11:00
11:30
12:00
12:30
1:00 PM

The 1:00 PM appointment ends at 1:30 PM.

1:30 PM is NOT a valid appointment start time.

Valid evening appointment START times are:

4:00 PM
4:30 PM
5:00 PM
5:30 PM
6:00 PM
6:30 PM
7:00 PM
7:30 PM
8:00 PM
8:30 PM

The 8:30 PM appointment ends at 9:00 PM.

Do not treat the following as available:

- Sunday
- 1:30 PM
- any time between 1:30 PM and 4:00 PM
- any time after 8:30 PM

The backend remains authoritative if the requested slot is invalid or unavailable.

============================================================
DOCTOR SEARCH
============================================================

Patients may identify a doctor in different ways.

Examples:

"Dr Amit Sharma"

"Dr Sharma"

"I want to see a cardiologist"

"I need a dentist"

"I want an orthopedic doctor"

"I need a dermatologist"

When the patient provides a doctor name OR specialization:

Call find_doctor.

Use the patient's wording as the search value.

Never guess a doctor ID.

Never create a doctor yourself.

Never assume that a doctor exists.

If find_doctor returns no doctors:

Tell the patient that no matching doctor was found.

Do not invent another doctor.

If find_doctor returns exactly one doctor:

Use that doctor's internal ID internally.

Do not expose the ID to the patient.

If find_doctor returns multiple doctors:

Show the patient the relevant doctor names and specializations.

Ask which doctor they want.

Do not choose one automatically.

Example:

" I found two doctors matching that request:
- Dr. Amit Sharma — Dentist
- Dr. XYZ — Dentist

Which doctor would you like?"

============================================================
PATIENT SEARCH
============================================================

Before booking an appointment, the patient must be associated with a patient record.

If the patient gives their name:

Use find_patient.

If the patient gives both name and phone:

Use both when useful.

If an existing patient is found:

Use the returned patient ID internally.

Never ask the patient for the patient ID.

If no patient is found:

Ask for the information needed to register the patient.

At minimum collect:

- full name
- phone number

Email is optional.

After receiving the required information:

Call create_patient.

After successful creation:

Use the returned patient ID internally.

Never expose the internal patient ID.

============================================================
PATIENT ID SAFETY
============================================================

Never invent patient IDs.

Never assume that:

patient 1 = current patient

patient 2 = current patient

etc.

Only use IDs returned by:

find_patient

or

create_patient

============================================================
BOOKING FLOW
============================================================

A normal booking follows this order:

1. Identify the patient.
2. Identify the doctor.
3. Resolve the appointment date.
4. Obtain the exact appointment time.
5. Check availability.
6. Tell the patient whether the exact slot is available.
7. Ask for explicit confirmation.
8. Only after confirmation call book_appointment.
9. Confirm booking only if the backend returns success.

Do not skip these steps.

============================================================
WHEN DOCTOR IS MISSING
============================================================

If the patient says:

"I want an appointment tomorrow"

but does not specify a doctor or specialization:

Ask which doctor or specialization they want.

Do not check random doctors.

Do not choose a doctor.

============================================================
WHEN TIME IS MISSING
============================================================

If the patient says:

"I want to see Dr Sharma tomorrow"

but gives no time:

Ask for the preferred appointment time.

Do not randomly select a time.

============================================================
WHEN DATE IS MISSING
============================================================

If the patient says:

"I want an appointment at 5 PM"

but gives no date:

Ask which date they want.

Do not assume today unless the patient clearly means today.

============================================================
CHECK AVAILABILITY
============================================================

Only call check_availability when you know:

- doctor
- date
- exact start time

The doctor ID must come from find_doctor.

The date must be resolved internally.

The time must be converted into HH:MM 24-hour format.

Examples:

10 AM -> 10:00

12:30 PM -> 12:30

4 PM -> 16:00

5:30 PM -> 17:30

8:30 PM -> 20:30

Never call check_availability with a guessed doctor ID.

============================================================
WHEN SLOT IS AVAILABLE
============================================================

If check_availability says the exact slot is available:

Tell the patient the slot is available.

Then ask for explicit confirmation.

Example:

"Yes, Dr. Amit Sharma is available tomorrow at 5:00 PM. Would you like me to book it?"

Do NOT immediately call book_appointment.

Wait for the patient's confirmation.

============================================================
EXPLICIT CONFIRMATION
============================================================

Examples of confirmation:

"yes"

"yes book it"

"book it"

"confirm"

"please book"

"that's fine"

"go ahead"

However, confirmation must refer to a clearly identified slot.

If multiple alternatives are being discussed and the patient only says:

"yes"

do NOT assume which alternative they selected.

Ask them to select a specific time.

============================================================
BOOKING
============================================================

Only call book_appointment when ALL of these are true:

1. Patient is identified.
2. Doctor is identified.
3. Date is resolved.
4. Exact time is known.
5. check_availability confirmed that exact slot is available.
6. Patient explicitly confirmed that exact slot.
7. allowBooking is enabled.

The booking tool will also re-check availability.

If booking fails:

Do NOT say the appointment was booked.

Explain that the booking could not be completed.

If the backend provides alternatives, use only those alternatives.

Never invent alternatives.

============================================================
WHEN SLOT IS UNAVAILABLE
============================================================

If check_availability says the requested slot is unavailable:

Do NOT call book_appointment.

Tell the patient that the requested slot is unavailable.

Offer only the alternatives returned by the backend.

Never invent alternative times.

Never automatically select an alternative.

If multiple alternatives are returned and the patient says:

"yes"

ask which alternative they want.

If the patient selects a specific alternative:

1. Check availability again.
2. If available, ask for explicit confirmation.
3. Only then book.

============================================================
REASON FOR APPOINTMENT
============================================================

Reason is optional.

Do not force the patient to provide a reason.

If the patient provides one naturally, pass it to the booking tool.

============================================================
CANCELLATION
============================================================

For cancellation:

1. Identify the patient.
2. Use find_patient_appointment.
3. Find the actual booked appointment.
4. Tell the patient which appointment was found.
5. Ask for explicit confirmation.
6. Only after confirmation call cancel_appointment.
7. Confirm cancellation only after successful backend response.

Never cancel without confirmation.

Never invent an appointment.

Never cancel an appointment that the backend says does not exist.

If multiple appointments are found:

Show the relevant appointment details.

Ask which appointment they want to cancel.

Do not choose automatically.

============================================================
RESCHEDULING
============================================================

For rescheduling:

1. Identify the patient.
2. Find the patient's appointment.
3. Identify the existing appointment.
4. Determine the new date.
5. Determine the new time.
6. Check availability for the new slot.
7. Tell the patient whether the new slot is available.
8. Ask for explicit confirmation.
9. Only then call reschedule_appointment.
10. Confirm success only after backend confirmation.

Never reschedule directly without checking availability.

Never reschedule into an unavailable slot.

Never invent alternative times.

Never choose an alternative automatically.

============================================================
CANCELLATION / RESCHEDULING PATIENT SAFETY
============================================================

If the patient says:

"Cancel my appointment"

but multiple appointments exist:

Ask which appointment they mean.

If the patient says:

"Reschedule my appointment"

but multiple appointments exist:

Ask which appointment they mean.

Never guess.

============================================================
TOOL FAILURE
============================================================

If a tool returns:

success: false

do not pretend the operation succeeded.

If the error is technical:

Say that there is a temporary problem completing the request.

Do not expose:

- stack traces
- Prisma errors
- database errors
- internal IDs
- tool names
- backend implementation details

============================================================
HOSPITAL TERMINOLOGY
============================================================

Use:

- hospital
- doctor
- specialist
- department
- appointment
- patient

Do not call the hospital:

- dental clinic
- clinic

unless that wording is literally part of the hospital's official name.

If a patient asks for a dentist, cardiologist, dermatologist, orthopedic doctor, neurologist, etc., treat that as a medical specialization search.

============================================================
GENERAL BEHAVIOR
============================================================

Be polite.

Be concise.

Be natural.

Do not overwhelm the patient.

Ask only for information that is actually missing.

Do not repeat questions when the information is already available in the conversation.

Never expose internal implementation details.

Never expose internal database IDs.

Never invent data.

The backend is authoritative.

============================================================
BOOKING PERMISSION
============================================================

The application may disable appointment modifications.

If booking/modification is disabled:

Do not call:

- book_appointment
- cancel_appointment
- reschedule_appointment

You may still:

- find patients
- find doctors
- check availability
- find appointments

If modification is disabled, explain that appointment changes are currently unavailable.
============================================================
DATE CHANGE SAFETY
============================================================

Never silently change the patient's requested date.

If the requested date is closed, unavailable, invalid, or otherwise cannot be booked:

1. Tell the patient the requested date cannot be used.
2. Give the exact reason.
3. Suggest the next valid option only if the backend provides one or the next calendar day is clearly determined.
4. Ask the patient whether they want that new date.
5. Do not check availability for the replacement date until the patient accepts the replacement date.
6. Do not book a replacement date without explicit confirmation.

Example:

Patient:
"Book tomorrow at 12 PM."

If tomorrow is Sunday:

"Tomorrow, Sunday October 4, is a holiday/closed day for the hospital. Would you like Monday, October 5 at 12 PM instead?"

Do NOT automatically change the date to Monday.
============================================================
DATE ACCURACY
============================================================

When calculating dates:

- Use the actual calendar date.
- Never guess a weekday.
- Never invent a date.
- Never change one date into another date without the patient's agreement.

For example, if:
Tomorrow = 2026-10-04

then:
Tomorrow = Sunday, October 4, 2026

The following Monday = October 5, 2026.

Do not call October 6 Monday.
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
        response:
          assistantMessage.content ||
          "I'm sorry, I couldn't generate a response.",

        messages,
      };
    }

    // ========================================================
    // SAVE ASSISTANT TOOL REQUEST
    // ========================================================

    messages.push(assistantMessage);

    // ========================================================
    // EXECUTE EACH TOOL
    // ========================================================

    for (const toolCall of assistantMessage.tool_calls) {
      const toolName = toolCall.function.name;

      let args;

      // ------------------------------------------------------
      // PARSE TOOL ARGUMENTS
      // ------------------------------------------------------

      try {
        args = JSON.parse(
          toolCall.function.arguments || "{}"
        );
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
            error: "Invalid tool arguments.",
          }),
        });

        continue;
      }

      console.log(
        "\nAI WANTS TO CALL:",
        toolName
      );

      console.log(
        "Arguments:",
        args
      );

      let result;

      // ======================================================
      // TOOL EXECUTION
      // ======================================================

      try {
        // ====================================================
        // CHECK AVAILABILITY
        // ====================================================

        if (toolName === "check_availability") {
          result = await checkAvailabilityTool({
            ...args,

            /*
             * IMPORTANT:
             *
             * clinicId comes from authenticated backend
             * context, NOT from the AI.
             */
            clinicId,
          });
        }

        // ====================================================
        // FIND PATIENT
        // ====================================================

        else if (toolName === "find_patient") {
          result = await findPatientTool({
            ...args,

            clinicId,
          });
        }

        // ====================================================
        // FIND DOCTOR
        // ====================================================

        else if (toolName === "find_doctor") {
          result = await findDoctorTool({
            ...args,

            clinicId,
          });
        }

        // ====================================================
        // CREATE PATIENT
        // ====================================================

        else if (toolName === "create_patient") {
          result = await createPatientTool({
            ...args,

            clinicId,
          });
        }

        // ====================================================
        // FIND PATIENT APPOINTMENT
        // ====================================================

        else if (
          toolName === "find_patient_appointment"
        ) {
          result =
            await findPatientAppointmentTool({
              ...args,

              clinicId,
            });
        }

        // ====================================================
        // BOOK APPOINTMENT
        // ====================================================

        else if (
          toolName === "book_appointment"
        ) {
          if (!allowBooking) {
            result = {
              success: false,

              error:
                "Appointment booking is currently disabled.",
            };
          } else {
            /*
             * IMPORTANT:
             *
             * clinicId MUST be inside the object.
             *
             * DO NOT do:
             *
             * bookAppointmentTool(args, clinicId)
             *
             * because the tool expects:
             *
             * bookAppointmentTool({
             *   ...args,
             *   clinicId
             * })
             */

            result =
              await bookAppointmentTool({
                ...args,

                clinicId,
              });
          }
        }

        // ====================================================
        // CANCEL APPOINTMENT
        // ====================================================

        else if (
          toolName === "cancel_appointment"
        ) {
          if (!allowBooking) {
            result = {
              success: false,

              error:
                "Appointment cancellation is currently disabled.",
            };
          } else {
            result =
              await cancelAppointmentTool({
                ...args,

                clinicId,
              });
          }
        }

        // ====================================================
        // RESCHEDULE APPOINTMENT
        // ====================================================

        else if (
          toolName === "reschedule_appointment"
        ) {
          if (!allowBooking) {
            result = {
              success: false,

              error:
                "Appointment rescheduling is currently disabled.",
            };
          } else {
            result =
              await rescheduleAppointmentTool({
                ...args,

                clinicId,
              });
          }
        }

        // ====================================================
        // UNKNOWN TOOL
        // ====================================================

        else {
          result = {
            success: false,

            error:
              `Unknown tool: ${toolName}`,
          };
        }
      } catch (error) {
        // ====================================================
        // TOOL ERROR
        // ====================================================

        console.error(
          `Tool ${toolName} failed:`,
          error
        );

        result = {
          success: false,

          error:
            error.message ||
            "An internal error occurred.",
        };

        // Preserve backend alternatives
        if (error.alternatives) {
          result.alternatives =
            error.alternatives;
        }
      }

      console.log(
        "TOOL RESULT:",
        result
      );

      // ======================================================
      // SEND TOOL RESULT BACK TO AI
      // ======================================================

      messages.push({
        role: "tool",

        tool_call_id: toolCall.id,

        content: JSON.stringify(result),
      });
    }
  }
}

// ============================================================
// EXPORT
// ============================================================

module.exports = {
  askAI,
};