const mysql = require("mysql2");
const dotenv = require("dotenv").config();

const db = mysql.createConnection({
  host: process.env.MYSQLHOST || process.env.DATABASE_HOST,
  user: process.env.MYSQLUSER || process.env.DATABASE_USER,
  password: process.env.MYSQLPASSWORD || process.env.DATABASE_PASSWORD,
  database: process.env.MYSQLDATABASE || process.env.DATABASE,
  port: process.env.MYSQLPORT || process.env.DATABASE_PORT,
});

db.connect((err) => {
  if (err) {
    console.log("Database connection failed:", err);
  } else {
    console.log("Connected database");

    db.query("SET SESSION sql_mode = ''", (err) => {
      if (err) {
        console.log(err);
      } else {
        console.log("SQL MODE disabled");
      }
    });
  }
});

module.exports = db;
