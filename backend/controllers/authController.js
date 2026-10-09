const db = require("../config/db");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// ==========================================
// REGISTER
// ==========================================

const register = async (req, res) => {
    try {
        const {
            name,
            email,
            password,
            role,
            phone
        } = req.body;

        // ==========================================
        // VALIDATE REQUIRED FIELDS
        // ==========================================

        if (!name || !email || !password || !role) {
            return res.status(400).json({
                success: false,
                message:
                    "Name, email, password and role are required"
            });
        }

        // ==========================================
        // VALIDATE ROLE
        // ADMIN CANNOT BE CREATED PUBLICLY
        // ==========================================

        const validRoles = [
            "DOCTOR",
            "PATIENT",
            "RECEPTIONIST"
        ];

        const normalizedRole = role.trim().toUpperCase();

        if (!validRoles.includes(normalizedRole)) {
            return res.status(400).json({
                success: false,
                message: "Invalid role"
            });
        }

        // ==========================================
        // NORMALIZE EMAIL
        // ==========================================

        const normalizedEmail =
            email.trim().toLowerCase();

        // ==========================================
        // CHECK EXISTING EMAIL
        // ==========================================

        const checkUserSql = `
            SELECT id
            FROM users
            WHERE email = ?
        `;

        db.query(
            checkUserSql,
            [normalizedEmail],
            async (err, results) => {

                if (err) {
                    console.error(
                        "Check user error:",
                        err
                    );

                    return res.status(500).json({
                        success: false,
                        message: "Database error"
                    });
                }

                if (results.length > 0) {
                    return res.status(409).json({
                        success: false,
                        message:
                            "Email already registered"
                    });
                }

                try {

                    // ==========================================
                    // HASH PASSWORD
                    // ==========================================

                    const hashedPassword =
                        await bcrypt.hash(
                            password,
                            10
                        );

                    // ==========================================
                    // INSERT USER
                    // ==========================================

                    const insertUserSql = `
                        INSERT INTO users
                        (
                            name,
                            email,
                            password,
                            role,
                            phone
                        )
                        VALUES (?, ?, ?, ?, ?)
                    `;

                    db.query(
                        insertUserSql,
                        [
                            name.trim(),
                            normalizedEmail,
                            hashedPassword,
                            normalizedRole,
                            phone
                                ? phone.trim()
                                : null
                        ],
                        (err, result) => {

                            if (err) {
                                console.error(
                                    "Insert user error:",
                                    err
                                );

                                return res.status(500).json({
                                    success: false,
                                    message:
                                        "Failed to create user",
                                    error: err.message
                                });
                            }

                            const userId =
                                result.insertId;

                            // ==========================================
                            // CREATE PATIENT RECORD
                            // ==========================================

                            if (
                                normalizedRole ===
                                "PATIENT"
                            ) {

                                const patientSql = `
                                    INSERT INTO patients
                                    (
                                        user_id
                                    )
                                    VALUES (?)
                                `;

                                db.query(
                                    patientSql,
                                    [userId],
                                    (err) => {

                                        if (err) {
                                            console.error(
                                                "Create patient record error:",
                                                err
                                            );

                                            // Remove user if
                                            // patient creation fails
                                            db.query(
                                                "DELETE FROM users WHERE id = ?",
                                                [userId]
                                            );

                                            return res.status(500).json({
                                                success: false,
                                                message:
                                                    "Failed to create patient profile",
                                                error:
                                                    err.message
                                            });
                                        }

                                        return res.status(201).json({
                                            success: true,
                                            message:
                                                "Patient registered successfully",
                                            userId: userId
                                        });
                                    }
                                );

                                return;
                            }

                            // ==========================================
                            // CREATE DOCTOR RECORD
                            // ==========================================

                            if (
                                normalizedRole ===
                                "DOCTOR"
                            ) {

                                const doctorSql = `
                                    INSERT INTO doctors
                                    (
                                        user_id,
                                        department_id,
                                        specialization,
                                        qualification,
                                        experience,
                                        consultation_fee,
                                        available_days,
                                        available_time
                                    )
                                    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                                `;

                                db.query(
                                    doctorSql,
                                    [
                                        userId,
                                        null,
                                        "General Medicine",
                                        null,
                                        0,
                                        0.00,
                                        null,
                                        null
                                    ],
                                    (err) => {

                                        if (err) {
                                            console.error(
                                                "Create doctor record error:",
                                                err
                                            );

                                            // Remove user if
                                            // doctor creation fails
                                            db.query(
                                                "DELETE FROM users WHERE id = ?",
                                                [userId]
                                            );

                                            return res.status(500).json({
                                                success: false,
                                                message:
                                                    "Failed to create doctor profile",
                                                error:
                                                    err.message
                                            });
                                        }

                                        return res.status(201).json({
                                            success: true,
                                            message:
                                                "Doctor registered successfully",
                                            userId: userId
                                        });
                                    }
                                );

                                return;
                            }

                            // ==========================================
                            // CREATE RECEPTIONIST / STAFF RECORD
                            // ==========================================

                            if (
                                normalizedRole ===
                                "RECEPTIONIST"
                            ) {

                                const staffSql = `
                                    INSERT INTO staff
                                    (
                                        user_id,
                                        designation,
                                        department_id,
                                        joining_date,
                                        salary
                                    )
                                    VALUES (?, ?, ?, ?, ?)
                                `;

                                db.query(
                                    staffSql,
                                    [
                                        userId,
                                        "Receptionist",
                                        null,
                                        null,
                                        0.00
                                    ],
                                    (err) => {

                                        if (err) {
                                            console.error(
                                                "Create staff record error:",
                                                err
                                            );

                                            // Remove user if
                                            // staff creation fails
                                            db.query(
                                                "DELETE FROM users WHERE id = ?",
                                                [userId]
                                            );

                                            return res.status(500).json({
                                                success: false,
                                                message:
                                                    "Failed to create staff profile",
                                                error:
                                                    err.message
                                            });
                                        }

                                        return res.status(201).json({
                                            success: true,
                                            message:
                                                "Receptionist registered successfully",
                                            userId: userId
                                        });
                                    }
                                );

                                return;
                            }
                        }
                    );

                } catch (hashError) {

                    console.error(
                        "Password hashing error:",
                        hashError
                    );

                    return res.status(500).json({
                        success: false,
                        message:
                            "Failed to secure password"
                    });
                }
            }
        );

    } catch (error) {

        console.error(
            "Register error:",
            error
        );

        return res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
};


// ==========================================
// LOGIN
// ==========================================

const login = (req, res) => {

    const {
        email,
        password
    } = req.body;

    // ==========================================
    // VALIDATE
    // ==========================================

    if (!email || !password) {
        return res.status(400).json({
            success: false,
            message:
                "Email and password are required"
        });
    }

    // ==========================================
    // CHECK JWT SECRET
    // ==========================================

    if (!process.env.JWT_SECRET) {

        console.error(
            "❌ JWT_SECRET is missing from .env"
        );

        return res.status(500).json({
            success: false,
            message:
                "JWT configuration error"
        });
    }

    // ==========================================
    // NORMALIZE EMAIL
    // ==========================================

    const normalizedEmail =
        email.trim().toLowerCase();

    // ==========================================
    // FIND USER
    // ==========================================

    const sql = `
        SELECT *
        FROM users
        WHERE email = ?
    `;

    db.query(
        sql,
        [normalizedEmail],
        async (err, results) => {

            if (err) {

                console.error(
                    "Login database error:",
                    err
                );

                return res.status(500).json({
                    success: false,
                    message:
                        "Database error"
                });
            }

            // ==========================================
            // USER NOT FOUND
            // ==========================================

            if (results.length === 0) {

                return res.status(401).json({
                    success: false,
                    message:
                        "Invalid email or password"
                });
            }

            const user = results[0];

            try {

                // ==========================================
                // COMPARE PASSWORD
                // ==========================================

                const passwordMatch =
                    await bcrypt.compare(
                        password,
                        user.password
                    );

                if (!passwordMatch) {

                    return res.status(401).json({
                        success: false,
                        message:
                            "Invalid email or password"
                    });
                }

                // ==========================================
                // CREATE JWT
                // ==========================================

                const token =
                    jwt.sign(
                        {
                            id: user.id,
                            email: user.email,
                            role: user.role
                        },
                        process.env.JWT_SECRET,
                        {
                            expiresIn: "1d"
                        }
                    );

                // ==========================================
                // RESPONSE
                // ==========================================

                return res.status(200).json({

                    success: true,

                    message:
                        "Login successful",

                    token: token,

                    user: {
                        id: user.id,
                        name: user.name,
                        email: user.email,
                        role: user.role,
                        phone: user.phone
                    }
                });

            } catch (error) {

                console.error(
                    "JWT error:",
                    error
                );

                return res.status(500).json({
                    success: false,
                    message:
                        "Authentication error"
                });
            }
        }
    );
};


// ==========================================
// EXPORT
// ==========================================

module.exports = {
    register,
    login
};