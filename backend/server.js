const express = require("express");
const cors = require("cors");
const bcrypt = require("bcrypt"); // Import bcrypt for password hashing
const oracledb = require("oracledb");
const getConnection = require("./db");
const path = require("path");
const { calculateGrade, validateAttendance, calculatePerformance, calculateAverage } = require("../javascript/performance");

const app = express();
app.use(cors());
app.use(express.json());

// Serve login.html explicitly at the root
app.get("/", (req, res) => {
    res.sendFile(path.resolve(__dirname, "../frontend/login.html"));
});
app.get("/login.html", (req, res) => {
    res.sendFile(path.resolve(__dirname, "../frontend/login.html"));
});

// POST /login - User authentication
app.post("/login", async (req, res) => {
    let connection;
    try {
        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({ message: "Please provide both username and password" });
        }

        connection = await getConnection();

        // Query the login_users table for the user
        const result = await connection.execute(
            "SELECT * FROM login_users WHERE USERNAME = :username",
            { username },
            { autoCommit: true, outFormat: oracledb.OUT_FORMAT_OBJECT }
        );

        if (result.rows.length === 0) {
            return res.status(401).json({ message: "Invalid credentials" });
        }

        const user = result.rows[0];
        const passwordHash = user.PASSWORD_HASH;
        
        // Use bcrypt to verify the password
        const isValidPassword = await bcrypt.compare(password, passwordHash);

        if (!isValidPassword) {
            return res.status(401).json({ message: "Invalid credentials" });
        }

        res.json({ success: true, message: "Login successful", isAdmin: user.ADMIN === 1 });

    } catch (error) {
        console.error("Error during login:", error);
        res.status(500).json({ 
            message: "Error processing request",
            errormessage: error.message || String(error)
        });
    } finally {
        if (connection) {
            try { await connection.close(); } catch(err) { console.error("Error closing:", err); }
        }
    }
});

// POST /register - User registration
app.post("/register", async (req, res) => {
    let connection;
    try {
        const { username, password, isAdmin } = req.body;

        if (!username || !password) {
            return res.status(400).json({ message: "Please provide both username and password" });
        }

        if (password.length < 6) {
            return res.status(400).json({ message: "Password must be at least 6 characters long" });
        }

        connection = await getConnection();

        // Check if user already exists
        const checkResult = await connection.execute(
            "SELECT * FROM login_users WHERE USERNAME = :username",
            { username },
            { autoCommit: true }
        );

        if (checkResult.rows.length > 0) {
            return res.status(409).json({ message: "User already exists with this username" });
        }

        // Hash the password using bcrypt
        const saltRounds = 10;
        const passwordHash = await bcrypt.hash(password, saltRounds);

        // Insert new user into login_users table, setting ADMIN flag if requested
        const adminValue = isAdmin ? 1 : 0;
        await connection.execute(
            "INSERT INTO login_users (USERNAME, PASSWORD_HASH, ADMIN) VALUES (:username, :password_hash, :admin)",
            { username: username, password_hash: passwordHash, admin: adminValue },
            { autoCommit: true }
        );

        res.json({ success: true, message: "User registered successfully", isAdmin: adminValue === 1 });

    } catch (error) {
        console.error("Error during registration:", error);
        res.status(500).json({ 
            message: "Error registering user",
            errormessage: error.message || String(error)
        });
    } finally {
        if (connection) {
            try { await connection.close(); } catch(err) { console.error("Error closing:", err); }
        }
    }
});

