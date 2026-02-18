console.log("rooms.js connected ✅");

const roomsTableBody = document.getElementById("roomsTableBody");

if (!localStorage.getItem("role")) {
    window.location.href = "index.html";
}

function loadRooms() {
    fetch("http://localhost:5000/api/rooms")
        .then(res => res.json())
        .then(data => {
            roomsTableBody.innerHTML = "";

            data.forEach(room => {
                const row = document.createElement("tr");

                 // Demo occupancy logic (full if occupied, empty if available)
    
                let percent = room.status === "Occupied" ? 100:0;

                let roomType;

                if (room.capacity == 1) {
                    roomType = "Single";
                } 
                else if (room.capacity == 2) {
                    roomType = "Double";
                } 
                else if (room.capacity == 3) {
                    roomType = "Triple";
                } 
                else {
                    roomType = "Shared";
                }

                row.innerHTML = `
                    <td>${room.room_no}</td>
                    <td>${room.floor || "Floor 1"}</td>
                    <td>${roomType}</td>
                    <td>${room.capacity}</td>
                    <td>
                        <span class="occupy-badge">
                            ${room.occupied || 1} / ${room.capacity}
                        </span>
                    </td>
                    <td>₹${room.rent || 5000}</td>
                    <td>${room.facilities || "WiFi, Bed, Bathroom, Study Table"}</td>
                    `;

                roomsTableBody.appendChild(row);
            });

            attachStatusClick();
        });
}

function attachStatusClick() {
    const statusCells = document.querySelectorAll(".status");

    statusCells.forEach(cell => {
        cell.addEventListener("click", function () {

            const roomNo = cell.getAttribute("data-room");
            const currentStatus = cell.textContent.trim();
            const newStatus = currentStatus === "Available"
                ? "Occupied"
                : "Available";

            fetch(`http://localhost:5000/api/rooms/${roomNo}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status: newStatus })
            })
            .then(res => res.json())
            .then(() => loadRooms());
        });
    });
}

document.addEventListener("DOMContentLoaded", loadRooms);
