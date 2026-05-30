const mysql = require('mysql');
const express = require('express');
const router = express.Router();
const bodyParser = require('body-parser');
const dotenv = require("dotenv").config();

const db = mysql.createConnection({
    host: process.env.DATABASE_HOST ?? process.env.MYSQLHOST ?? 'localhost',
    user: process.env.DATABASE_USER ?? process.env.MYSQLUSER ?? 'root',
    password: process.env.DATABASE_PASSWORD ?? process.env.MYSQLPASSWORD ?? '',
    database: process.env.DATABASE ?? process.env.MYSQLDATABASE ?? 'ie104_group2',
    port: process.env.DATABASE_PORT ?? process.env.MYSQLPORT ?? 3306
})

db.connect(function (err) {
    if (err) {
        throw err;
    } else {
        console.log('You are already connected to the database')
    }
})

module.exports = db;