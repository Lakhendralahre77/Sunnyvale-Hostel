// auth.js - Client-side (browser) authentication logic

console.log("auth.js loaded successfully ✅");

// =============================================
//  Check if user is logged in / has role
// =============================================
function checkAuth() {
    const role = localStorage.getItem("role");
    const token = localStorage.getItem("token"); // optional - if you add JWT later

    if (!role) {
        console.warn("No role found → redirecting to login");
        // Uncomment when you're ready to enforce login
        // window.location.href = "index.html";
        return false;
    }

    console.log("Logged in as:", role);

    // Optional: hide admin controls for non-admins
    if (role !== "admin") {
        document.querySelectorAll('.action-btn, .btn-add').forEach(el => {
            el.disabled = true;
            el.style.opacity = "0.5";
            el.title = "Admin only";
        });
    }

    return true;
}

// =============================================
//  Logout function (call from logout button/link)
// =============================================
function logout() {
    localStorage.removeItem("role");
    localStorage.removeItem("token"); // if using token
    localStorage.clear();             // optional - clear everything
    window.location.href = "index.html";
}

// =============================================
//  Optional: Login function (call from login form)
// =============================================
async function login(email, password) {
    try {
        const response = await fetch("http://localhost:5000/api/auth/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password })
        });

        const data = await response.json();

        if (data.success) {
            localStorage.setItem("role", "admin"); // or from backend response
            // localStorage.setItem("token", data.token); // if you add JWT later
            alert("Login successful!");
            window.location.href = "dashboard.html";
        } else {
            alert(data.message || "Login failed");
        }
    } catch (err) {
        console.error("Login error:", err);
        alert("Server error. Please try again later.");
    }
}

// Run auth check when page loads
document.addEventListener("DOMContentLoaded", () => {
    checkAuth();
});

// Export functions so you can call them from other scripts if needed
window.logout = logout;
window.login = login;   // if you want to use it from login page