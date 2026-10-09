const db = require("../config/db");
const bcrypt = require("bcryptjs");

// ==========================================
// CREATE DOCTOR
// ==========================================

const createDoctor = async (req, res) => {
    const connection = db;

    try {
        const {
            name,
            email,
            password,
            phone,
            department_id,
            specialization,
            qualification,
            experience,
            consultation_fee,
            available_days,
            available_time
        } = req.body;

        // ------------------------------------------
        // Validate required fields
        // ------------------------------------------

        if (
            !name ||
            !email ||
            !password ||
            !department_id ||
            !specialization
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Name, email, password, department, and specialization are required"
            });
        }

        // ------------------------------------------
        // Check department
        // ------------------------------------------

        const departmentSql = `
            SELECT id, name
            FROM departments
            WHERE id = ?
        `;

        connection.query(
            departmentSql,
            [department_id],
            async (err, departmentResults) => {

                if (err) {
                    console.error("Department check error:", err);

                    return res.status(500).json({
                        success: false,
                        message: "Database error"
                    });
                }

                if (departmentResults.length === 0) {
                    return res.status(404).json({
                        success: false,
                        message: "Department not found"
                    });
                }

                // ------------------------------------------
                // Check existing email
                // ------------------------------------------

                const userCheckSql = `
                    SELECT id
                    FROM users
                    WHERE email = ?
                `;

                connection.query(
                    userCheckSql,
                    [email],
                    async (err, userResults) => {

                        if (err) {
                            console.error(
                                "User check error:",
                                err
                            );

                            return res.status(500).json({
                                success: false,
                                message: "Database error"
                            });
                        }

                        if (userResults.length > 0) {
                            return res.status(409).json({
                                success: false,
                                message:
                                    "Email already registered"
                            });
                        }

                        // ------------------------------------------
                        // Hash password
                        // ------------------------------------------

                        const hashedPassword =
                            await bcrypt.hash(password, 10);

                        // ------------------------------------------
                        // Create user account
                        // ------------------------------------------

                        const userSql = `
                            INSERT INTO users
                            (
                                name,
                                email,
                                password,
                                role,
                                phone
                            )
                            VALUES (?, ?, ?, 'DOCTOR', ?)
                        `;

                        connection.query(
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
                                        "Create doctor user error:",
                                        err
                                    );

                                    return res.status(500).json({
                                        success: false,
                                        message:
                                            "Failed to create doctor account"
                                    });
                                }

                                const userId =
                                    userResult.insertId;

                                // ------------------------------------------
                                // Create doctor profile
                                // ------------------------------------------

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

                                connection.query(
                                    doctorSql,
                                    [
                                        userId,
                                        department_id,
                                        specialization,
                                        qualification || null,
                                        experience || 0,
                                        consultation_fee || 0,
                                        available_days || null,
                                        available_time || null
                                    ],
                                    (err, doctorResult) => {

                                        if (err) {
                                            console.error(
                                                "Create doctor profile error:",
                                                err
                                            );

                                            // Remove user if doctor
                                            // profile creation fails
                                            connection.query(
                                                "DELETE FROM users WHERE id = ?",
                                                [userId]
                                            );

                                            return res.status(500).json({
                                                success: false,
                                                message:
                                                    "Failed to create doctor profile"
                                            });
                                        }

                                        return res.status(201).json({
                                            success: true,
                                            message:
                                                "Doctor created successfully",
                                            doctorId:
                                                doctorResult.insertId,
                                            userId: userId
                                        });
                                    }
                                );
                            }
                        );
                    }
                );
            }
        );

    } catch (error) {

        console.error("Create doctor error:", error);

        return res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
};


// ==========================================
// GET ALL DOCTORS
// ==========================================

const getDoctors = (req, res) => {

    const sql = `
        SELECT
            d.id,
            u.id AS user_id,
            u.name,
            u.email,
            u.phone,
            d.specialization,
            d.qualification,
            d.experience,
            d.consultation_fee,
            d.available_days,
            d.available_time,
            dep.id AS department_id,
            dep.name AS department_name,
            d.created_at
        FROM doctors d

        INNER JOIN users u
            ON d.user_id = u.id

        LEFT JOIN departments dep
            ON d.department_id = dep.id

        ORDER BY d.id DESC
    `;

    db.query(sql, (err, results) => {

        if (err) {
            console.error("Get doctors error:", err);

            return res.status(500).json({
                success: false,
                message: "Failed to fetch doctors"
            });
        }

        res.status(200).json({
            success: true,
            count: results.length,
            doctors: results
        });
    });
};


