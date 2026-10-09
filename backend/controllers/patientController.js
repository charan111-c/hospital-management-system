const db = require("../config/db");
const bcrypt = require("bcryptjs");

// ==========================================
// CREATE PATIENT
// ==========================================

const createPatient = async (req, res) => {
    try {

        const {
            name,
            email,
            password,
            phone,
            date_of_birth,
            gender,
            blood_group,
            address,
            emergency_contact
        } = req.body;

        // Validate required fields
        if (!name || !email || !password) {
            return res.status(400).json({
                success: false,
                message: "Name, email and password are required"
            });
        }

        // Check existing email
        const checkUserSql = `
            SELECT id
            FROM users
            WHERE email = ?
        `;

        db.query(
            checkUserSql,
            [email],
            async (err, results) => {

                if (err) {
                    console.error("User check error:", err);

                    return res.status(500).json({
                        success: false,
                        message: "Database error"
                    });
                }

                if (results.length > 0) {
                    return res.status(409).json({
                        success: false,
                        message: "Email already registered"
                    });
                }

                // Hash password
                const hashedPassword =
                    await bcrypt.hash(password, 10);

                // Create user
                const userSql = `
                    INSERT INTO users
                    (
                        name,
                        email,
                        password,
                        role,
                        phone
                    )
                    VALUES (?, ?, ?, 'PATIENT', ?)
                `;

                db.query(
                    userSql,
                    [
                        name,
                        email,
                        hashedPassword,
                        phone || null
                    ],
                    (err, userResult) => {

                        if (err) {
                            console.error(
                                "Create patient user error:",
                                err
                            );

                            return res.status(500).json({
                                success: false,
                                message:
                                    "Failed to create patient account"
                            });
                        }

                        const userId =
                            userResult.insertId;

                        // Create patient profile
                        const patientSql = `
                            INSERT INTO patients
                            (
                                user_id,
                                date_of_birth,
                                gender,
                                blood_group,
                                address,
                                emergency_contact
                            )
                            VALUES (?, ?, ?, ?, ?, ?)
                        `;

                        db.query(
                            patientSql,
                            [
                                userId,
                                date_of_birth || null,
                                gender || null,
                                blood_group || null,
                                address || null,
                                emergency_contact || null
                            ],
                            (err, patientResult) => {

                                if (err) {
                                    console.error(
                                        "Create patient profile error:",
                                        err
                                    );

                                    // Delete user if profile
                                    // creation fails
                                    db.query(
                                        "DELETE FROM users WHERE id = ?",
                                        [userId]
                                    );

                                    return res.status(500).json({
                                        success: false,
                                        message:
                                            "Failed to create patient profile"
                                    });
                                }

                                res.status(201).json({
                                    success: true,
                                    message:
                                        "Patient created successfully",
                                    patientId:
                                        patientResult.insertId,
                                    userId: userId
                                });
                            }
                        );
                    }
                );
            }
        );

    } catch (error) {

        console.error("Create patient error:", error);

        res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
};


// ==========================================
// GET ALL PATIENTS
// ==========================================

const getPatients = (req, res) => {

    const sql = `
        SELECT
            p.id,
            u.id AS user_id,
            u.name,
            u.email,
            u.phone,

            p.date_of_birth,
            p.gender,
            p.blood_group,
            p.address,
            p.emergency_contact,
            p.created_at

        FROM patients p

        INNER JOIN users u
            ON p.user_id = u.id

        ORDER BY p.id DESC
    `;

    db.query(sql, (err, results) => {

        if (err) {
            console.error("Get patients error:", err);

            return res.status(500).json({
                success: false,
                message: "Failed to fetch patients"
            });
        }

        res.status(200).json({
            success: true,
            count: results.length,
            patients: results
        });
    });
};


// ==========================================
// GET PATIENT BY ID
// ==========================================

const getPatientById = (req, res) => {

    const { id } = req.params;

    const sql = `
        SELECT
            p.id,
            u.id AS user_id,
            u.name,
            u.email,
            u.phone,

            p.date_of_birth,
            p.gender,
            p.blood_group,
            p.address,
            p.emergency_contact,
            p.created_at

        FROM patients p

        INNER JOIN users u
            ON p.user_id = u.id

        WHERE p.id = ?
    `;

    db.query(sql, [id], (err, results) => {

        if (err) {
            console.error("Get patient error:", err);

            return res.status(500).json({
                success: false,
                message: "Failed to fetch patient"
            });
        }

        if (results.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Patient not found"
            });
        }

        res.status(200).json({
            success: true,
            patient: results[0]
        });
    });
};


