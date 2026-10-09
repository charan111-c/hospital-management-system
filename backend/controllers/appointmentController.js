const db = require("../config/db");

// =========================================================
// CREATE APPOINTMENT
// =========================================================

exports.createAppointment = (req, res) => {
    const {
        patient_id,
        doctor_id,
        appointment_date,
        appointment_time,
        reason,
        status
    } = req.body;

    if (
        !patient_id ||
        !doctor_id ||
        !appointment_date ||
        !appointment_time
    ) {
        return res.status(400).json({
            success: false,
            message:
                "Patient, doctor, appointment date and appointment time are required"
        });
    }

    const appointmentStatus = status || "Pending";

    // =====================================================
    // CHECK PATIENT
    // =====================================================

    db.query(
        "SELECT id FROM patients WHERE id = ?",
        [patient_id],
        (err, patient) => {
            if (err) {
                console.error("Check patient error:", err);

                return res.status(500).json({
                    success: false,
                    message: "Database error"
                });
            }

            if (patient.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: "Patient not found"
                });
            }

            // =================================================
            // CHECK DOCTOR
            // =================================================

            db.query(
                "SELECT id FROM doctors WHERE id = ?",
                [doctor_id],
                (err, doctor) => {
                    if (err) {
                        console.error("Check doctor error:", err);

                        return res.status(500).json({
                            success: false,
                            message: "Database error"
                        });
                    }

                    if (doctor.length === 0) {
                        return res.status(404).json({
                            success: false,
                            message: "Doctor not found"
                        });
                    }

                    // =============================================
                    // CREATE APPOINTMENT
                    // =============================================

                    const sql = `
                        INSERT INTO appointments
                        (
                            patient_id,
                            doctor_id,
                            appointment_date,
                            appointment_time,
                            reason,
                            status
                        )
                        VALUES (?, ?, ?, ?, ?, ?)
                    `;

                    db.query(
                        sql,
                        [
                            patient_id,
                            doctor_id,
                            appointment_date,
                            appointment_time,
                            reason || null,
                            appointmentStatus
                        ],
                        (err, result) => {
                            if (err) {
                                console.error(
                                    "Create appointment error:",
                                    err
                                );

                                return res.status(500).json({
                                    success: false,
                                    message:
                                        "Failed to create appointment",
                                    error: err.message
                                });
                            }

                            res.status(201).json({
                                success: true,
                                message:
                                    "Appointment created successfully",
                                appointmentId: result.insertId
                            });
                        }
                    );
                }
            );
        }
    );
};


// =========================================================
// GET ALL APPOINTMENTS
// ADMIN / RECEPTIONIST / DOCTOR
// =========================================================

exports.getAllAppointments = (req, res) => {

    const sql = `
        SELECT
            a.*,

            pu.name AS patient_name,
            pu.email AS patient_email,
            pu.phone AS patient_phone,

            du.name AS doctor_name,

            d.specialization AS doctor_specialization,

            dep.name AS department_name

        FROM appointments a

        LEFT JOIN patients p
            ON a.patient_id = p.id

        LEFT JOIN users pu
            ON p.user_id = pu.id

        LEFT JOIN doctors d
            ON a.doctor_id = d.id

        LEFT JOIN users du
            ON d.user_id = du.id

        LEFT JOIN departments dep
            ON d.department_id = dep.id

        ORDER BY
            a.appointment_date DESC,
            a.appointment_time DESC
    `;

    db.query(sql, (err, rows) => {

        if (err) {
            console.error(
                "Get appointments error:",
                err
            );

            return res.status(500).json({
                success: false,
                message:
                    "Failed to fetch appointments",
                error: err.message
            });
        }

        res.status(200).json({
            success: true,
            appointments: rows
        });
    });
};


// =========================================================
// GET MY APPOINTMENTS
// PATIENT ONLY
// =========================================================
//
// Uses the logged-in user's ID.
//
// users.id
//     ↓
// patients.user_id
//     ↓
// patients.id
//     ↓
// appointments.patient_id
//
// This prevents one patient from viewing another patient's
// appointments.
// =========================================================

