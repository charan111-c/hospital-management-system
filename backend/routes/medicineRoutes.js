const express = require("express");

const {
    createMedicine,
    getMedicines,
    getMedicineById,
    updateMedicine,
    deleteMedicine
} = require("../controllers/medicineController");

const {
    authenticateToken,
    authorizeRoles
} = require("../middleware/authMiddleware");

const router = express.Router();


// ==========================================
// CREATE MEDICINE
// ==========================================

router.post(
    "/",
    authenticateToken,
    authorizeRoles("ADMIN"),
    createMedicine
);


// ==========================================
// GET ALL MEDICINES
// ==========================================

router.get(
    "/",
    authenticateToken,
    authorizeRoles(
        "ADMIN",
        "DOCTOR",
        "RECEPTIONIST"
    ),
    getMedicines
);


// ==========================================
// GET MEDICINE BY ID
// ==========================================

router.get(
    "/:id",
    authenticateToken,
    authorizeRoles(
        "ADMIN",
        "DOCTOR",
        "RECEPTIONIST"
    ),
    getMedicineById
);


// ==========================================
// UPDATE MEDICINE
// ==========================================

router.put(
    "/:id",
    authenticateToken,
    authorizeRoles("ADMIN"),
    updateMedicine
);


// ==========================================
// DELETE MEDICINE
// ==========================================

router.delete(
    "/:id",
    authenticateToken,
    authorizeRoles("ADMIN"),
    deleteMedicine
);


module.exports = router;