const express = require("express");

const {
    createBill,
    getBills,
    getBillById,
    getPatientBills,
    updateBill,
    updatePaymentStatus,
    deleteBill
} = require("../controllers/billingController");

const {
    authenticateToken,
    authorizeRoles
} = require("../middleware/authMiddleware");

const router = express.Router();


// ==========================================
// CREATE BILL
// ==========================================

router.post(
    "/",
    authenticateToken,
    authorizeRoles("ADMIN", "RECEPTIONIST"),
    createBill
);


// ==========================================
// GET ALL BILLS
// ==========================================

router.get(
    "/",
    authenticateToken,
    authorizeRoles(
        "ADMIN",
        "RECEPTIONIST"
    ),
    getBills
);


// ==========================================
// GET PATIENT BILLS
// ==========================================

router.get(
    "/patient/:patientId",
    authenticateToken,
    authorizeRoles(
        "ADMIN",
        "RECEPTIONIST",
        "PATIENT"
    ),
    getPatientBills
);


// ==========================================
// UPDATE PAYMENT STATUS
// ==========================================

router.put(
    "/:id/payment",
    authenticateToken,
    authorizeRoles(
        "ADMIN",
        "RECEPTIONIST"
    ),
    updatePaymentStatus
);


// ==========================================
// GET BILL BY ID
// ==========================================

router.get(
    "/:id",
    authenticateToken,
    authorizeRoles(
        "ADMIN",
        "RECEPTIONIST",
        "PATIENT"
    ),
    getBillById
);


// ==========================================
// UPDATE BILL
// ==========================================

router.put(
    "/:id",
    authenticateToken,
    authorizeRoles("ADMIN"),
    updateBill
);


// ==========================================
// DELETE BILL
// ==========================================

router.delete(
    "/:id",
    authenticateToken,
    authorizeRoles("ADMIN"),
    deleteBill
);


module.exports = router;