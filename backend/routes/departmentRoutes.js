const express = require("express");

const {
    createDepartment,
    getDepartments,
    getDepartmentById,
    updateDepartment,
    deleteDepartment
} = require("../controllers/departmentController");

const {
    authenticateToken,
    authorizeRoles
} = require("../middleware/authMiddleware");

const router = express.Router();


// ==========================================
// ADMIN ONLY
// ==========================================

// Create
router.post(
    "/",
    authenticateToken,
    authorizeRoles("ADMIN"),
    createDepartment
);


// View all
router.get(
    "/",
    authenticateToken,
    authorizeRoles("ADMIN", "DOCTOR", "RECEPTIONIST"),
    getDepartments
);


// View one
router.get(
    "/:id",
    authenticateToken,
    authorizeRoles("ADMIN", "DOCTOR", "RECEPTIONIST"),
    getDepartmentById
);


// Update
router.put(
    "/:id",
    authenticateToken,
    authorizeRoles("ADMIN"),
    updateDepartment
);


// Delete
router.delete(
    "/:id",
    authenticateToken,
    authorizeRoles("ADMIN"),
    deleteDepartment
);


module.exports = router;