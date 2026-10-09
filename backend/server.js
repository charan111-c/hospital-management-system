const express = require("express");
const cors = require("cors");
require("dotenv").config();

// ==========================================
// DATABASE
// ==========================================

require("./config/db");

// ==========================================
// ROUTES
// ==========================================

const authRoutes = require("./routes/authRoutes");
const departmentRoutes = require("./routes/departmentRoutes");
const doctorRoutes = require("./routes/doctorRoutes");
const patientRoutes = require("./routes/patientRoutes");
const appointmentRoutes = require("./routes/appointmentRoutes");
const medicalRecordRoutes = require("./routes/medicalRecordRoutes");
const medicineRoutes = require("./routes/medicineRoutes");
const prescriptionRoutes = require("./routes/prescriptionRoutes");
const billingRoutes = require("./routes/billingRoutes");
const staffRoutes = require("./routes/staffRoutes");

// ==========================================
// CREATE EXPRESS APPLICATION
// ==========================================

const app = express();

// ==========================================
// MIDDLEWARE
// ==========================================

app.use(cors());

app.use(express.json());

app.use(
    express.urlencoded({
        extended: true
    })
);

// ==========================================
// ROOT ROUTE
// ==========================================

app.get("/", (req, res) => {
    res.status(200).json({
        success: true,
        message: "Hospital Management System API is running"
    });
});

// ==========================================
// DATABASE TEST
// ==========================================

app.get("/api/test-db", (req, res) => {

    const db = require("./config/db");

    db.query(
        "SELECT 1 AS result",
        (err, results) => {

            if (err) {

                console.error(
                    "Database test error:",
                    err.message
                );

                return res.status(500).json({
                    success: false,
                    message: "Database connection failed"
                });
            }

            res.status(200).json({
                success: true,
                message: "Database connection successful",
                result: results[0].result
            });
        }
    );
});

// ==========================================
// AUTH ROUTES
// ==========================================

app.use(
    "/api/auth",
    authRoutes
);

// ==========================================
// DEPARTMENT ROUTES
// ==========================================

app.use(
    "/api/departments",
    departmentRoutes
);

// ==========================================
// DOCTOR ROUTES
// ==========================================

app.use(
    "/api/doctors",
    doctorRoutes
);

// ==========================================
// PATIENT ROUTES
// ==========================================

app.use(
    "/api/patients",
    patientRoutes
);

// ==========================================
// APPOINTMENT ROUTES
// ==========================================

app.use(
    "/api/appointments",
    appointmentRoutes
);

// ==========================================
// MEDICAL RECORD ROUTES
// ==========================================

app.use(
    "/api/medical-records",
    medicalRecordRoutes
);

app.use(
    "/api/medicines",
    medicineRoutes
);

app.use(
    "/api/prescriptions",
    prescriptionRoutes
);

app.use(
    "/api/billing",
    billingRoutes
);

app.use(
    "/api/staff",
    staffRoutes
);

// ==========================================
// 404 HANDLER
// ==========================================

app.use((req, res) => {

    res.status(404).json({
        success: false,
        message: "Route not found"
    });

});

// ==========================================
// ERROR HANDLER
// ==========================================

app.use((err, req, res, next) => {

    console.error(
        "Server error:",
        err
    );

    res.status(500).json({
        success: false,
        message: "Internal server error"
    });

});

// ==========================================
// START SERVER
// ==========================================

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {

    console.log("");
    console.log("======================================");
    console.log("🏥 HOSPITAL MANAGEMENT SYSTEM");
    console.log("======================================");
    console.log(`🚀 Server: http://localhost:${PORT}`);
    console.log("======================================");
    console.log("");

});