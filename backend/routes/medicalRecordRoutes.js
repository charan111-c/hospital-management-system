const express = require("express");

const {
    createMedicalRecord,
    getMedicalRecords,
    getMedicalRecordById,
    getPatientMedicalRecords,
    updateMedicalRecord,
    deleteMedicalRecord
} = require("../controllers/medicalRecordController");

const {
    authenticateToken,
    authorizeRoles
} = require("../middleware/authMiddleware");

const router = express.Router();


// CREATE MEDICAL RECORD
router.post(
    "/",
    authenticateToken,
    authorizeRoles("ADMIN", "DOCTOR"),
    createMedicalRecord
);


// GET ALL MEDICAL RECORDS
router.get(
    "/",
    authenticateToken,
    authorizeRoles("ADMIN", "DOCTOR", "RECEPTIONIST"),
    getMedicalRecords
);


// GET PATIENT MEDICAL RECORDS
router.get(
    "/patient/:patientId",
    authenticateToken,
    authorizeRoles(
        "ADMIN",
        "DOCTOR",
        "RECEPTIONIST",
        "PATIENT"
    ),
    getPatientMedicalRecords
);


// GET ONE MEDICAL RECORD
router.get(
    "/:id",
    authenticateToken,
    authorizeRoles(
        "ADMIN",
        "DOCTOR",
        "RECEPTIONIST",
        "PATIENT"
    ),
    getMedicalRecordById
);


// UPDATE MEDICAL RECORD
router.put(
    "/:id",
    authenticateToken,
    authorizeRoles("ADMIN", "DOCTOR"),
    updateMedicalRecord
);


// DELETE MEDICAL RECORD
router.delete(
    "/:id",
    authenticateToken,
    authorizeRoles("ADMIN"),
    deleteMedicalRecord
);


module.exports = router;