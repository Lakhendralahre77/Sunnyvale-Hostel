const express = require("express");
const cors = require("cors");
//const mysql = require("mysql");
const db = require("./db");

const app = express();

// middleware
app.use(cors());
app.use(express.json());

// test route
app.get("/", (req, res) => {
    res.send("Backend is running");
});

// ---------------- LOGIN API ----------------

app.post("/api/login", (req, res) => {
    const { username, password } = req.body;

    const sql = `
        SELECT id, role FROM users 
        WHERE username = ? AND password = ?
    `;

    db.query(sql, [username, password], (err, result) => {
        if (err) return res.status(500).json({ message: "DB error" });

        if (result.length === 0) {
            return res.status(401).json({ message: "Invalid credentials" });
        }

        res.json({
            message: "Login successful",
            role: result[0].role
        });
    });
});

// ---------------- STUDENT APIs ----------------
app.post("/api/students", (req, res) => {
    const { name, roll, course } = req.body;

    console.log("POST DATA:", req.body); // 👈 DEBUG

    if (!name || !roll || !course) {
        return res.status(400).json({ message: "All fields required" });
    }

    const sql = "INSERT INTO students (name, roll, course) VALUES (?, ?, ?)";

    db.query(sql, [name, roll, course], (err, result) => {
        if (err) {
            console.error("MySQL error:", err);
            return res.status(500).json({ message: "Database error" });
        }

        res.json({
            message: "Student added",
            id: result.insertId
        });
    });
});

//students
app.get("/api/students", (req, res) => {
    const sql = "SELECT * FROM students";

    db.query(sql, (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ message: "DB error" });
        }

        res.json(results);
    });
});

//rooms available
app.get("/api/rooms/available", (req, res) => {
    const sql = `
        SELECT room_no 
        FROM rooms 
        WHERE occupied < capacity
    `;

    db.query(sql, (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ message: "DB error" });
        }

        res.json(results);
    });
});

//dashboard
app.get("/api/dashboard/stats", (req, res) => {

    const stats = {};

    // 1️⃣ Total students
    const studentCount = "SELECT COUNT(*) AS totalStudents FROM students";

    db.query(studentCount, (err, result) => {
        if (err) return res.status(500).json(err);
        stats.totalStudents = result[0].totalStudents;

        // 2️⃣ Total rooms
        const roomCount = "SELECT COUNT(*) AS totalRooms FROM rooms";

        db.query(roomCount, (err, result) => {
            if (err) return res.status(500).json(err);
            stats.totalRooms = result[0].totalRooms;

            // 3️⃣ Occupied rooms
            const occupiedRooms = `
                SELECT COUNT(*) AS occupiedRooms 
                FROM rooms 
                WHERE occupied >= capacity
            `;

            db.query(occupiedRooms, (err, result) => {
                if (err) return res.status(500).json(err);
                stats.occupiedRooms = result[0].occupiedRooms;

                // 4️⃣ Available rooms
                const availableRooms = `
                    SELECT COUNT(*) AS availableRooms 
                    FROM rooms 
                    WHERE occupied < capacity
                `;

                db.query(availableRooms, (err, result) => {
                    if (err) return res.status(500).json(err);
                    stats.availableRooms = result[0].availableRooms;

                    res.json(stats);
                });
            });
        });
    });
});

// DELETE student
app.delete("/api/students/:id", (req, res) => {
    const studentId = req.params.id;

    // 1️⃣ Find student's room
    const findStudent = `
        SELECT room_no FROM students WHERE id = ?
    `;

    db.query(findStudent, [studentId], (err, result) => {
        if (err) return res.status(500).json({ message: "DB error" });
        if (result.length === 0) {
            return res.status(404).json({ message: "Student not found" });
        }

        const roomNo = result[0].room_no;

        // 2️⃣ Delete student
        const deleteStudent = `
            DELETE FROM students WHERE id = ?
        `;

        db.query(deleteStudent, [studentId], (err) => {
            if (err) return res.status(500).json({ message: "Delete failed" });

            // 3️⃣ If student had a room → update room
            if (roomNo) {
                const updateRoom = `
                    UPDATE rooms
                    SET occupied = occupied - 1,
                        status = IF(occupied - 1 < capacity, 'Available', status)
                    WHERE room_no = ?
                `;

                db.query(updateRoom, [roomNo], (err) => {
                    if (err) return res.status(500).json({ message: "Room update failed" });

                    return res.json({
                        message: "Student deleted & room de-allocated"
                    });
                });
            } else {
                // Student had no room
                return res.json({
                    message: "Student deleted"
                });
            }
        });
    });
});