// ==========================================
// UPDATE PATIENT
// ==========================================

const updatePatient = (req, res) => {

    const { id } = req.params;

    const {
        name,
        email,
        phone,
        date_of_birth,
        gender,
        blood_group,
        address,
        emergency_contact
    } = req.body;

    if (!name || !email) {
        return res.status(400).json({
            success: false,
            message: "Name and email are required"
        });
    }

    // Find patient
    const findSql = `
        SELECT user_id
        FROM patients
        WHERE id = ?
    `;

    db.query(
        findSql,
        [id],
        (err, results) => {

            if (err) {
                console.error(err);

                return res.status(500).json({
                    success: false,
                    message: "Database error"
                });
            }

            if (results.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: "Patient not found"
                });
            }

            const userId = results[0].user_id;

            // Update user
            const userSql = `
                UPDATE users
                SET
                    name = ?,
                    email = ?,
                    phone = ?
                WHERE id = ?
            `;

            db.query(
                userSql,
                [
                    name,
                    email,
                    phone || null,
                    userId
                ],
                (err) => {

                    if (err) {

                        if (err.code === "ER_DUP_ENTRY") {
                            return res.status(409).json({
                                success: false,
                                message:
                                    "Email already registered"
                            });
                        }

                        console.error(err);

                        return res.status(500).json({
                            success: false,
                            message:
                                "Failed to update patient account"
                        });
                    }

                    // Update patient profile
                    const patientSql = `
                        UPDATE patients
                        SET
                            date_of_birth = ?,
                            gender = ?,
                            blood_group = ?,
                            address = ?,
                            emergency_contact = ?
                        WHERE id = ?
                    `;

                    db.query(
                        patientSql,
                        [
                            date_of_birth || null,
                            gender || null,
                            blood_group || null,
                            address || null,
                            emergency_contact || null,
                            id
                        ],
                        (err) => {

                            if (err) {
                                console.error(err);

                                return res.status(500).json({
                                    success: false,
                                    message:
                                        "Failed to update patient"
                                });
                            }

                            res.status(200).json({
                                success: true,
                                message:
                                    "Patient updated successfully"
                            });
                        }
                    );
                }
            );
        }
    );
};


// ==========================================
// DELETE PATIENT
// ==========================================

const deletePatient = (req, res) => {

    const { id } = req.params;

    const findSql = `
        SELECT user_id
        FROM patients
        WHERE id = ?
    `;

    db.query(
        findSql,
        [id],
        (err, results) => {

            if (err) {
                console.error(err);

                return res.status(500).json({
                    success: false,
                    message: "Database error"
                });
            }

            if (results.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: "Patient not found"
                });
            }

            const userId = results[0].user_id;

            // users -> patients has ON DELETE CASCADE
            const deleteSql = `
                DELETE FROM users
                WHERE id = ?
            `;

            db.query(
                deleteSql,
                [userId],
                (err) => {

                    if (err) {
                        console.error(err);

                        return res.status(500).json({
                            success: false,
                            message:
                                "Failed to delete patient"
                        });
                    }

                    res.status(200).json({
                        success: true,
                        message:
                            "Patient deleted successfully"
                    });
                }
            );
        }
    );
};


module.exports = {
    createPatient,
    getPatients,
    getPatientById,
    updatePatient,
    deletePatient
};