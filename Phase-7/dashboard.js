console.log("Dashboard JS connected ✅");

if (!localStorage.getItem("role")) {
    window.location.href = "index.html";
}

function loadDashboardStats() {
    fetch("http://localhost:5000/api/dashboard/stats")
        .then(res => res.json())
        .then(data => {
            document.getElementById("totalStudents").textContent = data.totalStudents;
            document.getElementById("totalRooms").textContent = data.totalRooms;
            document.getElementById("occupiedRooms").textContent = data.occupiedRooms;
            document.getElementById("availableRooms").textContent = data.availableRooms;
        })
        .catch(err => console.error(err));
}

document.addEventListener("DOMContentLoaded", loadDashboardStats);