// UPDATE student
app.put("/api/students/:id", (req, res) => {
    const studentId = req.params.id;
    const { name, roll, course } = req.body;

    const sql = `
        UPDATE students
        SET name = ?, roll = ?, course = ?
        WHERE id = ?
    `;

    db.query(sql, [name, roll, course, studentId], (err) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ message: "DB error" });
        }

        res.json({ message: "Student updated" });
    });
});

app.put("/api/students/:id/allot", (req, res) => {
    const studentId = req.params.id;
    const { room_no } = req.body;

    if (!room_no) {
        return res.status(400).json({ message: "Room number required" });
    }

    // 1️⃣ Check if student already has a room
    const checkStudent = "SELECT room_no FROM students WHERE id = ?";
    db.query(checkStudent, [studentId], (err, studentResult) => {
        if (err) return res.status(500).json({ message: "DB error" });

        if (studentResult[0].room_no) {
            return res.status(400).json({
                message: "Student already allotted to a room"
            });
        }

        // 2️⃣ Check room capacity
        const checkRoom = `
            SELECT capacity, occupied 
            FROM rooms 
            WHERE room_no = ?
        `;

        db.query(checkRoom, [room_no], (err, roomResult) => {
            if (err) return res.status(500).json({ message: "DB error" });

            if (roomResult.length === 0) {
                return res.status(404).json({ message: "Room not found" });
            }

            const { capacity, occupied } = roomResult[0];

            if (occupied >= capacity) {
                return res.status(400).json({
                    message: "Room is full"
                });
            }

            // 3️⃣ Allot room to student
            const updateStudent = `
                UPDATE students SET room_no = ? WHERE id = ?
            `;

            db.query(updateStudent, [room_no, studentId], (err) => {
                if (err) return res.status(500).json({ message: "Student update failed" });

                // 4️⃣ Increase occupied count
                const updateRoom = `
                    UPDATE rooms 
                    SET occupied = occupied + 1,
                        status = IF(occupied + 1 >= capacity, 'Occupied', 'Available')
                    WHERE room_no = ?
                `;

                db.query(updateRoom, [room_no], (err) => {
                    if (err) return res.status(500).json({ message: "Room update failed" });

                    res.json({ message: "Room allotted successfully" });
                });
            });
        });
    });
});



// ---------------- SERVER START ----------------
const PORT = 5000;
app.listen(PORT, () => {
    console.log("Server running on port " + PORT);
});


// ---------------- ROOM APIs ----------------

//get rooms
app.get("/api/rooms", (req, res) => {
    const sql = "SELECT * FROM rooms";

    db.query(sql, (err, results) => {
        if (err) {
            return res.status(500).json({ message: "Database error", error: err });
        }
        res.json(results);
    });
});


// toggle room status
app.put("/api/rooms/:roomNo", (req, res) => {
    const roomNo = req.params.roomNo;

    // get current status
    const selectSql = "SELECT status FROM rooms WHERE room_no = ?";

    db.query(selectSql, [roomNo], (err, results) => {
        if (err || results.length === 0) {
            return res.status(404).json({ message: "Room not found" });
        }

        const currentStatus = results[0].status;
        const newStatus = currentStatus === "Available" ? "Occupied" : "Available";

        const updateSql = "UPDATE rooms SET status = ? WHERE room_no = ?";

        db.query(updateSql, [newStatus, roomNo], (err) => {
            if (err) {
                return res.status(500).json({ message: "Update failed" });
            }

            res.json({
                message: "Room status updated",
                roomNo,
                status: newStatus
            });
        });
    });
});
