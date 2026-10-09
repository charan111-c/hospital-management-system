const express = require("express");

const {
    createPatient,
    getPatients,
    getPatientById,
    updatePatient,
    deletePatient
} = require("../controllers/patientController");

const {
    authenticateToken,
    authorizeRoles
} = require("../middleware/authMiddleware");

const router = express.Router();


// ==========================================
// CREATE PATIENT
// ADMIN / RECEPTIONIST
// ==========================================

router.post(
    "/",
    authenticateToken,
    authorizeRoles("ADMIN", "RECEPTIONIST"),
    createPatient
);


// ==========================================
// GET ALL PATIENTS
// ==========================================

router.get(
    "/",
    authenticateToken,
    authorizeRoles(
        "ADMIN",
        "DOCTOR",
        "RECEPTIONIST"
    ),
    getPatients
);


// ==========================================
// GET PATIENT BY ID
// ==========================================

router.get(
    "/:id",
    authenticateToken,
    authorizeRoles(
        "ADMIN",
        "DOCTOR",
        "RECEPTIONIST"
    ),
    getPatientById
);


// ==========================================
// UPDATE PATIENT
// ==========================================

router.put(
    "/:id",
    authenticateToken,
    authorizeRoles(
        "ADMIN",
        "RECEPTIONIST"
    ),
    updatePatient
);


// ==========================================
// DELETE PATIENT
// ==========================================

router.delete(
    "/:id",
    authenticateToken,
    authorizeRoles("ADMIN"),
    deletePatient
);


module.exports = router;