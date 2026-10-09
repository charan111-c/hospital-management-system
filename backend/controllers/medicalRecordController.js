const db = require("../config/db");

// ==========================================
// CREATE MEDICAL RECORD
// ==========================================

const createMedicalRecord = (req, res) => {

    const {
        patient_id,
        doctor_id,
        diagnosis,
        symptoms,
        treatment,
        notes,
        record_date
    } = req.body;

    // Validation
    if (!patient_id || !doctor_id || !diagnosis || !record_date) {
        return res.status(400).json({
            success: false,
            message: "Patient, doctor, diagnosis and record date are required"
        });
    }

    // Check patient exists
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
                message: "Database error while checking patient"
            });
        }

        if (patientResults.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Patient not found"
            });
        }

        // Check doctor exists
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
                    message: "Database error while checking doctor"
                });
            }

            if (doctorResults.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: "Doctor not found"
                });
            }

            // Insert medical record
            const insertSql = `
                INSERT INTO medical_records
                (
                    patient_id,
                    doctor_id,
                    diagnosis,
                    symptoms,
                    treatment,
                    notes,
                    record_date
                )
                VALUES (?, ?, ?, ?, ?, ?, ?)
            `;

            db.query(
                insertSql,
                [
                    patient_id,
                    doctor_id,
                    diagnosis,
                    symptoms || null,
                    treatment || null,
                    notes || null,
                    record_date
                ],
                (err, result) => {

                    if (err) {
                        console.error(
                            "Create medical record error:",
                            err
                        );

                        return res.status(500).json({
                            success: false,
                            message: "Failed to create medical record",
                            error: err.message
                        });
                    }

                    res.status(201).json({
                        success: true,
                        message: "Medical record created successfully",
                        recordId: result.insertId
                    });

                }
            );

        });

    });

};


// ==========================================
// GET ALL MEDICAL RECORDS
// ==========================================

const getMedicalRecords = (req, res) => {

    const sql = `
        SELECT
            mr.id,
            mr.patient_id,
            pu.name AS patient_name,
            mr.doctor_id,
            du.name AS doctor_name,
            mr.diagnosis,
            mr.symptoms,
            mr.treatment,
            mr.notes,
            mr.record_date

        FROM medical_records mr

        INNER JOIN patients p
            ON mr.patient_id = p.id

        INNER JOIN users pu
            ON p.user_id = pu.id

        INNER JOIN doctors d
            ON mr.doctor_id = d.id

        INNER JOIN users du
            ON d.user_id = du.id

        ORDER BY mr.id DESC
    `;

    db.query(sql, (err, results) => {

        if (err) {
            console.error("Get medical records error:", err);

            return res.status(500).json({
                success: false,
                message: "Failed to fetch medical records",
                error: err.message
            });
        }

        res.status(200).json({
            success: true,
            count: results.length,
            records: results
        });

    });

};


// ==========================================
// GET MEDICAL RECORD BY ID
// ==========================================

const getMedicalRecordById = (req, res) => {

    const { id } = req.params;

    const sql = `
        SELECT
            mr.id,
            mr.patient_id,
            pu.name AS patient_name,
            mr.doctor_id,
            du.name AS doctor_name,
            mr.diagnosis,
            mr.symptoms,
            mr.treatment,
            mr.notes,
            mr.record_date

        FROM medical_records mr

        INNER JOIN patients p
            ON mr.patient_id = p.id

        INNER JOIN users pu
            ON p.user_id = pu.id

        INNER JOIN doctors d
            ON mr.doctor_id = d.id

        INNER JOIN users du
            ON d.user_id = du.id

        WHERE mr.id = ?
    `;

    db.query(sql, [id], (err, results) => {

        if (err) {
            console.error("Get medical record error:", err);

            return res.status(500).json({
                success: false,
                message: "Failed to fetch medical record",
                error: err.message
            });
        }

        if (results.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Medical record not found"
            });
        }

        res.status(200).json({
            success: true,
            record: results[0]
        });

    });

};


// ==========================================
// GET PATIENT MEDICAL RECORDS
// ==========================================

const getPatientMedicalRecords = (req, res) => {

    const { patientId } = req.params;

    const sql = `
        SELECT
            mr.id,
            mr.patient_id,
            pu.name AS patient_name,
            mr.doctor_id,
            du.name AS doctor_name,
            mr.diagnosis,
            mr.symptoms,
            mr.treatment,
            mr.notes,
            mr.record_date

        FROM medical_records mr

        INNER JOIN patients p
            ON mr.patient_id = p.id

        INNER JOIN users pu
            ON p.user_id = pu.id

        INNER JOIN doctors d
            ON mr.doctor_id = d.id

        INNER JOIN users du
            ON d.user_id = du.id

        WHERE mr.patient_id = ?

        ORDER BY mr.record_date DESC
    `;

    db.query(sql, [patientId], (err, results) => {

        if (err) {
            console.error("Get patient records error:", err);

            return res.status(500).json({
                success: false,
                message: "Failed to fetch patient records",
                error: err.message
            });
        }

        res.status(200).json({
            success: true,
            count: results.length,
            records: results
        });

    });

};


// ==========================================
// UPDATE MEDICAL RECORD
// ==========================================

const updateMedicalRecord = (req, res) => {

    const { id } = req.params;

    const {
        diagnosis,
        symptoms,
        treatment,
        notes,
        record_date
    } = req.body;

    if (!diagnosis || !record_date) {
        return res.status(400).json({
            success: false,
            message: "Diagnosis and record date are required"
        });
    }

    const sql = `
        UPDATE medical_records
        SET
            diagnosis = ?,
            symptoms = ?,
            treatment = ?,
            notes = ?,
            record_date = ?
        WHERE id = ?
    `;

    db.query(
        sql,
        [
            diagnosis,
            symptoms || null,
            treatment || null,
            notes || null,
            record_date,
            id
        ],
        (err, result) => {

            if (err) {
                console.error("Update medical record error:", err);

                return res.status(500).json({
                    success: false,
                    message: "Failed to update medical record",
                    error: err.message
                });
            }

            if (result.affectedRows === 0) {
                return res.status(404).json({
                    success: false,
                    message: "Medical record not found"
                });
            }

            res.status(200).json({
                success: true,
                message: "Medical record updated successfully"
            });

        }
    );

};


// ==========================================
// DELETE MEDICAL RECORD
// ==========================================

const deleteMedicalRecord = (req, res) => {

    const { id } = req.params;

    const sql = `
        DELETE FROM medical_records
        WHERE id = ?
    `;

    db.query(sql, [id], (err, result) => {

        if (err) {
            console.error("Delete medical record error:", err);

            return res.status(500).json({
                success: false,
                message: "Failed to delete medical record",
                error: err.message
            });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: "Medical record not found"
            });
        }

        res.status(200).json({
            success: true,
            message: "Medical record deleted successfully"
        });

    });

};


// ==========================================
// EXPORT
// ==========================================

module.exports = {
    createMedicalRecord,
    getMedicalRecords,
    getMedicalRecordById,
    getPatientMedicalRecords,
    updateMedicalRecord,
    deleteMedicalRecord
};