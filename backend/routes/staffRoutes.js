const express = require("express");

const {
    createStaff,
    getStaff,
    getStaffById,
    getStaffByDepartment,
    updateStaff,
    deleteStaff
} = require("../controllers/staffController");

const {
    authenticateToken,
    authorizeRoles
} = require("../middleware/authMiddleware");

const router = express.Router();


// ==========================================
// CREATE STAFF
// ==========================================

router.post(
    "/",
    authenticateToken,
    authorizeRoles("ADMIN"),
    createStaff
);


// ==========================================
// GET ALL STAFF
// ==========================================

router.get(
    "/",
    authenticateToken,
    authorizeRoles(
        "ADMIN",
        "RECEPTIONIST"
    ),
    getStaff
);


// ==========================================
// GET STAFF BY DEPARTMENT
// ==========================================

router.get(
    "/department/:departmentId",
    authenticateToken,
    authorizeRoles(
        "ADMIN",
        "RECEPTIONIST"
    ),
    getStaffByDepartment
);


// ==========================================
// GET STAFF BY ID
// ==========================================

router.get(
    "/:id",
    authenticateToken,
    authorizeRoles(
        "ADMIN",
        "RECEPTIONIST"
    ),
    getStaffById
);


// ==========================================
// UPDATE STAFF
// ==========================================

router.put(
    "/:id",
    authenticateToken,
    authorizeRoles("ADMIN"),
    updateStaff
);


// ==========================================
// DELETE STAFF
// ==========================================

router.delete(
    "/:id",
    authenticateToken,
    authorizeRoles("ADMIN"),
    deleteStaff
);


module.exports = router;