// POST /student - Add a new subject record for a student; creates the student row if they don't exist yet
app.post("/student", async (req, res) => {
    let connection;
    try {
        const { name, subject, grades, attendance } = req.body;

        if (!subject) {
            return res.status(400).json({ message: "Please fill in the subject field." });
        }

        // Calculate subject-level results — these functions handle their own input validation
        const grade = calculateGrade(grades);
        const attendanceStatus = validateAttendance(attendance);
        const result = calculatePerformance(grades, attendance);

        if (result === "Invalid Input") {
            return res.status(400).json({ message: "Invalid grades or attendance values." });
        }

        connection = await getConnection();

        // --- 1. Upsert the student row in the students table ---
        const studentCheck = await connection.execute(
            "SELECT ID FROM students WHERE NAME = :name",
            { name },
            { outFormat: oracledb.OUT_FORMAT_OBJECT }
        );

        let studentId;
        if (studentCheck.rows.length === 0) {
            // New student: first subject is the only data point, so the average is just that value
            const gpa = calculateAverage([grades], true);            // float for GPA column
            const overallAttendance = calculateAverage([attendance], false); // integer for OVERALL_ATTENDANCE column

            const insertStudent = await connection.execute(
                `INSERT INTO students (NAME, GPA, OVERALL_ATTENDANCE)
                 VALUES (:name, :gpa, :overall_attendance)
                 RETURNING ID INTO :id`,
                {
                    name,
                    gpa,
                    overall_attendance: overallAttendance,
                    id: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER }
                },
                { autoCommit: false }
            );
            studentId = insertStudent.outBinds.id[0];
        } else {
            // Existing student: check for duplicate subject before going further
            studentId = studentCheck.rows[0].ID;

            const subjectCheck = await connection.execute(
                "SELECT ID FROM subjects WHERE STUDENT_ID = :studentId AND SUBJECT = :subject",
                { studentId, subject },
                { outFormat: oracledb.OUT_FORMAT_OBJECT }
            );

            if (subjectCheck.rows.length > 0) {
                return res.status(409).json({
                    message: `Subject "${subject}" is already recorded for student "${name}".`
                });
            }

            const existingSubjects = await connection.execute(
                "SELECT GRADES, ATTENDANCE FROM subjects WHERE STUDENT_ID = :studentId",
                { studentId },
                { outFormat: oracledb.OUT_FORMAT_OBJECT }
            );

            const allGrades     = [...existingSubjects.rows.map(r => r.GRADES), grades];
            const allAttendance = [...existingSubjects.rows.map(r => r.ATTENDANCE), attendance];

            const gpa               = calculateAverage(allGrades, true);      // float for GPA column
            const overallAttendance = calculateAverage(allAttendance, false);  // integer for OVERALL_ATTENDANCE column

            await connection.execute(
                "UPDATE students SET GPA = :gpa, OVERALL_ATTENDANCE = :overall_attendance WHERE ID = :studentId",
                { gpa, overall_attendance: overallAttendance, studentId },
                { autoCommit: false }
            );
        }

        // --- 2. Insert the subject row ---
        await connection.execute(
            `INSERT INTO subjects (STUDENT_ID, SUBJECT, GRADES, GRADE, ATTENDANCE, RESULT)
             VALUES (:studentId, :subject, :grades, :grade, :attendance, :result)`,
            { studentId, subject, grades, grade, attendance, result },
            { autoCommit: false }
        );

        // Commit both operations together
        await connection.commit();

        res.json({ message: "Student subject added successfully", grades, result });

    } catch (error) {
        console.error(error);

        if (connection) {
            try { await connection.rollback(); } catch(err) { console.error("Rollback error:", err); }
        }

        if (error.message && error.message.includes('session')) {
            return res.status(500).json({ 
                message: "Database session is locked",
                errormessage: "Please refresh and retry."
            });
        }

        res.status(500).json({
            message: "Error adding student subject",
            errormessage: error.message || String(error)
        });
    } finally {
        if (connection) {
            try { await connection.close(); } catch(err) { console.error("Error closing:", err); }
        }
    }
});

