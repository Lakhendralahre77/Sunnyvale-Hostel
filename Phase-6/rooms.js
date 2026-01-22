const roomsTableBody = document.getElementById("roomsTableBody");

function loadRooms() {
    console.log("loadRooms() called");

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

            attachStatusListeners();
        });
}

function attachStatusListeners() {
    document.querySelectorAll(".status").forEach(cell => {
        cell.addEventListener("click", () => {
            const roomNo = cell.dataset.room;
            toggleRoomStatus(roomNo);
        });
    });
}

function toggleRoomStatus(roomNo) {
    fetch(`http://localhost:5000/api/rooms/${roomNo}`, {
        method: "PUT"
    }).then(() => loadRooms());
}

document.addEventListener("DOMContentLoaded", loadRooms);
