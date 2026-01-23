console.log("students.js connected ✅");

const studentTableBody = document.getElementById("studentTableBody");
const studentForm = document.getElementById("studentForm");
const nameInput = document.getElementById("name");
const rollInput = document.getElementById("roll");
const courseInput = document.getElementById("course");

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
                        <button class="allot-btn" data-id="${student.id}">
                            Allot Room
                        </button>
                        <button class="edit-btn" data-id="${student.id}">
                            Edit
                        </button>
                        <button class="delete-btn" data-id="${student.id}">
                            Delete
                        </button>
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


function attachAllotHandlers() {
    const allotButtons = document.querySelectorAll(".allot-btn");

    allotButtons.forEach(btn => {
        btn.addEventListener("click", () => {
            const id = btn.dataset.id;

            const roomNo = prompt("Enter room number:");

            if (!roomNo) return;

            fetch(`http://localhost:5000/api/students/${id}/allot`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ room_no: roomNo })
            })
            .then(res => res.json())
            .then(data => {
                alert("Room allotted: " + data.room);
                loadStudents();
            })
            .catch(err => console.error("Allot error:", err));
        });
    });
}