exports.getMyAppointments = (req, res) => {

    const userId = req.user.id;

    const sql = `
        SELECT
            a.*,

            pu.name AS patient_name,
            pu.email AS patient_email,
            pu.phone AS patient_phone,

            du.name AS doctor_name,

            d.specialization AS doctor_specialization,

            dep.name AS department_name

        FROM appointments a

        INNER JOIN patients p
            ON a.patient_id = p.id

        INNER JOIN users pu
            ON p.user_id = pu.id

        LEFT JOIN doctors d
            ON a.doctor_id = d.id

        LEFT JOIN users du
            ON d.user_id = du.id

        LEFT JOIN departments dep
            ON d.department_id = dep.id

        WHERE p.user_id = ?

        ORDER BY
            a.appointment_date DESC,
            a.appointment_time DESC
    `;

    db.query(sql, [userId], (err, rows) => {

        if (err) {
            console.error(
                "Get my appointments error:",
                err
            );

            return res.status(500).json({
                success: false,
                message:
                    "Failed to fetch your appointments",
                error: err.message
            });
        }

        res.status(200).json({
            success: true,
            appointments: rows
        });
    });
};


// =========================================================
// GET APPOINTMENT BY ID
// ADMIN / RECEPTIONIST / DOCTOR
// =========================================================

exports.getAppointmentById = (req, res) => {

    const { id } = req.params;

    const sql = `
        SELECT
            a.*,

            pu.name AS patient_name,
            pu.email AS patient_email,
            pu.phone AS patient_phone,

            du.name AS doctor_name,

            d.specialization AS doctor_specialization,

            dep.name AS department_name

        FROM appointments a

        LEFT JOIN patients p
            ON a.patient_id = p.id

        LEFT JOIN users pu
            ON p.user_id = pu.id

        LEFT JOIN doctors d
            ON a.doctor_id = d.id

        LEFT JOIN users du
            ON d.user_id = du.id

        LEFT JOIN departments dep
            ON d.department_id = dep.id

        WHERE a.id = ?
    `;

    db.query(
        sql,
        [id],
        (err, rows) => {

            if (err) {
                console.error(
                    "Get appointment error:",
                    err
                );

                return res.status(500).json({
                    success: false,
                    message:
                        "Failed to fetch appointment",
                    error: err.message
                });
            }

            if (rows.length === 0) {
                return res.status(404).json({
                    success: false,
                    message:
                        "Appointment not found"
                });
            }

            res.status(200).json({
                success: true,
                appointment: rows[0]
            });
        }
    );
};


// =========================================================
// FULL UPDATE APPOINTMENT
// ADMIN / RECEPTIONIST
// =========================================================

