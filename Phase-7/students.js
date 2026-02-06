console.log("students.js connected ✅");

const role = localStorage.getItem("role");
const studentTableBody = document.getElementById("studentTableBody");
const studentForm = document.getElementById("studentForm");
const nameInput = document.getElementById("name");
const rollInput = document.getElementById("roll");
const courseInput = document.getElementById("course");

if (!localStorage.getItem("role")) {
    window.location.href = "index.html";
}

/* ==============================
   STEP 1: LOAD STUDENTS
================================ */
function loadStudents() {
    fetch("http://localhost:5000/api/students")
        .then(res => res.json())
        .then(data => {
            studentTableBody.innerHTML = "";

            data.forEach(student => {
                const row = document.createElement("tr");

                row.innerHTML = `
                    <td>${student.name}</td>
                    <td>${student.roll}</td>
                    <td>${student.course}</td>
                    <td>${student.room_no || "Not Allotted"}</td>
                    <td>
                        ${role === "admin" ? `
                            <button class="allot-btn" data-id="${student.id}"> Allot Room </button>
                            <button class="edit-btn" data-id="${student.id}"> Edit </button>
                            <button class="delete-btn" data-id="${student.id}"> Delete </button>
                        `: "View Only"}    
                        </td>
                `;


                studentTableBody.appendChild(row);
            });

            // 🔥 IMPORTANT: attach handlers AFTER rows are created
            attachDeleteHandlers();
            attachEditHandlers();
            attachAllotHandlers();
        })
        .catch(err => console.error("Load error:", err));
}

/* ==============================
   STEP 2: LOAD ON PAGE OPEN
================================ */
document.addEventListener("DOMContentLoaded", () => {
    if (studentTableBody) {
        loadStudents();
    }
});

/* ==============================
   STEP 3: ADD STUDENT
================================ */
if (studentForm) {
    studentForm.addEventListener("submit", function (e) {
        e.preventDefault();

        const studentData = {
            name: nameInput.value,
            roll: rollInput.value,
            course: courseInput.value
        };

        fetch("http://localhost:5000/api/students", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(studentData)
        })
        .then(res => res.json())
        .then(() => {
            alert("Student added successfully");
            studentForm.reset();
            loadStudents();
        })
        .catch(err => console.error("Post error:", err));
    });
}

/* ==============================
   STEP 4: DELETE STUDENT
================================ */
function attachDeleteHandlers() {
    document.querySelectorAll(".delete-btn").forEach(btn => {
        btn.addEventListener("click", () => {
            const id = btn.dataset.id;

            if (!confirm("Are you sure you want to delete this student?")) return;

            fetch(`http://localhost:5000/api/students/${id}`, {
                method: "DELETE"
            })
            .then(res => res.json())
            .then(() => loadStudents())
            .catch(err => console.error("Delete error:", err));
        });
    });
}

/* ==============================
   STEP 5: EDIT STUDENT
================================ */
function attachEditHandlers() {
    document.querySelectorAll(".edit-btn").forEach(btn => {
        btn.addEventListener("click", () => {
            const id = btn.dataset.id;

            const newName = prompt("Enter name", btn.dataset.name);
            const newRoll = prompt("Enter roll", btn.dataset.roll);
            const newCourse = prompt("Enter course", btn.dataset.course);

            if (!newName || !newRoll || !newCourse) return;

            fetch(`http://localhost:5000/api/students/${id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name: newName,
                    roll: newRoll,
                    course: newCourse
                })
            })
            .then(res => res.json())
            .then(() => loadStudents())
            .catch(err => console.error("Edit error:", err));
        });
    });
}


/*function attachAllotHandlers() {
    document.querySelectorAll(".allot-btn").forEach(btn => {
        btn.addEventListener("click", () => {
            const id = btn.dataset.id;
            const roomNo = prompt("Enter room number:");

            if (!roomNo) return;

            fetch(`http://localhost:5000/api/students/${id}/allot`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ room_no: roomNo })
            })
            .then(res => res.json())
            .then(data => {
                alert(data.message);   // 🔥 error/success both
                loadStudents();
            })
            .catch(err => console.error(err));
        });
    });
}*/
function attachAllotHandlers() {
    document.querySelectorAll(".allot-btn").forEach(btn => {
        btn.addEventListener("click", async () => {
            const studentId = btn.dataset.id;

            // 1️⃣ fetch available rooms
            const res = await fetch("http://localhost:5000/api/rooms/available");
            const rooms = await res.json();

            if (rooms.length === 0) {
                alert("No rooms available");
                return;
            }

            // 2️⃣ create dropdown options
            let options = rooms.map(r => r.room_no).join(", ");

            const selectedRoom = prompt(
                `Available rooms: ${options}\nEnter room number:`
            );

            if (!selectedRoom) return;

            // 3️⃣ allot selected room
            fetch(`http://localhost:5000/api/students/${studentId}/allot`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ room_no: selectedRoom })
            })
            .then(res => res.json())
            .then(data => {
                alert(data.message);
                loadStudents();
            });
        });
    });
}
