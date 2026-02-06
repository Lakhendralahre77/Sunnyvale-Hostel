document.getElementById("loginForm").addEventListener("submit", e => {
    e.preventDefault();

    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;

    fetch("http://localhost:5000/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password })
    })
    .then(res => res.json())
    .then(data => {
        if (data.role) {
            localStorage.setItem("role", data.role);
            window.location.href = "dashboard.html";
        } else {
            alert(data.message);
        }
    })
    .catch(err => console.error("Login error:", err));
});