// GET /students - Return all students with their GPA and overall attendance, sorted by name
app.get("/students", async (req, res) => {
    let connection;
    try {
        connection = await getConnection();

        const result = await connection.execute(
            "SELECT ID, NAME, GPA, OVERALL_ATTENDANCE FROM students ORDER BY NAME",
            {},
            { autoCommit: true, outFormat: oracledb.OUT_FORMAT_OBJECT }
        );

        res.json(result.rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error fetching students", errormessage: error.message || String(error) });
    } finally {
        if (connection) {
            try { await connection.close(); } catch(err) { console.error("Error closing:", err); }
        }
    }
});

// GET /toppers - Return students with a GPA >= 90 and subject records where the grade is >= 90
app.get("/toppers", async (req, res) => {
    let connection;
    try {
        connection = await getConnection();

        const gpaResult = await connection.execute(
            `SELECT NAME, GPA FROM students WHERE GPA >= 90 ORDER BY GPA DESC`,
            {},
            { autoCommit: true, outFormat: oracledb.OUT_FORMAT_OBJECT }
        );

        const subjectResult = await connection.execute(
            `SELECT st.NAME, sub.SUBJECT, sub.GRADES
             FROM students st
             JOIN subjects sub ON st.ID = sub.STUDENT_ID
             WHERE sub.GRADES >= 90
             ORDER BY sub.GRADES DESC, st.NAME`,
            {},
            { autoCommit: true, outFormat: oracledb.OUT_FORMAT_OBJECT }
        );

        res.json({ gpaToppers: gpaResult.rows, subjectToppers: subjectResult.rows });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error fetching toppers", errormessage: error.message || String(error) });
    } finally {
        if (connection) {
            try { await connection.close(); } catch(err) { console.error("Error closing:", err); }
        }
    }
});

// GET /analytics - Return overall pass/fail counts, fail reason breakdown, and pass rates grouped by subject and student
app.get("/analytics", async (req, res) => {
    let connection;
    try {
        connection = await getConnection();

        // Overall pass/fail counts
        const overallResult = await connection.execute(
            `SELECT
                COUNT(*) AS TOTAL,
                SUM(CASE WHEN RESULT LIKE 'Pass%' THEN 1 ELSE 0 END) AS TOTAL_PASS,
                SUM(CASE WHEN RESULT LIKE 'Fail%' THEN 1 ELSE 0 END) AS TOTAL_FAIL
             FROM subjects`,
            {},
            { outFormat: oracledb.OUT_FORMAT_OBJECT }
        );

        const { TOTAL, TOTAL_PASS, TOTAL_FAIL } = overallResult.rows[0];
        const passRate = TOTAL > 0 ? parseFloat(((TOTAL_PASS / TOTAL) * 100).toFixed(1)) : 0;

        // Fail reason breakdown
        const failResult = await connection.execute(
            `SELECT
                SUM(CASE WHEN RESULT = 'Fail (Low Grades)' THEN 1 ELSE 0 END)                        AS FAIL_LOW_GRADES,
                SUM(CASE WHEN RESULT = 'Fail (Low Attendance)' THEN 1 ELSE 0 END)                    AS FAIL_LOW_ATTENDANCE,
                SUM(CASE WHEN RESULT = 'Fail (Low Grades and Low Attendance)' THEN 1 ELSE 0 END)     AS FAIL_BOTH
             FROM subjects`,
            {},
            { outFormat: oracledb.OUT_FORMAT_OBJECT }
        );

        // Per-subject pass rates
        const subjectResult = await connection.execute(
            `SELECT
                SUBJECT,
                COUNT(*) AS TOTAL,
                SUM(CASE WHEN RESULT LIKE 'Pass%' THEN 1 ELSE 0 END) AS PASS_COUNT
             FROM subjects
             GROUP BY SUBJECT
             ORDER BY SUBJECT`,
            {},
            { outFormat: oracledb.OUT_FORMAT_OBJECT }
        );

        const subjectRates = subjectResult.rows.map(r => ({
            subject:   r.SUBJECT,
            total:     r.TOTAL,
            passed:    r.PASS_COUNT,
            failed:    r.TOTAL - r.PASS_COUNT,
            pass_rate: r.TOTAL > 0 ? parseFloat(((r.PASS_COUNT / r.TOTAL) * 100).toFixed(1)) : 0
        }));

        // Per-student pass rates
        const studentResult = await connection.execute(
            `SELECT
                st.NAME,
                COUNT(*) AS TOTAL,
                SUM(CASE WHEN sub.RESULT LIKE 'Pass%' THEN 1 ELSE 0 END) AS PASS_COUNT
             FROM students st
             JOIN subjects sub ON st.ID = sub.STUDENT_ID
             GROUP BY st.NAME
             ORDER BY st.NAME`,
            {},
            { outFormat: oracledb.OUT_FORMAT_OBJECT }
        );

        const studentRates = studentResult.rows.map(r => ({
            name:      r.NAME,
            total:     r.TOTAL,
            passed:    r.PASS_COUNT,
            failed:    r.TOTAL - r.PASS_COUNT,
            pass_rate: r.TOTAL > 0 ? parseFloat(((r.PASS_COUNT / r.TOTAL) * 100).toFixed(1)) : 0
        }));

        res.json({
            overall: {
                total:      TOTAL,
                passed:     TOTAL_PASS,
                failed:     TOTAL_FAIL,
                pass_rate:  passRate
            },
            fail_reasons: failResult.rows[0],
            by_subject:   subjectRates,
            by_student:   studentRates
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error fetching analytics", errormessage: error.message || String(error) });
    } finally {
        if (connection) {
            try { await connection.close(); } catch(err) { console.error("Error closing:", err); }
        }
    }
});

// GET /low-attendance - Return all students whose overall attendance is below 75%
app.get("/low-attendance", async (req, res) => {
    let connection;
    try {
        connection = await getConnection();

        const result = await connection.execute(
            `SELECT NAME, OVERALL_ATTENDANCE FROM students WHERE OVERALL_ATTENDANCE < 75 ORDER BY OVERALL_ATTENDANCE`,
            {},
            { autoCommit: true, outFormat: oracledb.OUT_FORMAT_OBJECT }
        );

        res.json(result.rows);

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error fetching low attendance students", errormessage: error.message || String(error) });
    } finally {
        if (connection) {
            try { await connection.close(); } catch(err) { console.error("Error closing:", err); }
        }
    }
});

// GET /search?name=... - Search for students by name (case-insensitive partial match)
app.get("/search", async (req, res) => {
    let connection;
    try {
        const { name } = req.query;

        if (!name) {
            return res.status(400).json({ message: "Name query parameter is required." });
        }

        connection = await getConnection();

        const result = await connection.execute(
            "SELECT ID, NAME, GPA, OVERALL_ATTENDANCE FROM students WHERE UPPER(NAME) LIKE UPPER(:name) ORDER BY NAME",
            { name: `%${name}%` },
            { autoCommit: true, outFormat: oracledb.OUT_FORMAT_OBJECT }
        );

        res.json(result.rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error searching students", errormessage: error.message || String(error) });
    } finally {
        if (connection) {
            try { await connection.close(); } catch(err) { console.error("Error closing:", err); }
        }
    }
});

// GET /student/:id - Return a single student's record by numeric ID
app.get("/student/:id", async (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) return res.status(400).json({ message: "Invalid student ID." });

    let connection;
    try {
        connection = await getConnection();

        const result = await connection.execute(
            "SELECT ID, NAME, GPA, OVERALL_ATTENDANCE FROM students WHERE ID = :id",
            { id },
            { autoCommit: true, outFormat: oracledb.OUT_FORMAT_OBJECT }
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ message: "Student not found!" });
        }

        res.json(result.rows[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error fetching student", errormessage: error.message || String(error) });
    } finally {
        if (connection) {
            try { await connection.close(); } catch(err) { console.error("Error closing:", err); }
        }
    }
});

// GET /student/:name/subjects - Return all subject records for a student looked up by name
app.get("/student/:name/subjects", async (req, res) => {
    let connection;
    try {
        const { name } = req.params;

        connection = await getConnection();

        const studentCheck = await connection.execute(
            "SELECT ID FROM students WHERE NAME = :name",
            { name },
            { outFormat: oracledb.OUT_FORMAT_OBJECT }
        );

        if (studentCheck.rows.length === 0) {
            return res.status(404).json({ message: "Student not found!" });
        }

        const studentId = studentCheck.rows[0].ID;

        const result = await connection.execute(
            `SELECT SUBJECT, GRADES, GRADE, ATTENDANCE, RESULT
             FROM subjects WHERE STUDENT_ID = :studentId ORDER BY ID`,
            { studentId },
            { autoCommit: true, outFormat: oracledb.OUT_FORMAT_OBJECT }
        );

        res.json(result.rows);

    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Error fetching subjects",
            errormessage: error.message || String(error)
        });
    } finally {
        if (connection) {
            try { await connection.close(); } catch(err) { console.error("Error closing:", err); }
        }
    }
});

// GET /student/:name/gpa - Return a student's GPA and overall attendance by name
app.get("/student/:name/gpa", async (req, res) => {
    let connection;
    try {
        const { name } = req.params;

        connection = await getConnection();

        const result = await connection.execute(
            "SELECT GPA, OVERALL_ATTENDANCE FROM students WHERE NAME = :name",
            { name },
            { autoCommit: true, outFormat: oracledb.OUT_FORMAT_OBJECT }
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ message: "Student not found!" });
        }

        res.json(result.rows[0]);

    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Error fetching GPA",
            errormessage: error.message || String(error)
        });
    } finally {
        if (connection) {
            try { await connection.close(); } catch(err) { console.error("Error closing:", err); }
        }
    }
});

