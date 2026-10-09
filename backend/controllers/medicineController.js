const db = require("../config/db");

// ==========================================
// CREATE MEDICINE
// ==========================================

const createMedicine = (req, res) => {

    const {
        name,
        category,
        manufacturer,
        quantity,
        price,
        expiry_date
    } = req.body;

    // Validation
    if (!name || price === undefined || price === null) {
        return res.status(400).json({
            success: false,
            message: "Medicine name and price are required"
        });
    }

    const sql = `
        INSERT INTO medicines
        (
            name,
            category,
            manufacturer,
            quantity,
            price,
            expiry_date
        )
        VALUES (?, ?, ?, ?, ?, ?)
    `;

    db.query(
        sql,
        [
            name,
            category || null,
            manufacturer || null,
            quantity || 0,
            price,
            expiry_date || null
        ],
        (err, result) => {

            if (err) {
                console.error("Create medicine error:", err);

                return res.status(500).json({
                    success: false,
                    message: "Failed to create medicine",
                    error: err.message
                });
            }

            res.status(201).json({
                success: true,
                message: "Medicine created successfully",
                medicineId: result.insertId
            });

        }
    );
};


// ==========================================
// GET ALL MEDICINES
// ==========================================

const getMedicines = (req, res) => {

    const sql = `
        SELECT
            id,
            name,
            category,
            manufacturer,
            quantity,
            price,
            expiry_date,
            created_at
        FROM medicines
        ORDER BY id DESC
    `;

    db.query(sql, (err, results) => {

        if (err) {
            console.error("Get medicines error:", err);

            return res.status(500).json({
                success: false,
                message: "Failed to fetch medicines",
                error: err.message
            });
        }

        res.status(200).json({
            success: true,
            count: results.length,
            medicines: results
        });

    });
};


// ==========================================
// GET MEDICINE BY ID
// ==========================================

const getMedicineById = (req, res) => {

    const { id } = req.params;

    const sql = `
        SELECT
            id,
            name,
            category,
            manufacturer,
            quantity,
            price,
            expiry_date,
            created_at
        FROM medicines
        WHERE id = ?
    `;

    db.query(sql, [id], (err, results) => {

        if (err) {
            console.error("Get medicine error:", err);

            return res.status(500).json({
                success: false,
                message: "Failed to fetch medicine",
                error: err.message
            });
        }

        if (results.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Medicine not found"
            });
        }

        res.status(200).json({
            success: true,
            medicine: results[0]
        });

    });
};


// ==========================================
// UPDATE MEDICINE
// ==========================================

const updateMedicine = (req, res) => {

    const { id } = req.params;

    const {
        name,
        category,
        manufacturer,
        quantity,
        price,
        expiry_date
    } = req.body;

    if (!name || price === undefined || price === null) {
        return res.status(400).json({
            success: false,
            message: "Medicine name and price are required"
        });
    }

    const sql = `
        UPDATE medicines
        SET
            name = ?,
            category = ?,
            manufacturer = ?,
            quantity = ?,
            price = ?,
            expiry_date = ?
        WHERE id = ?
    `;

    db.query(
        sql,
        [
            name,
            category || null,
            manufacturer || null,
            quantity || 0,
            price,
            expiry_date || null,
            id
        ],
        (err, result) => {

            if (err) {
                console.error("Update medicine error:", err);

                return res.status(500).json({
                    success: false,
                    message: "Failed to update medicine",
                    error: err.message
                });
            }

            if (result.affectedRows === 0) {
                return res.status(404).json({
                    success: false,
                    message: "Medicine not found"
                });
            }

            res.status(200).json({
                success: true,
                message: "Medicine updated successfully"
            });

        }
    );
};


// ==========================================
// DELETE MEDICINE
// ==========================================

const deleteMedicine = (req, res) => {

    const { id } = req.params;

    const sql = `
        DELETE FROM medicines
        WHERE id = ?
    `;

    db.query(sql, [id], (err, result) => {

        if (err) {
            console.error("Delete medicine error:", err);

            return res.status(500).json({
                success: false,
                message: "Failed to delete medicine",
                error: err.message
            });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: "Medicine not found"
            });
        }

        res.status(200).json({
            success: true,
            message: "Medicine deleted successfully"
        });

    });
};


// ==========================================
// EXPORT
// ==========================================

module.exports = {
    createMedicine,
    getMedicines,
    getMedicineById,
    updateMedicine,
    deleteMedicine
};