// ==========================================
// GET DOCTOR BY ID
// ==========================================

const getDoctorById = (req, res) => {

    const { id } = req.params;

    const sql = `
        SELECT
            d.id,
            u.id AS user_id,
            u.name,
            u.email,
            u.phone,
            d.specialization,
            d.qualification,
            d.experience,
            d.consultation_fee,
            d.available_days,
            d.available_time,
            dep.id AS department_id,
            dep.name AS department_name,
            d.created_at
        FROM doctors d

        INNER JOIN users u
            ON d.user_id = u.id

        LEFT JOIN departments dep
            ON d.department_id = dep.id

        WHERE d.id = ?
    `;

    db.query(sql, [id], (err, results) => {

        if (err) {
            console.error("Get doctor error:", err);

            return res.status(500).json({
                success: false,
                message: "Failed to fetch doctor"
            });
        }

        if (results.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Doctor not found"
            });
        }

        res.status(200).json({
            success: true,
            doctor: results[0]
        });
    });
};


// ==========================================
// UPDATE DOCTOR
// ==========================================

const updateDoctor = (req, res) => {

    const { id } = req.params;

    const {
        name,
        email,
        phone,
        department_id,
        specialization,
        qualification,
        experience,
        consultation_fee,
        available_days,
        available_time
    } = req.body;

    if (
        !name ||
        !email ||
        !department_id ||
        !specialization
    ) {
        return res.status(400).json({
            success: false,
            message:
                "Name, email, department, and specialization are required"
        });
    }

    // First find doctor
    const findDoctorSql = `
        SELECT user_id
        FROM doctors
        WHERE id = ?
    `;

    db.query(
        findDoctorSql,
        [id],
        (err, doctorResults) => {

            if (err) {
                console.error(err);

                return res.status(500).json({
                    success: false,
                    message: "Database error"
                });
            }

            if (doctorResults.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: "Doctor not found"
                });
            }

            const userId = doctorResults[0].user_id;

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
                                "Failed to update doctor account"
                        });
                    }

                    // Update doctor profile
                    const doctorSql = `
                        UPDATE doctors
                        SET
                            department_id = ?,
                            specialization = ?,
                            qualification = ?,
                            experience = ?,
                            consultation_fee = ?,
                            available_days = ?,
                            available_time = ?
                        WHERE id = ?
                    `;

                    db.query(
                        doctorSql,
                        [
                            department_id,
                            specialization,
                            qualification || null,
                            experience || 0,
                            consultation_fee || 0,
                            available_days || null,
                            available_time || null,
                            id
                        ],
                        (err) => {

                            if (err) {
                                console.error(err);

                                return res.status(500).json({
                                    success: false,
                                    message:
                                        "Failed to update doctor"
                                });
                            }

                            res.status(200).json({
                                success: true,
                                message:
                                    "Doctor updated successfully"
                            });
                        }
                    );
                }
            );
        }
    );
};


// ==========================================
// DELETE DOCTOR
// ==========================================

const deleteDoctor = (req, res) => {

    const { id } = req.params;

    const findDoctorSql = `
        SELECT user_id
        FROM doctors
        WHERE id = ?
    `;

    db.query(
        findDoctorSql,
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
                    message: "Doctor not found"
                });
            }

            const userId = results[0].user_id;

            // Because doctors.user_id has ON DELETE CASCADE,
            // deleting the user automatically deletes the doctor.
            const deleteUserSql = `
                DELETE FROM users
                WHERE id = ?
            `;

            db.query(
                deleteUserSql,
                [userId],
                (err) => {

                    if (err) {
                        console.error(err);

                        return res.status(500).json({
                            success: false,
                            message:
                                "Failed to delete doctor"
                        });
                    }

                    res.status(200).json({
                        success: true,
                        message:
                            "Doctor deleted successfully"
                    });
                }
            );
        }
    );
};


module.exports = {
    createDoctor,
    getDoctors,
    getDoctorById,
    updateDoctor,
    deleteDoctor
};