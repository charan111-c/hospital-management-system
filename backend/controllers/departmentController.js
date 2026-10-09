const db = require("../config/db");

// ==========================================
// CREATE DEPARTMENT
// ==========================================

const createDepartment = (req, res) => {

    const { name, description } = req.body;

    if (!name) {
        return res.status(400).json({
            success: false,
            message: "Department name is required"
        });
    }

    const sql = `
        INSERT INTO departments
        (name, description)
        VALUES (?, ?)
    `;

    db.query(
        sql,
        [name, description || null],
        (err, result) => {

            if (err) {

                if (err.code === "ER_DUP_ENTRY") {
                    return res.status(409).json({
                        success: false,
                        message: "Department already exists"
                    });
                }

                console.error("Create department error:", err);

                return res.status(500).json({
                    success: false,
                    message: "Failed to create department"
                });
            }

            res.status(201).json({
                success: true,
                message: "Department created successfully",
                departmentId: result.insertId
            });
        }
    );
};


// ==========================================
// GET ALL DEPARTMENTS
// ==========================================

const getDepartments = (req, res) => {

    const sql = `
        SELECT
            id,
            name,
            description,
            created_at
        FROM departments
        ORDER BY id DESC
    `;

    db.query(sql, (err, results) => {

        if (err) {
            console.error("Get departments error:", err);

            return res.status(500).json({
                success: false,
                message: "Failed to fetch departments"
            });
        }

        res.status(200).json({
            success: true,
            count: results.length,
            departments: results
        });
    });
};


// ==========================================
// GET DEPARTMENT BY ID
// ==========================================

const getDepartmentById = (req, res) => {

    const { id } = req.params;

    const sql = `
        SELECT
            id,
            name,
            description,
            created_at
        FROM departments
        WHERE id = ?
    `;

    db.query(sql, [id], (err, results) => {

        if (err) {
            console.error("Get department error:", err);

            return res.status(500).json({
                success: false,
                message: "Failed to fetch department"
            });
        }

        if (results.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Department not found"
            });
        }

        res.status(200).json({
            success: true,
            department: results[0]
        });
    });
};


// ==========================================
// UPDATE DEPARTMENT
// ==========================================

const updateDepartment = (req, res) => {

    const { id } = req.params;
    const { name, description } = req.body;

    if (!name) {
        return res.status(400).json({
            success: false,
            message: "Department name is required"
        });
    }

    const sql = `
        UPDATE departments
        SET name = ?, description = ?
        WHERE id = ?
    `;

    db.query(
        sql,
        [name, description || null, id],
        (err, result) => {

            if (err) {

                if (err.code === "ER_DUP_ENTRY") {
                    return res.status(409).json({
                        success: false,
                        message: "Department name already exists"
                    });
                }

                console.error("Update department error:", err);

                return res.status(500).json({
                    success: false,
                    message: "Failed to update department"
                });
            }

            if (result.affectedRows === 0) {
                return res.status(404).json({
                    success: false,
                    message: "Department not found"
                });
            }

            res.status(200).json({
                success: true,
                message: "Department updated successfully"
            });
        }
    );
};


// ==========================================
// DELETE DEPARTMENT
// ==========================================

const deleteDepartment = (req, res) => {

    const { id } = req.params;

    const sql = `
        DELETE FROM departments
        WHERE id = ?
    `;

    db.query(sql, [id], (err, result) => {

        if (err) {
            console.error("Delete department error:", err);

            return res.status(500).json({
                success: false,
                message: "Failed to delete department"
            });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: "Department not found"
            });
        }

        res.status(200).json({
            success: true,
            message: "Department deleted successfully"
        });
    });
};


module.exports = {
    createDepartment,
    getDepartments,
    getDepartmentById,
    updateDepartment,
    deleteDepartment
};