exports.updateAppointment = (req, res) => {

    const { id } = req.params;

    const {
        patient_id,
        doctor_id,
        appointment_date,
        appointment_time,
        reason,
        status
    } = req.body;

    if (
        !patient_id ||
        !doctor_id ||
        !appointment_date ||
        !appointment_time
    ) {
        return res.status(400).json({
            success: false,
            message:
                "Patient, doctor, appointment date and appointment time are required"
        });
    }

    // =====================================================
    // CHECK APPOINTMENT
    // =====================================================

    db.query(
        "SELECT id FROM appointments WHERE id = ?",
        [id],
        (err, appointment) => {

            if (err) {
                console.error(
                    "Check appointment error:",
                    err
                );

                return res.status(500).json({
                    success: false,
                    message: "Database error"
                });
            }

            if (appointment.length === 0) {
                return res.status(404).json({
                    success: false,
                    message:
                        "Appointment not found"
                });
            }

            // =================================================
            // CHECK PATIENT
            // =================================================

            db.query(
                "SELECT id FROM patients WHERE id = ?",
                [patient_id],
                (err, patient) => {

                    if (err) {
                        console.error(
                            "Check patient error:",
                            err
                        );

                        return res.status(500).json({
                            success: false,
                            message:
                                "Database error"
                        });
                    }

                    if (patient.length === 0) {
                        return res.status(404).json({
                            success: false,
                            message:
                                "Patient not found"
                        });
                    }

                    // =============================================
                    // CHECK DOCTOR
                    // =============================================

                    db.query(
                        "SELECT id FROM doctors WHERE id = ?",
                        [doctor_id],
                        (err, doctor) => {

                            if (err) {
                                console.error(
                                    "Check doctor error:",
                                    err
                                );

                                return res.status(500).json({
                                    success: false,
                                    message:
                                        "Database error"
                                });
                            }

                            if (doctor.length === 0) {
                                return res.status(404).json({
                                    success: false,
                                    message:
                                        "Doctor not found"
                                });
                            }

                            // =============================================
                            // UPDATE
                            // =============================================

                            const sql = `
                                UPDATE appointments
                                SET
                                    patient_id = ?,
                                    doctor_id = ?,
                                    appointment_date = ?,
                                    appointment_time = ?,
                                    reason = ?,
                                    status = ?
                                WHERE id = ?
                            `;

                            db.query(
                                sql,
                                [
                                    patient_id,
                                    doctor_id,
                                    appointment_date,
                                    appointment_time,
                                    reason || null,
                                    status || "Pending",
                                    id
                                ],
                                (err) => {

                                    if (err) {
                                        console.error(
                                            "Update appointment error:",
                                            err
                                        );

                                        return res.status(500).json({
                                            success: false,
                                            message:
                                                "Failed to update appointment",
                                            error:
                                                err.message
                                        });
                                    }

                                    res.status(200).json({
                                        success: true,
                                        message:
                                            "Appointment updated successfully"
                                    });
                                }
                            );
                        }
                    );
                }
            );
        }
    );
};


// =========================================================
// UPDATE APPOINTMENT STATUS
// ADMIN / RECEPTIONIST / DOCTOR
// =========================================================

exports.updateAppointmentStatus = (req, res) => {

    const { id } = req.params;
    const { status } = req.body;

    if (!status) {
        return res.status(400).json({
            success: false,
            message: "Status is required"
        });
    }

    const validStatuses = [
        "Pending",
        "Confirmed",
        "Completed",
        "Cancelled"
    ];

    if (!validStatuses.includes(status)) {
        return res.status(400).json({
            success: false,
            message:
                "Invalid appointment status"
        });
    }

    const sql = `
        UPDATE appointments
        SET status = ?
        WHERE id = ?
    `;

    db.query(
        sql,
        [status, id],
        (err, result) => {

            if (err) {
                console.error(
                    "Update appointment status error:",
                    err
                );

                return res.status(500).json({
                    success: false,
                    message:
                        "Failed to update appointment status",
                    error: err.message
                });
            }

            if (result.affectedRows === 0) {
                return res.status(404).json({
                    success: false,
                    message:
                        "Appointment not found"
                });
            }

            res.status(200).json({
                success: true,
                message:
                    "Appointment status updated successfully"
            });
        }
    );
};


// =========================================================
// DELETE APPOINTMENT
// ADMIN / RECEPTIONIST
// =========================================================

exports.deleteAppointment = (req, res) => {

    const { id } = req.params;

    db.query(
        "DELETE FROM appointments WHERE id = ?",
        [id],
        (err, result) => {

            if (err) {
                console.error(
                    "Delete appointment error:",
                    err
                );

                return res.status(500).json({
                    success: false,
                    message:
                        "Failed to delete appointment",
                    error: err.message
                });
            }

            if (result.affectedRows === 0) {
                return res.status(404).json({
                    success: false,
                    message:
                        "Appointment not found"
                });
            }

            res.status(200).json({
                success: true,
                message:
                    "Appointment deleted successfully"
            });
        }
    );
};