const express = require("express");
const cors = require("cors");

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
let students = [];

app.post("/api/students", (req, res) => {
    const { name, roll, course } = req.body;

    if (!name || !roll || !course) {
        return res.status(400).json({ message: "All fields required" });
    }

    const student = {
        id: students.length + 1,
        name,
        roll,
        course
    };

    students.push(student);
    res.json({ message: "Student added", student });
});

app.get("/api/students", (req, res) => {
    res.json(students);
});

// ---------------- SERVER START ----------------
const PORT = 5000;
app.listen(PORT, () => {
    console.log("Server running on port " + PORT);
});


// ---------------- ROOM APIs ----------------
let rooms =[
    {roomNo: 101, capacity: 2, status: "Available"},
    {roomNo: 102, capacity: 2, status: "Available"}
];

//get rooms
app.get("/api/rooms", (req, res) => {
    res.json(rooms);
});

// toggle room status
app.put("/api/rooms/:roomNo", (req, res) =>{
    const roomNo = parseInt(req.params.roomNo);

    const room = rooms.find(r => r.roomNo === roomNo);

    if (!room) {
        return res.status(404).json({message: "Room not found"});
    }

    room.status = room.status === "Available" ? "Occupied" : "Available";
    res.json({ message: "Room status updated", room});
});