// DELETE /student/:id - Delete a student and all their subjects and login account by numeric ID
app.delete("/student/:id", async (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) return res.status(400).json({ message: "Invalid student ID." });

    let connection;
    try {
        connection = await getConnection();

        const check = await connection.execute(
            "SELECT NAME FROM students WHERE ID = :id",
            { id },
            { autoCommit: true, outFormat: oracledb.OUT_FORMAT_OBJECT }
        );

        if (check.rows.length === 0) {
            return res.status(404).json({ message: "Student not found!" });
        }

        const name = check.rows[0].NAME;

        // Delete subjects first to satisfy the foreign key constraint, then student and login account
        await connection.execute("DELETE FROM subjects WHERE STUDENT_ID = :id", { id }, { autoCommit: false });
        await connection.execute("DELETE FROM students WHERE ID = :id", { id }, { autoCommit: false });
        await connection.execute("DELETE FROM login_users WHERE USERNAME = :name", { name }, { autoCommit: false });
        await connection.commit();

        res.json({ message: `"${name}" deleted successfully!` });
    } catch (error) {
        console.error(error);
        if (connection) {
            try { await connection.rollback(); } catch(err) { console.error("Rollback error:", err); }
        }
        res.status(500).json({ message: "Error deleting student", errormessage: error.message || String(error) });
    } finally {
        if (connection) {
            try { await connection.close(); } catch (err) { console.error("Error closing:", err); }
        }
    }
});

