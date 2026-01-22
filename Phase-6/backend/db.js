const mysql = require("mysql2");

// create connection
const db = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "lucky01",
    database: "hostel_management"
});

// connect to database
db.connect((err) => {
    if (err) {
        console.log("Database connection failed ❌");
        console.error(err);
        return;
    }
    console.log("MySQL connected successfully ✅");
});

module.exports = db;
