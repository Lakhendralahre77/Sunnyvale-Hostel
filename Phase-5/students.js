const studentTableBody = document.getElementById("studentTableBody");
const studentForm = document.getElementById("studentForm");

const nameInput = document.getElementById("name");
const rollInput = document.getElementById("roll");
const courseInput = document.getElementById("course");

// STEP 1: Load students
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
                `;

                studentTableBody.appendChild(row);
            });
        })
        .catch(err => console.error("Load error:", err));
}

// STEP 2: Load data when page opens
document.addEventListener("DOMContentLoaded", function () {
    if (studentTableBody) {
        loadStudents();
    }
});

// STEP 3: Handle form submit
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
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(studentData)
        })
            .then(res => res.json())
            .then(data => {
                alert("Student added successfully");
                studentForm.reset();
                loadStudents(); // refresh table
            })
            .catch(err => console.error("Post error:", err));
    });
}