// PUT /student/:id - Update grades and attendance for an existing subject, then recalculate GPA and overall attendance
app.put("/student/:id", async (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) return res.status(400).json({ message: "Invalid student ID." });

    const { subject, grades, attendance } = req.body;
    if (!subject) {
        return res.status(400).json({ message: "subject is required." });
    }

    let connection;
    try {
        connection = await getConnection();

        const studentCheck = await connection.execute(
            "SELECT 1 FROM students WHERE ID = :id",
            { id },
            { autoCommit: true }
        );
        if (studentCheck.rows.length === 0) {
            return res.status(404).json({ message: "Student not found!" });
        }

        const subjectCheck = await connection.execute(
            "SELECT ID FROM subjects WHERE STUDENT_ID = :id AND SUBJECT = :subject",
            { id, subject },
            { outFormat: oracledb.OUT_FORMAT_OBJECT }
        );
        if (subjectCheck.rows.length === 0) {
            return res.status(404).json({ message: `Subject "${subject}" not found for this student.` });
        }

        const grade  = calculateGrade(Number(grades));
        const result = calculatePerformance(Number(grades), Number(attendance));

        if (result === "Invalid Input") {
            return res.status(400).json({ message: "Invalid grades or attendance values." });
        }

        // Update the subject row
        await connection.execute(
            `UPDATE subjects SET GRADES = :grades, GRADE = :grade, ATTENDANCE = :attendance, RESULT = :result
             WHERE STUDENT_ID = :id AND SUBJECT = :subject`,
            { grades: Number(grades), grade, attendance: Number(attendance), result, id, subject },
            { autoCommit: false }
        );

        // Re-aggregate GPA and overall attendance across all subjects for this student
        // The SELECT runs in the same transaction so it sees the updated subject row
        const allSubjects = await connection.execute(
            "SELECT GRADES, ATTENDANCE FROM subjects WHERE STUDENT_ID = :id",
            { id },
            { outFormat: oracledb.OUT_FORMAT_OBJECT }
        );

        const allGrades     = allSubjects.rows.map(r => r.GRADES);
        const allAttendance = allSubjects.rows.map(r => r.ATTENDANCE);
        const gpa               = calculateAverage(allGrades, true);
        const overallAttendance = calculateAverage(allAttendance, false);

        await connection.execute(
            "UPDATE students SET GPA = :gpa, OVERALL_ATTENDANCE = :overall_attendance WHERE ID = :id",
            { gpa, overall_attendance: overallAttendance, id },
            { autoCommit: false }
        );

        await connection.commit();

        res.json({ message: "Subject updated successfully!", subject, grades: Number(grades), grade, attendance: Number(attendance), result, gpa, overall_attendance: overallAttendance });
    } catch (error) {
        console.error(error);
        if (connection) {
            try { await connection.rollback(); } catch(err) { console.error("Rollback error:", err); }
        }
        res.status(500).json({ message: "Error updating subject", errormessage: error.message || String(error) });
    } finally {
        if (connection) {
            try { await connection.close(); } catch(err) { console.error("Error closing:", err); }
        }
    }
});

