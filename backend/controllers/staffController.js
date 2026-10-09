const db = require("../config/db");

// ==========================================
// CREATE STAFF
// ==========================================

const createStaff = (req, res) => {

    const {
        user_id,
        designation,
        department_id,
        joining_date,
        salary
    } = req.body;

    if (!user_id || !designation) {
        return res.status(400).json({
            success: false,
            message: "User ID and designation are required"
        });
    }

    // Check user exists
    const userSql = `
        SELECT id, name, email, role
        FROM users
        WHERE id = ?
    `;

    db.query(userSql, [user_id], (err, userResults) => {

        if (err) {
            console.error("User check error:", err);

            return res.status(500).json({
                success: false,
                message: "Database error while checking user",
                error: err.message
            });
        }

        if (userResults.length === 0) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        // Check department if provided
        if (department_id) {

            const departmentSql = `
                SELECT id, name
                FROM departments
                WHERE id = ?
            `;

            db.query(
                departmentSql,
                [department_id],
                (err, departmentResults) => {

                    if (err) {
                        console.error(
                            "Department check error:",
                            err
                        );

                        return res.status(500).json({
                            success: false,
                            message: "Database error while checking department",
                            error: err.message
                        });
                    }

                    if (departmentResults.length === 0) {
                        return res.status(404).json({
                            success: false,
                            message: "Department not found"
                        });
                    }

                    insertStaff();

                }
            );

        } else {
            insertStaff();
        }


        // ==========================================
        // INSERT STAFF
        // ==========================================

        function insertStaff() {

            const sql = `
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
                sql,
                [
                    user_id,
                    designation,
                    department_id || null,
                    joining_date || null,
                    salary || null
                ],
                (err, result) => {

                    if (err) {
                        console.error(
                            "Create staff error:",
                            err
                        );

                        return res.status(500).json({
                            success: false,
                            message: "Failed to create staff",
                            error: err.message
                        });
                    }

                    res.status(201).json({
                        success: true,
                        message: "Staff created successfully",
                        staffId: result.insertId
                    });

                }
            );
        }

    });
};


// ==========================================
// GET ALL STAFF
// ==========================================

const getStaff = (req, res) => {

    const sql = `
        SELECT
            s.id,
            s.user_id,
            u.name,
            u.email,
            u.role,
            s.designation,
            s.department_id,
            d.name AS department_name,
            s.joining_date,
            s.salary,
            s.created_at

        FROM staff s

        INNER JOIN users u
            ON s.user_id = u.id

        LEFT JOIN departments d
            ON s.department_id = d.id

        ORDER BY s.id DESC
    `;

    db.query(sql, (err, results) => {

        if (err) {
            console.error("Get staff error:", err);

            return res.status(500).json({
                success: false,
                message: "Failed to fetch staff",
                error: err.message
            });
        }

        res.status(200).json({
            success: true,
            count: results.length,
            staff: results
        });

    });
};


// ==========================================
// GET STAFF BY ID
// ==========================================

const getStaffById = (req, res) => {

    const { id } = req.params;

    const sql = `
        SELECT
            s.id,
            s.user_id,
            u.name,
            u.email,
            u.role,
            s.designation,
            s.department_id,
            d.name AS department_name,
            s.joining_date,
            s.salary,
            s.created_at

        FROM staff s

        INNER JOIN users u
            ON s.user_id = u.id

        LEFT JOIN departments d
            ON s.department_id = d.id

        WHERE s.id = ?
    `;

    db.query(sql, [id], (err, results) => {

        if (err) {
            console.error("Get staff error:", err);

            return res.status(500).json({
                success: false,
                message: "Failed to fetch staff",
                error: err.message
            });
        }

        if (results.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Staff member not found"
            });
        }

        res.status(200).json({
            success: true,
            staff: results[0]
        });

    });
};


// ==========================================
// GET STAFF BY DEPARTMENT
// ==========================================

const getStaffByDepartment = (req, res) => {

    const { departmentId } = req.params;

    const sql = `
        SELECT
            s.id,
            s.user_id,
            u.name,
            u.email,
            u.role,
            s.designation,
            s.department_id,
            d.name AS department_name,
            s.joining_date,
            s.salary,
            s.created_at

        FROM staff s

        INNER JOIN users u
            ON s.user_id = u.id

        LEFT JOIN departments d
            ON s.department_id = d.id

        WHERE s.department_id = ?

        ORDER BY s.id DESC
    `;

    db.query(
        sql,
        [departmentId],
        (err, results) => {

            if (err) {
                console.error(
                    "Get department staff error:",
                    err
                );

                return res.status(500).json({
                    success: false,
                    message: "Failed to fetch department staff",
                    error: err.message
                });
            }

            res.status(200).json({
                success: true,
                count: results.length,
                staff: results
            });

        }
    );
};


// ==========================================
// UPDATE STAFF
// ==========================================

const updateStaff = (req, res) => {

    const { id } = req.params;

    const {
        designation,
        department_id,
        joining_date,
        salary
    } = req.body;

    if (!designation) {
        return res.status(400).json({
            success: false,
            message: "Designation is required"
        });
    }

    // Check department if provided
    if (department_id) {

        const departmentSql = `
            SELECT id
            FROM departments
            WHERE id = ?
        `;

        db.query(
            departmentSql,
            [department_id],
            (err, results) => {

                if (err) {
                    console.error(
                        "Department check error:",
                        err
                    );

                    return res.status(500).json({
                        success: false,
                        message: "Database error",
                        error: err.message
                    });
                }

                if (results.length === 0) {
                    return res.status(404).json({
                        success: false,
                        message: "Department not found"
                    });
                }

                performUpdate();

            }
        );

    } else {
        performUpdate();
    }


    function performUpdate() {

        const sql = `
            UPDATE staff
            SET
                designation = ?,
                department_id = ?,
                joining_date = ?,
                salary = ?
            WHERE id = ?
        `;

        db.query(
            sql,
            [
                designation,
                department_id || null,
                joining_date || null,
                salary || null,
                id
            ],
            (err, result) => {

                if (err) {
                    console.error(
                        "Update staff error:",
                        err
                    );

                    return res.status(500).json({
                        success: false,
                        message: "Failed to update staff",
                        error: err.message
                    });
                }

                if (result.affectedRows === 0) {
                    return res.status(404).json({
                        success: false,
                        message: "Staff member not found"
                    });
                }

                res.status(200).json({
                    success: true,
                    message: "Staff updated successfully"
                });

            }
        );

    }
};


// ==========================================
// DELETE STAFF
// ==========================================

const deleteStaff = (req, res) => {

    const { id } = req.params;

    const sql = `
        DELETE FROM staff
        WHERE id = ?
    `;

    db.query(sql, [id], (err, result) => {

        if (err) {
            console.error("Delete staff error:", err);

            return res.status(500).json({
                success: false,
                message: "Failed to delete staff",
                error: err.message
            });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: "Staff member not found"
            });
        }

        res.status(200).json({
            success: true,
            message: "Staff deleted successfully"
        });

    });
};


// ==========================================
// EXPORT
// ==========================================

module.exports = {
    createStaff,
    getStaff,
    getStaffById,
    getStaffByDepartment,
    updateStaff,
    deleteStaff
};