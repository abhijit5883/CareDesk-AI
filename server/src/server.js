const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");

const patientRoutes = require("./modules/patients/patientRoutes");
const appointmentRoutes = require("./modules/appointments/appointmentRoutes");
const doctorRoutes = require("./modules/doctors/doctorRoutes");
const dashboardRoutes = require("./modules/dashboard/dashboardRoutes");
const aiRoutes = require("./modules/ai/aiRoutes");
const authRoutes = require("./modules/authentication/authRoutes");

const app = express();

// ===============================
// CORS CONFIGURATION
// ===============================

const allowedOrigins = [
  "http://localhost:5173",
];

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests without an origin
      // such as curl/Postman
      if (!origin) {
        return callback(null, true);
      }

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
  })
);

// ===============================
// MIDDLEWARE
// ===============================

app.use(express.json());
app.use(cookieParser());

// ===============================
// ROUTES
// ===============================

app.use("/api/auth", authRoutes);
app.use("/api/patients", patientRoutes);
app.use("/api/appointments", appointmentRoutes);
app.use("/api/doctors", doctorRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/ai", aiRoutes);

// ===============================
// SERVER
// ===============================

const PORT = 5001;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});