// POST /api/performance - Calculate and return a performance result from a grade and attendance value
app.post("/api/performance", async (req, res) => {
    try {
        const { grade, attendance } = req.body;
        
        const result = calculatePerformance(grade, attendance);
        
        res.json({ performance: result });
    } catch (error) {
        console.error("Error calculating performance:", error);
        res.status(500).json({ error: "Failed to calculate performance" });
    }
});

// POST /calculate - Add a student with grades and attendance and insert them into the database
app.post("/calculate", async (req, res) => {
    let connection;
    try {
        const { name, grades, attendance } = req.body;
        
        if (!name) {
            return res.status(400).json({ message: "Please fill in the name field." });
        }

        const grade = calculateGrade(grades);
        const attendanceStatus = validateAttendance(attendance);
        const result = calculatePerformance(grades, attendance);

        if (result === "Invalid Input") {
            return res.status(400).json({ message: "Invalid grades or attendance values." });
        }
        
        connection = await getConnection();
        
        // INSERT new student
        await connection.execute(
            "INSERT INTO students (NAME,GRADES,ATTENDANCE,GRADE,RESULT) VALUES (:name, :grades, :attendance, :grade, :result)",
            { name, grades, attendance, grade, result },
            { autoCommit: true }
        );
        
        res.json({ message: "Student added successfully", result });
    } catch (error) {
        console.error(error);
        
        if (error.code === 'ORA-01403') {
            return res.status(409).json({ message: "Student already exists!" });
        }
        
        if (error.message && error.message.includes('session')) {
            return res.status(500).json({ 
                message: "Database session is locked",
                errormessage: "Please refresh and retry."
            });
        }
        
        res.status(500).json({
            message: "Error adding student",
            errormessage: error.message || String(error)
        });
    } finally {
        if (connection) {
            try { await connection.close(); } catch(err) { console.error("Error closing connection:", err); }
        }
    }
});

// Serve static files AFTER all API routes to prevent middleware from
// intercepting POST requests and returning 405 Method Not Allowed
app.use('/frontend', express.static(path.resolve(__dirname, '../frontend')));
app.use(express.static(path.resolve(__dirname, '../frontend')));

if (require.main === module) {
    app.listen(3000, () => {
        console.log("Server running on port 3000");
        console.log("API URL : http://localhost:3000/");
    });
}

module.exports = app;