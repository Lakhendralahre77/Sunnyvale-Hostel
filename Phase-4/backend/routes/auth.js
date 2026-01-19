router.post("/login", (req, res) => {
    const {email, password} = req.body;

    if (email === "admin@hostel.com" && password === "admin123") {
        return res.json ({ success: true});
    }
    res.status(401).json({success: false, message: "Invalid credentials"});
});