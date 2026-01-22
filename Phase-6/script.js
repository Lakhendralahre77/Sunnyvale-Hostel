console.log("JS connected ✅");

//step-1: wait for HTML to load
document.addEventListener("DOMContentLoaded", function () {

//step-2: Login form validation
    const loginForm = document.getElementById("loginForm");

    if(loginForm) {
    loginForm.addEventListener("submit", async function (event) {
        event.preventDefault();

        const email = document.querySelector("input[type='email']").value;
        const password = document.querySelector("input[type='password']").value;

        if (email === "" || password === "") {
            alert("Please fill all fields");
            return;
        }

        //window.location.href = "dashboard.html";

        try {
            const response = await fetch("http://localhost:5000/api/login",{
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({email, password})
            });

            const date = await response.json();

            if(response.ok){
                alert("Login successful");       
                window.location.href = "dashboard.html";
            } else {
                alert(this.dataset.message || "Login failed");
            }

        } catch (error) {
            alert("Server not reachable");
            console.error(error);
        }
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
}); 



