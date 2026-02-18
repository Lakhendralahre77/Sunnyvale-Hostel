console.log("students.js connected ✅");

// ────────────────────────────────────────────────
// Global variables & auth check
// ────────────────────────────────────────────────
const role = localStorage.getItem("role");
const studentTableBody = document.getElementById("studentTableBody");
const studentForm = document.getElementById("studentForm");
const nameInput         = document.getElementById("name");
const registrationInput = document.getElementById("registration");
const courseInput       = document.getElementById("course");

if (!role) {
    window.location.href = "index.html";
}

// ────────────────────────────────────────────────
// Helper functions (missing in your code)
// ────────────────────────────────────────────────
function showLoading(btn) {
    if (!btn) return;
    btn.disabled = true;
    btn.textContent = "Processing...";
}

function resetButton(btn, originalText) {
    if (!btn) return;
    btn.disabled = false;
    btn.textContent = originalText;
}

function showError(msg) {
    console.error(msg);
    alert(msg);
}

// ────────────────────────────────────────────────
// LOAD STUDENTS
// ────────────────────────────────────────────────
async function loadStudents() {
    try {
        const res = await fetch("http://localhost:5000/api/students");
        if (!res.ok) throw new Error(`HTTP ${res.status}`);

        const data = await res.json();
        studentTableBody.innerHTML = "";

        data.forEach(student => {
            const row = document.createElement("tr");
            row.innerHTML = `
                <td>${student.name || "—"}</td>
                <td>${student.roll || student.registration || "—"}</td> <!-- support both names -->
                <td>${student.course || "—"}</td>
                <td>${student.room_no || "Not Allotted"}</td>
                <td>
                    ${role === "admin" ? `
                        <button class="action-btn btn-allot" data-id="${student.id}">Allot Room</button>
                        <button class="action-btn btn-edit"   data-id="${student.id}">Edit</button>
                        <button class="action-btn btn-delete" data-id="${student.id}">Delete</button>
                    ` : "View Only"}
                </td>
            `;
            studentTableBody.appendChild(row);
        });

        attachDeleteHandlers();
        attachEditHandlers();
        attachAllotHandlers();

    } catch (err) {
        console.error("Load students failed:", err);
        studentTableBody.innerHTML = `<tr><td colspan="5" style="text-align:center;color:red;">Failed to load students</td></tr>`;
    }
}

// ────────────────────────────────────────────────
// PAGE LOAD
// ────────────────────────────────────────────────
document.addEventListener("DOMContentLoaded", () => {
    if (studentTableBody) {
        loadStudents();
    }
});

// ────────────────────────────────────────────────
// ADD STUDENT
// ────────────────────────────────────────────────
if (studentForm) {
    studentForm.addEventListener("submit", async (e) => {
        e.preventDefault();

        const addBtn = studentForm.querySelector(".btn-add");
        showLoading(addBtn);

        const studentData = {
            name:        nameInput?.value?.trim()       || "",
            roll:        registrationInput?.value?.trim() || "",   // ← backend expects "roll"
            course:      courseInput?.value?.trim()     || ""
        };

        if (!studentData.name || !studentData.roll || !studentData.course) {
            alert("Please fill all fields");
            resetButton(addBtn, "Add Student");
            return;
        }

        try {
            const res = await fetch("http://localhost:5000/api/students", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(studentData)
            });

            if (!res.ok) {
                const errData = await res.json().catch(() => ({}));
                throw new Error(errData.message || `Server error (${res.status})`);
            }

            alert("Student added successfully!");
            studentForm.reset();
            await loadStudents();

        } catch (err) {
            showError(`Failed to add student: ${err.message}`);
        } finally {
            resetButton(addBtn, "Add Student");
        }
    });
}

// ────────────────────────────────────────────────
// DELETE STUDENT
// ────────────────────────────────────────────────
function attachDeleteHandlers() {
    document.querySelectorAll(".btn-delete").forEach(btn => {
        btn.addEventListener("click", async () => {
            const id = btn.dataset.id;
            if (!confirm("Delete this student?")) return;

            showLoading(btn);

            try {
                const res = await fetch(`http://localhost:5000/api/students/${id}`, { method: "DELETE" });
                if (!res.ok) throw new Error("Delete failed");
                await loadStudents();
            } catch (err) {
                showError("Delete error: " + err.message);
            } finally {
                resetButton(btn, "Delete");
            }
        });
    });
}

// ────────────────────────────────────────────────
// EDIT STUDENT
// ────────────────────────────────────────────────
function attachEditHandlers() {
    document.querySelectorAll(".btn-edit").forEach(btn => {
        btn.addEventListener("click", async () => {
            const id = btn.dataset.id;

            // You can improve this later by fetching current data
            const newName   = prompt("Edit Name:", "Current name");
            const newRoll   = prompt("Edit Registration No:", "Current roll");
            const newCourse = prompt("Edit Course:", "Current course");

            if (!newName || !newRoll || !newCourse) return;

            showLoading(btn);

            try {
                const res = await fetch(`http://localhost:5000/api/students/${id}`, {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        name:   newName.trim(),
                        roll:   newRoll.trim(),     // ← consistent with add
                        course: newCourse.trim()
                    })
                });

                if (!res.ok) throw new Error("Update failed");
                await loadStudents();
            } catch (err) {
                showError("Edit error: " + err.message);
            } finally {
                resetButton(btn, "Edit");
            }
        });
    });
}

// ────────────────────────────────────────────────
// ALLOT ROOM
// ────────────────────────────────────────────────
function attachAllotHandlers() {
    document.querySelectorAll(".btn-allot").forEach(btn => {
        btn.addEventListener("click", async () => {
            const studentId = btn.dataset.id;
            showLoading(btn);

            try {
                const res = await fetch("http://localhost:5000/api/rooms/available");
                if (!res.ok) throw new Error("Cannot load rooms");

                const rooms = await res.json();

                if (rooms.length === 0) {
                    alert("No rooms available");
                    return;
                }

                const roomList = rooms.map(r => r.room_no).join(", ");
                const selected = prompt(`Available rooms: ${roomList}\n\nEnter room number:`);

                if (!selected) return;

                const allotRes = await fetch(`http://localhost:5000/api/students/${studentId}/allot`, {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ room_no: selected.trim() })
                });

                if (!allotRes.ok) {
                    const errData = await allotRes.json().catch(() => ({}));
                    throw new Error(errData.message || "Allot failed");
                }

                const data = await allotRes.json();
                alert(data.message || "Room allotted!");
                await loadStudents();

            } catch (err) {
                showError("Allot error: " + err.message);
            } finally {
                resetButton(btn, "Allot Room");
            }
        });
    });
}