console.log("rooms.js connected ✅");

const roomsTableBody = document.getElementById("roomsTableBody");

function loadRooms() {
    fetch("http://localhost:5000/api/rooms")
        .then(res => res.json())
        .then(data => {
            roomsTableBody.innerHTML = "";

            data.forEach(room => {
                const row = document.createElement("tr");

                row.innerHTML = `
                    <td>${room.room_no}</td>
                    <td>${room.capacity}</td>
                    <td class="status" data-room="${room.room_no}">
                        ${room.status}
                    </td>
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
