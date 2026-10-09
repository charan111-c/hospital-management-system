const db = require("../config/db");

// ==========================================
// CREATE PRESCRIPTION
// ==========================================

const createPrescription = (req, res) => {

    const {
        patient_id,
        doctor_id,
        medicine_id,
        dosage,
        frequency,
        duration,
        instructions,
        prescribed_date
    } = req.body;

    // Validation
    if (
        !patient_id ||
        !doctor_id ||
        !medicine_id ||
        !prescribed_date
    ) {
        return res.status(400).json({
            success: false,
            message: "Patient, doctor, medicine and prescribed date are required"
        });
    }

    // Check patient
    const patientSql = `
        SELECT id
        FROM patients
        WHERE id = ?
    `;

    db.query(patientSql, [patient_id], (err, patientResults) => {

        if (err) {
            console.error("Patient check error:", err);

            return res.status(500).json({
                success: false,
                message: "Database error while checking patient",
                error: err.message
            });
        }

        if (patientResults.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Patient not found"
            });
        }

        // Check doctor
        const doctorSql = `
            SELECT id
            FROM doctors
            WHERE id = ?
        `;

        db.query(doctorSql, [doctor_id], (err, doctorResults) => {

            if (err) {
                console.error("Doctor check error:", err);

                return res.status(500).json({
                    success: false,
                    message: "Database error while checking doctor",
                    error: err.message
                });
            }

            if (doctorResults.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: "Doctor not found"
                });
            }

            // Check medicine
            const medicineSql = `
                SELECT id
                FROM medicines
                WHERE id = ?
            `;

            db.query(
                medicineSql,
                [medicine_id],
                (err, medicineResults) => {

                    if (err) {
                        console.error(
                            "Medicine check error:",
                            err
                        );

                        return res.status(500).json({
                            success: false,
                            message: "Database error while checking medicine",
                            error: err.message
                        });
                    }

                    if (medicineResults.length === 0) {
                        return res.status(404).json({
                            success: false,
                            message: "Medicine not found"
                        });
                    }

                    // Insert prescription
                    const insertSql = `
                        INSERT INTO prescriptions
                        (
                            patient_id,
                            doctor_id,
                            medicine_id,
                            dosage,
                            frequency,
                            duration,
                            instructions,
                            prescribed_date
                        )
                        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                    `;

                    db.query(
                        insertSql,
                        [
                            patient_id,
                            doctor_id,
                            medicine_id,
                            dosage || null,
                            frequency || null,
                            duration || null,
                            instructions || null,
                            prescribed_date
                        ],
                        (err, result) => {

                            if (err) {
                                console.error(
                                    "Create prescription error:",
                                    err
                                );

                                return res.status(500).json({
                                    success: false,
                                    message: "Failed to create prescription",
                                    error: err.message
                                });
                            }

                            res.status(201).json({
                                success: true,
                                message: "Prescription created successfully",
                                prescriptionId: result.insertId
                            });

                        }
                    );

                }
            );

        });

    });

};


// ==========================================
// GET ALL PRESCRIPTIONS
// ==========================================

const getPrescriptions = (req, res) => {

    const sql = `
        SELECT
            pr.id,

            pr.patient_id,
            pu.name AS patient_name,

            pr.doctor_id,
            du.name AS doctor_name,

            pr.medicine_id,
            m.name AS medicine_name,

            pr.dosage,
            pr.frequency,
            pr.duration,
            pr.instructions,
            pr.prescribed_date

        FROM prescriptions pr

        INNER JOIN patients p
            ON pr.patient_id = p.id

        INNER JOIN users pu
            ON p.user_id = pu.id

        INNER JOIN doctors d
            ON pr.doctor_id = d.id

        INNER JOIN users du
            ON d.user_id = du.id

        INNER JOIN medicines m
            ON pr.medicine_id = m.id

        ORDER BY pr.id DESC
    `;

    db.query(sql, (err, results) => {

        if (err) {
            console.error(
                "Get prescriptions error:",
                err
            );

            return res.status(500).json({
                success: false,
                message: "Failed to fetch prescriptions",
                error: err.message
            });
        }

        res.status(200).json({
            success: true,
            count: results.length,
            prescriptions: results
        });

    });

};


// ==========================================
// GET PRESCRIPTION BY ID
// ==========================================

