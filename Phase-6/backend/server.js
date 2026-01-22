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
    const { email, password } = req.body;

    if (email === "admin@hostel.com" && password === "admin123") {
        return res.json({ success: true });
    }

    res.status(401).json({ success: false, message: "Invalid credentials" });
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
