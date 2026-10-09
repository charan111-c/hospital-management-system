const express = require("express");

const {
    register,
    login
} = require("../controllers/authController");

const {
    authenticateToken,
    authorizeRoles
} = require("../middleware/authMiddleware");

const router = express.Router();

// ==========================================
// PUBLIC ROUTES
// ==========================================

// Register
router.post("/register", register);

// Login
router.post("/login", login);

// ==========================================
// PROTECTED ROUTES
// ==========================================

// Any authenticated user
router.get(
    "/profile",
    authenticateToken,
    (req, res) => {

        res.status(200).json({
            success: true,
            message: "You are authenticated",
            user: req.user
        });

    }
);

// ==========================================
// ADMIN ONLY
// ==========================================

router.get(
    "/admin",
    authenticateToken,
    authorizeRoles("ADMIN"),
    (req, res) => {

        res.status(200).json({
            success: true,
            message: "Welcome Admin",
            user: req.user
        });

    }
);

module.exports = router;