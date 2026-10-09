const db = require("../config/db");

// ==========================================
// CREATE BILL
// ==========================================

const createBill = (req, res) => {

    const {
        patient_id,
        appointment_id,
        consultation_fee,
        medicine_fee,
        test_fee,
        other_fee,
        payment_status,
        payment_method
    } = req.body;

    if (!patient_id) {
        return res.status(400).json({
            success: false,
            message: "Patient ID is required"
        });
    }

    // Convert fees to numbers
    const consultation = Number(consultation_fee) || 0;
    const medicine = Number(medicine_fee) || 0;
    const test = Number(test_fee) || 0;
    const other = Number(other_fee) || 0;

    // Automatically calculate total
    const total = consultation + medicine + test + other;

    const sql = `
        INSERT INTO billing
        (
            patient_id,
            appointment_id,
            consultation_fee,
            medicine_fee,
            test_fee,
            other_fee,
            total_amount,
            payment_status,
            payment_method
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    db.query(
        sql,
        [
            patient_id,
            appointment_id || null,
            consultation,
            medicine,
            test,
            other,
            total,
            payment_status || "Pending",
            payment_method || null
        ],
        (err, result) => {

            if (err) {
                console.error("Create bill error:", err);

                return res.status(500).json({
                    success: false,
                    message: "Failed to create bill",
                    error: err.message
                });
            }

            res.status(201).json({
                success: true,
                message: "Bill created successfully",
                billId: result.insertId,
                totalAmount: total
            });

        }
    );
};


// ==========================================
// GET ALL BILLS
// ==========================================

const getBills = (req, res) => {

    const sql = `
        SELECT
            b.id,

            b.patient_id,
            u.name AS patient_name,

            b.appointment_id,

            b.consultation_fee,
            b.medicine_fee,
            b.test_fee,
            b.other_fee,

            b.total_amount,
            b.payment_status,
            b.payment_method,
            b.bill_date

        FROM billing b

        INNER JOIN patients p
            ON b.patient_id = p.id

        INNER JOIN users u
            ON p.user_id = u.id

        ORDER BY b.id DESC
    `;

    db.query(sql, (err, results) => {

        if (err) {
            console.error("Get bills error:", err);

            return res.status(500).json({
                success: false,
                message: "Failed to fetch bills",
                error: err.message
            });
        }

        res.status(200).json({
            success: true,
            count: results.length,
            bills: results
        });

    });
};


// ==========================================
// GET BILL BY ID
// ==========================================

const getBillById = (req, res) => {

    const { id } = req.params;

    const sql = `
        SELECT
            b.id,

            b.patient_id,
            u.name AS patient_name,

            b.appointment_id,

            b.consultation_fee,
            b.medicine_fee,
            b.test_fee,
            b.other_fee,

            b.total_amount,
            b.payment_status,
            b.payment_method,
            b.bill_date

        FROM billing b

        INNER JOIN patients p
            ON b.patient_id = p.id

        INNER JOIN users u
            ON p.user_id = u.id

        WHERE b.id = ?
    `;

    db.query(sql, [id], (err, results) => {

        if (err) {
            console.error("Get bill error:", err);

            return res.status(500).json({
                success: false,
                message: "Failed to fetch bill",
                error: err.message
            });
        }

        if (results.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Bill not found"
            });
        }

        res.status(200).json({
            success: true,
            bill: results[0]
        });

    });
};


// ==========================================
// GET PATIENT BILLS
// ==========================================

const getPatientBills = (req, res) => {

    const { patientId } = req.params;

    const sql = `
        SELECT
            b.id,

            b.patient_id,
            u.name AS patient_name,

            b.appointment_id,

            b.consultation_fee,
            b.medicine_fee,
            b.test_fee,
            b.other_fee,

            b.total_amount,
            b.payment_status,
            b.payment_method,
            b.bill_date

        FROM billing b

        INNER JOIN patients p
            ON b.patient_id = p.id

        INNER JOIN users u
            ON p.user_id = u.id

        WHERE b.patient_id = ?

        ORDER BY b.bill_date DESC
    `;

    db.query(sql, [patientId], (err, results) => {

        if (err) {
            console.error("Get patient bills error:", err);

            return res.status(500).json({
                success: false,
                message: "Failed to fetch patient bills",
                error: err.message
            });
        }

        res.status(200).json({
            success: true,
            count: results.length,
            bills: results
        });

    });
};


// ==========================================
// UPDATE BILL
// ==========================================

const updateBill = (req, res) => {

    const { id } = req.params;

    const {
        consultation_fee,
        medicine_fee,
        test_fee,
        other_fee,
        payment_status,
        payment_method
    } = req.body;

    const consultation = Number(consultation_fee) || 0;
    const medicine = Number(medicine_fee) || 0;
    const test = Number(test_fee) || 0;
    const other = Number(other_fee) || 0;

    const total = consultation + medicine + test + other;

    const sql = `
        UPDATE billing
        SET
            consultation_fee = ?,
            medicine_fee = ?,
            test_fee = ?,
            other_fee = ?,
            total_amount = ?,
            payment_status = ?,
            payment_method = ?
        WHERE id = ?
    `;

    db.query(
        sql,
        [
            consultation,
            medicine,
            test,
            other,
            total,
            payment_status || "Pending",
            payment_method || null,
            id
        ],
        (err, result) => {

            if (err) {
                console.error("Update bill error:", err);

                return res.status(500).json({
                    success: false,
                    message: "Failed to update bill",
                    error: err.message
                });
            }

            if (result.affectedRows === 0) {
                return res.status(404).json({
                    success: false,
                    message: "Bill not found"
                });
            }

            res.status(200).json({
                success: true,
                message: "Bill updated successfully",
                totalAmount: total
            });

        }
    );
};


// ==========================================
// UPDATE PAYMENT STATUS
// ==========================================

const updatePaymentStatus = (req, res) => {

    const { id } = req.params;

    const {
        payment_status,
        payment_method
    } = req.body;

    if (!payment_status) {
        return res.status(400).json({
            success: false,
            message: "Payment status is required"
        });
    }

    const sql = `
        UPDATE billing
        SET
            payment_status = ?,
            payment_method = ?
        WHERE id = ?
    `;

    db.query(
        sql,
        [
            payment_status,
            payment_method || null,
            id
        ],
        (err, result) => {

            if (err) {
                console.error(
                    "Update payment status error:",
                    err
                );

                return res.status(500).json({
                    success: false,
                    message: "Failed to update payment status",
                    error: err.message
                });
            }

            if (result.affectedRows === 0) {
                return res.status(404).json({
                    success: false,
                    message: "Bill not found"
                });
            }

            res.status(200).json({
                success: true,
                message: "Payment status updated successfully"
            });

        }
    );
};


// ==========================================
// DELETE BILL
// ==========================================

const deleteBill = (req, res) => {

    const { id } = req.params;

    const sql = `
        DELETE FROM billing
        WHERE id = ?
    `;

    db.query(sql, [id], (err, result) => {

        if (err) {
            console.error("Delete bill error:", err);

            return res.status(500).json({
                success: false,
                message: "Failed to delete bill",
                error: err.message
            });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: "Bill not found"
            });
        }

        res.status(200).json({
            success: true,
            message: "Bill deleted successfully"
        });

    });
};


// ==========================================
// EXPORT
// ==========================================

module.exports = {
    createBill,
    getBills,
    getBillById,
    getPatientBills,
    updateBill,
    updatePaymentStatus,
    deleteBill
};