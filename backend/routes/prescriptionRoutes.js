const express = require("express");

const {
    createPrescription,
    getPrescriptions,
    getPrescriptionById,
    getPatientPrescriptions,
    updatePrescription,
    deletePrescription
} = require("../controllers/prescriptionController");

const {
    authenticateToken,
    authorizeRoles
} = require("../middleware/authMiddleware");

const router = express.Router();


// ==========================================
// CREATE PRESCRIPTION
// ==========================================

router.post(
    "/",
    authenticateToken,
    authorizeRoles("ADMIN", "DOCTOR"),
    createPrescription
);


// ==========================================
// GET ALL PRESCRIPTIONS
// ==========================================

router.get(
    "/",
    authenticateToken,
    authorizeRoles(
        "ADMIN",
        "DOCTOR",
        "RECEPTIONIST"
    ),
    getPrescriptions
);


// ==========================================
// GET PATIENT PRESCRIPTIONS
// ==========================================

router.get(
    "/patient/:patientId",
    authenticateToken,
    authorizeRoles(
        "ADMIN",
        "DOCTOR",
        "RECEPTIONIST",
        "PATIENT"
    ),
    getPatientPrescriptions
);


// ==========================================
// GET PRESCRIPTION BY ID
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
    getPrescriptionById
);


// ==========================================
// UPDATE PRESCRIPTION
// ==========================================

router.put(
    "/:id",
    authenticateToken,
    authorizeRoles("ADMIN", "DOCTOR"),
    updatePrescription
);


// ==========================================
// DELETE PRESCRIPTION
// ==========================================

router.delete(
    "/:id",
    authenticateToken,
    authorizeRoles("ADMIN"),
    deletePrescription
);


module.exports = router;