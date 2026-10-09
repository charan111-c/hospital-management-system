const express = require("express");

const router = express.Router();

const {
    createAppointment,
    getAllAppointments,
    getMyAppointments,
    getAppointmentById,
    updateAppointment,
    updateAppointmentStatus,
    deleteAppointment,
} = require("../controllers/appointmentController");

const {
    authenticateToken,
    authorizeRoles,
} = require("../middleware/authMiddleware");


// =========================================================
// CREATE
// ADMIN / RECEPTIONIST
// =========================================================

router.post(
    "/",
    authenticateToken,
    authorizeRoles(
        "ADMIN",
        "RECEPTIONIST"
    ),
    createAppointment
);


// =========================================================
// GET ALL
// ADMIN / RECEPTIONIST / DOCTOR
// =========================================================

router.get(
    "/",
    authenticateToken,
    authorizeRoles(
        "ADMIN",
        "RECEPTIONIST",
        "DOCTOR"
    ),
    getAllAppointments
);


// =========================================================
// GET MY APPOINTMENTS
// PATIENT ONLY
// =========================================================

router.get(
    "/my",
    authenticateToken,
    authorizeRoles("PATIENT"),
    getMyAppointments
);


// =========================================================
// GET ONE
// ADMIN / RECEPTIONIST / DOCTOR
// =========================================================

router.get(
    "/:id",
    authenticateToken,
    authorizeRoles(
        "ADMIN",
        "RECEPTIONIST",
        "DOCTOR"
    ),
    getAppointmentById
);


// =========================================================
// FULL UPDATE
// ADMIN / RECEPTIONIST
// =========================================================

router.put(
    "/:id",
    authenticateToken,
    authorizeRoles(
        "ADMIN",
        "RECEPTIONIST"
    ),
    updateAppointment
);


// =========================================================
// UPDATE STATUS
// ADMIN / RECEPTIONIST / DOCTOR
// =========================================================

router.put(
    "/:id/status",
    authenticateToken,
    authorizeRoles(
        "ADMIN",
        "RECEPTIONIST",
        "DOCTOR"
    ),
    updateAppointmentStatus
);


// =========================================================
// DELETE
// ADMIN / RECEPTIONIST
// =========================================================

router.delete(
    "/:id",
    authenticateToken,
    authorizeRoles(
        "ADMIN",
        "RECEPTIONIST"
    ),
    deleteAppointment
);


module.exports = router;