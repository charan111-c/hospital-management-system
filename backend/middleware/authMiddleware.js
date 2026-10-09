const jwt = require("jsonwebtoken");

// ==========================================
// AUTHENTICATION
// ==========================================

const authenticateToken = (req, res, next) => {

    console.log("");
    console.log("========== AUTHENTICATION ==========");

    const authHeader = req.headers.authorization;

    console.log("Authorization header exists:",
        !!authHeader
    );

    if (!authHeader) {
        return res.status(401).json({
            success: false,
            message: "Authorization header missing"
        });
    }

    const parts = authHeader.split(" ");

    console.log("Authorization format:",
        parts[0]
    );

    if (parts.length !== 2 || parts[0] !== "Bearer") {
        return res.status(401).json({
            success: false,
            message: "Invalid authorization format"
        });
    }

    const token = parts[1];

    try {

        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET
        );

        console.log("JWT decoded successfully");
        console.log("User ID:", decoded.id);
        console.log("User email:", decoded.email);
        console.log("User role:", JSON.stringify(decoded.role));

        req.user = decoded;

        next();

    } catch (error) {

        console.log("JWT ERROR:", error.message);

        return res.status(403).json({
            success: false,
            message: "Invalid or expired token"
        });
    }
};


// ==========================================
// ROLE AUTHORIZATION
// ==========================================

const authorizeRoles = (...allowedRoles) => {

    return (req, res, next) => {

        console.log("");
        console.log("========== AUTHORIZATION ==========");

        console.log(
            "User role:",
            JSON.stringify(req.user?.role)
        );

        console.log(
            "Allowed roles:",
            allowedRoles
        );

        if (!req.user) {

            console.log("RESULT: NO USER");

            return res.status(401).json({
                success: false,
                message: "User not authenticated"
            });
        }

        // Normalize role
        const userRole = String(
            req.user.role || ""
        )
            .trim()
            .toUpperCase();

        const normalizedAllowedRoles =
            allowedRoles.map(role =>
                String(role)
                    .trim()
                    .toUpperCase()
            );

        console.log(
            "Normalized user role:",
            JSON.stringify(userRole)
        );

        console.log(
            "Normalized allowed roles:",
            normalizedAllowedRoles
        );

        if (
            !normalizedAllowedRoles.includes(
                userRole
            )
        ) {

            console.log(
                "RESULT: ❌ ACCESS DENIED"
            );

            return res.status(403).json({
                success: false,
                message: "Access denied",
                userRole: userRole,
                allowedRoles:
                    normalizedAllowedRoles
            });
        }

        console.log(
            "RESULT: ✅ ACCESS GRANTED"
        );

        next();
    };
};


// ==========================================
// EXPORT
// ==========================================

module.exports = {
    authenticateToken,
    authorizeRoles
};