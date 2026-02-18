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

/* ===== NOTICE PREVIEW ON DASHBOARD ===== */

const dashboardNotices = document.getElementById("dashboardNotices");

function loadDashboardNotices() {
    let notices = JSON.parse(localStorage.getItem("notices")) || [];

    dashboardNotices.innerHTML = "";

    notices.slice(-3).reverse().forEach(n => {
        const card = document.createElement("div");
        card.className = "notice";

        card.innerHTML = `
          <h3>${n.title}</h3>
          <p>${n.desc}</p>
          <small>${n.date}</small>
        `;

        dashboardNotices.appendChild(card);
    });
}

document.addEventListener("DOMContentLoaded", () => {
    loadDashboardStats();
    loadDashboardNotices();
});