const getPrescriptionById = (req, res) => {

    const { id } = req.params;

    const sql = `
        SELECT
            pr.id,

            pr.patient_id,
            pu.name AS patient_name,

            pr.doctor_id,
            du.name AS doctor_name,

            pr.medicine_id,
            m.name AS medicine_name,

            pr.dosage,
            pr.frequency,
            pr.duration,
            pr.instructions,
            pr.prescribed_date

        FROM prescriptions pr

        INNER JOIN patients p
            ON pr.patient_id = p.id

        INNER JOIN users pu
            ON p.user_id = pu.id

        INNER JOIN doctors d
            ON pr.doctor_id = d.id

        INNER JOIN users du
            ON d.user_id = du.id

        INNER JOIN medicines m
            ON pr.medicine_id = m.id

        WHERE pr.id = ?
    `;

    db.query(sql, [id], (err, results) => {

        if (err) {
            console.error(
                "Get prescription error:",
                err
            );

            return res.status(500).json({
                success: false,
                message: "Failed to fetch prescription",
                error: err.message
            });
        }

        if (results.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Prescription not found"
            });
        }

        res.status(200).json({
            success: true,
            prescription: results[0]
        });

    });

};


// ==========================================
// GET PATIENT PRESCRIPTIONS
// ==========================================

const getPatientPrescriptions = (req, res) => {

    const { patientId } = req.params;

    const sql = `
        SELECT
            pr.id,

            pr.patient_id,
            pu.name AS patient_name,

            pr.doctor_id,
            du.name AS doctor_name,

            pr.medicine_id,
            m.name AS medicine_name,

            pr.dosage,
            pr.frequency,
            pr.duration,
            pr.instructions,
            pr.prescribed_date

        FROM prescriptions pr

        INNER JOIN patients p
            ON pr.patient_id = p.id

        INNER JOIN users pu
            ON p.user_id = pu.id

        INNER JOIN doctors d
            ON pr.doctor_id = d.id

        INNER JOIN users du
            ON d.user_id = du.id

        INNER JOIN medicines m
            ON pr.medicine_id = m.id

        WHERE pr.patient_id = ?

        ORDER BY pr.prescribed_date DESC
    `;

    db.query(sql, [patientId], (err, results) => {

        if (err) {
            console.error(
                "Get patient prescriptions error:",
                err
            );

            return res.status(500).json({
                success: false,
                message: "Failed to fetch patient prescriptions",
                error: err.message
            });
        }

        res.status(200).json({
            success: true,
            count: results.length,
            prescriptions: results
        });

    });

};


// ==========================================
// UPDATE PRESCRIPTION
// ==========================================

const updatePrescription = (req, res) => {

    const { id } = req.params;

    const {
        medicine_id,
        dosage,
        frequency,
        duration,
        instructions,
        prescribed_date
    } = req.body;

    if (!medicine_id || !prescribed_date) {
        return res.status(400).json({
            success: false,
            message: "Medicine and prescribed date are required"
        });
    }

    // Check medicine
    const medicineSql = `
        SELECT id
        FROM medicines
        WHERE id = ?
    `;

    db.query(
        medicineSql,
        [medicine_id],
        (err, medicineResults) => {

            if (err) {
                console.error(
                    "Medicine check error:",
                    err
                );

                return res.status(500).json({
                    success: false,
                    message: "Database error while checking medicine",
                    error: err.message
                });
            }

            if (medicineResults.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: "Medicine not found"
                });
            }

            const sql = `
                UPDATE prescriptions
                SET
                    medicine_id = ?,
                    dosage = ?,
                    frequency = ?,
                    duration = ?,
                    instructions = ?,
                    prescribed_date = ?
                WHERE id = ?
            `;

            db.query(
                sql,
                [
                    medicine_id,
                    dosage || null,
                    frequency || null,
                    duration || null,
                    instructions || null,
                    prescribed_date,
                    id
                ],
                (err, result) => {

                    if (err) {
                        console.error(
                            "Update prescription error:",
                            err
                        );

                        return res.status(500).json({
                            success: false,
                            message: "Failed to update prescription",
                            error: err.message
                        });
                    }

                    if (result.affectedRows === 0) {
                        return res.status(404).json({
                            success: false,
                            message: "Prescription not found"
                        });
                    }

                    res.status(200).json({
                        success: true,
                        message: "Prescription updated successfully"
                    });

                }
            );

        }
    );

};


// ==========================================
// DELETE PRESCRIPTION
// ==========================================

const deletePrescription = (req, res) => {

    const { id } = req.params;

    const sql = `
        DELETE FROM prescriptions
        WHERE id = ?
    `;

    db.query(sql, [id], (err, result) => {

        if (err) {
            console.error(
                "Delete prescription error:",
                err
            );

            return res.status(500).json({
                success: false,
                message: "Failed to delete prescription",
                error: err.message
            });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: "Prescription not found"
            });
        }

        res.status(200).json({
            success: true,
            message: "Prescription deleted successfully"
        });

    });

};


// ==========================================
// EXPORT
// ==========================================

module.exports = {
    createPrescription,
    getPrescriptions,
    getPrescriptionById,
    getPatientPrescriptions,
    updatePrescription,
    deletePrescription
};