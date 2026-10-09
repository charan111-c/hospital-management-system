const express = require("express");

const {
    createDoctor,
    getDoctors,
    getDoctorById,
    updateDoctor,
    deleteDoctor
} = require("../controllers/doctorController");

const {
    authenticateToken,
    authorizeRoles
} = require("../middleware/authMiddleware");

const router = express.Router();


// ==========================================
// CREATE DOCTOR
// ADMIN ONLY
// ==========================================

router.post(
    "/",
    authenticateToken,
    authorizeRoles("ADMIN"),
    createDoctor
);


// ==========================================
// GET ALL DOCTORS
// ADMIN / DOCTOR / RECEPTIONIST / PATIENT
// ==========================================

router.get(
    "/",
    authenticateToken,
    authorizeRoles(
        "ADMIN",
        "DOCTOR",
        "RECEPTIONIST",
        "PATIENT"
    ),
    getDoctors
);


// ==========================================
// GET DOCTOR BY ID
// ==========================================

router.get(
    "/:id",
    authenticateToken,
    authorizeRoles(
        "ADMIN",
        "DOCTOR",
        "RECEPTIONIST",
        "PATIENT"
    ),
    getDoctorById
);


// ==========================================
// UPDATE DOCTOR
// ADMIN ONLY
// ==========================================

router.put(
    "/:id",
    authenticateToken,
    authorizeRoles("ADMIN"),
    updateDoctor
);


// ==========================================
// DELETE DOCTOR
// ADMIN ONLY
// ==========================================

router.delete(
    "/:id",
    authenticateToken,
    authorizeRoles("ADMIN"),
    deleteDoctor
);


module.exports = router;