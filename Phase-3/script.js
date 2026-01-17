console.log("JS connected ✅");

//step-1: wait for HTML to load
document.addEventListener("DOMContentLoaded", function () {

//step-2: Login form validation
    const loginForm = document.getElementById("loginForm");

    if(loginForm) {
    loginForm.addEventListener("submit", function (event) {
        event.preventDefault();

        const email = document.querySelector("input[type='email']").value;
        const password = document.querySelector("input[type='password']").value;

        if (email === "" || password === "") {
            alert("Please fill all fields");
            return;
        }

        window.location.href = "dashboard.html";
    });
    }
   

//step-3: student registration logic
    const studentForm = document.getElementById("studentForm");

    const tableBody = document.getElementById("studentTableBody");

    if(studentForm) {
    studentForm.addEventListener("submit", function (event) {
        event.preventDefault();


        const name = studentForm.elements[0].value;
        const roll = studentForm.elements[1].value;
        const course = studentForm.elements[2].value;

        if (name === "" || roll === "" || course === "") {
            alert("All fields are required");
            return;
        }

        const row = document.createElement("tr");

        row.innerHTML = `
        <td>${name}</td>
        <td>${roll}</td>
        <td>${course}</td>
    `;

        tableBody.appendChild(row);

        studentForm.reset();
    });
    }
//step-4: Room status logic
    

    const statusCells = document.querySelectorAll(".status");
    console.log("Status cells found:", statusCells.length);

    if (statusCells.length > 0) {
    statusCells.forEach(function (cell) {
        cell.addEventListener("click", function () {
            console.log("Clicked:", cell.textContent);

            if (cell.textContent.trim() === "Available") {
                cell.textContent = "Occupied";
            } else {
                cell.textContent = "Available";
            }
        });
    });
    }
}); 

