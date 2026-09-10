require("dotenv").config();
const bcrypt = require("bcryptjs");
const express = require("express");
const nodemailer = require("nodemailer");
const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD
    }
});
transporter.verify(function (error, success) {
    if (error) {
        console.log("Gmail connection failed:", error.message);
    } else {
        console.log("Gmail connection successful!");
    }
});
const cors = require("cors");
const Database = require("better-sqlite3");

const db = new Database("hunger_relief.db");

console.log("Database connected successfully");
db.exec(`
    CREATE TABLE IF NOT EXISTS users (
        userId INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT NOT NULL UNIQUE,
        password TEXT NOT NULL,
        role TEXT NOT NULL
    )
`);

console.log("Users table ready");

db.exec(`
    CREATE TABLE IF NOT EXISTS donations (
        donationId INTEGER PRIMARY KEY AUTOINCREMENT,
        userId INTEGER,
        donor TEXT,
        donorType TEXT,
        food TEXT NOT NULL,
        quantity INTEGER,
        location TEXT,
        expiryHrs INTEGER,
        notes TEXT,
        status TEXT NOT NULL,
        acceptedBy TEXT,
        createdAt TEXT
    )
`);

console.log("Donations table ready");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors({
    origin: true,
    methods: ["GET", "POST", "PUT", "OPTIONS"],
    allowedHeaders: ["Content-Type"]
}));

app.use(express.json());


// ======================================================
// TEMPORARY STORAGE
// ======================================================

let donations = [];


let nextDonationId = 1;



// ======================================================
// TEST ROUTE
// ======================================================

app.get("/", (req, res) => {
    res.send("Hunger Relief Network backend is running!");
});


// ======================================================
// USER REGISTRATION
// ======================================================

app.post("/api/users/register", (req, res) => {

    const { name, email, password, role } = req.body;

    if (!name || !email || !password || !role) {
        return res.status(400).json({
            message: "All fields are required"
        });
    }

    const allowedRoles = ["DONOR", "VOLUNTEER"];

if (!allowedRoles.includes(role.toUpperCase())) {
    return res.status(400).json({
        message: "Invalid role"
    });
}

    const existingUser = db.prepare(
        "SELECT * FROM users WHERE LOWER(email) = LOWER(?)"
    ).get(email);

    if (existingUser) {
        return res.status(409).json({
            message: "Email already registered"
        });
    }

    const result = db.prepare(`
        INSERT INTO users (name, email, password, role)
        VALUES (?, ?, ?, ?)
   `).run(
        name,
        email,
        bcrypt.hashSync(password, 10),
        role.toUpperCase()
    );

    const user = {
        userId: result.lastInsertRowid,
        name,
        email,
        role: role.toUpperCase()
   };



    res.status(201).json({
        userId: user.userId,
        name: user.name,
        email: user.email,
        role: user.role
    });
});


// ======================================================
// USER LOGIN
// ======================================================

app.post("/api/users/login", (req, res) => {

    const { email, password } = req.body;

    const user = db.prepare(
    "SELECT * FROM users WHERE LOWER(email) = LOWER(?)"
).get(email);

if (!user) {
    return res.status(401).json({
        message: "Invalid email or password"
    });
}

if (user.password.startsWith("$2")) {
    if (!bcrypt.compareSync(password, user.password)) {
        return res.status(401).json({
            message: "Invalid email or password"
        });
    }
} else {
    if (password !== user.password) {
        return res.status(401).json({
            message: "Invalid email or password"
        });
    }

    const hashedPassword = bcrypt.hashSync(password, 10);

    db.prepare(
        "UPDATE users SET password = ? WHERE userId = ?"
    ).run(hashedPassword, user.userId);
}

    

    res.json({
        userId: user.userId,
        name: user.name,
        email: user.email,
        role: user.role
    });
});


// ======================================================
// GET ALL DONATIONS
// ======================================================

app.get("/api/donations", (req, res) => {

    const donations = db.prepare(
        "SELECT * FROM donations ORDER BY donationId DESC"
    ).all();

    res.json(donations);
});


// ======================================================
// CREATE DONATION
// ======================================================

app.post("/api/donations", async (req, res) => {

    const userId = req.body.userId || null;
    const donorUser = db.prepare(
    "SELECT * FROM users WHERE userId = ? AND role = 'DONOR'"
).get(userId);

if (!donorUser) {
    return res.status(403).json({
        message: "Only registered donors can post donations"
    });
}
    const donor = req.body.donor || null;
    const donorType = req.body.donorType || null;
    const food = req.body.food || "";
    const quantity = req.body.quantity || 0;
    const location = req.body.location || "";
    const expiryHrs = req.body.expiryHrs || 2;
    const notes = req.body.notes || "";
    if (!userId || !donor || !donorType || !food || !quantity || !location) {
    return res.status(400).json({
        message: "Required donation fields are missing"
    });
}

const allowedDonorTypes = [
    "RESTAURANT",
    "HOTEL",
    "GROCERY STORE / BAKERY",
    "EVENT ORGANIZER",
    "INDIVIDUAL"
];

if (!allowedDonorTypes.includes(donorType.toUpperCase())) {
    return res.status(400).json({
        message: "Invalid donor type"
    });
}

if (Number(quantity) <= 0) {
    return res.status(400).json({
        message: "Quantity must be greater than 0"
    });
}

if (Number(expiryHrs) <= 0) {
    return res.status(400).json({
        message: "Expiry hours must be greater than 0"
    });
}
    const status = "available";
    const createdAt = new Date().toISOString();

    

    const result = db.prepare(`
        INSERT INTO donations
        (userId, donor, donorType, food, quantity, location, expiryHrs, notes, status, createdAt)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
        userId,
        donor,
        donorType,
        food,
        quantity,
        location,
        expiryHrs,
        notes,
        status,
        createdAt
    );

    const donation = {
        donationId: result.lastInsertRowid,
        userId,
        donor,
        donorType,
        food,
        quantity,
        location,
        expiryHrs,
        notes,
        status,
        createdAt
    };
    const volunteers = db.prepare(
    "SELECT email FROM users WHERE role = 'VOLUNTEER'"
).all();

const volunteerEmails = volunteers.map(user => user.email);

if (volunteerEmails.length > 0) {
    try {
        await transporter.sendMail({
            from: "santhoshdonar2026@gmail.com",
            to: volunteerEmails,
            subject: "New Food Donation Available - Hunger Relief Network",
            text: `
A new food donation has been posted on Hunger Relief Network.

Donor: ${donor}
Food: ${food}
Quantity: ${quantity}
Location: ${location}
Expiry: ${expiryHrs} hours
Notes: ${notes}

Please log in to Hunger Relief Network to view and accept the donation.
            `
        });

        console.log("Volunteer notification emails sent successfully.");
    } catch (emailError) {
        console.log("Volunteer email notification failed:", emailError.message);
    }
}

    res.status(201).json(donation);
});


// ======================================================
// ACCEPT DONATION
// ======================================================

app.put("/api/donations/:id/accept", (req, res) => {

    const id = Number(req.params.id);
    const volunteerId = req.body.volunteerId || null;
    const acceptedBy = req.body.acceptedBy || null;
    const volunteerUser = db.prepare(
    "SELECT * FROM users WHERE userId = ? AND role = 'VOLUNTEER'"
).get(acceptedBy);

if (!volunteerUser) {
    return res.status(403).json({
        message: "Only registered volunteers can accept donations"
    });
}

    const donation = db.prepare(
        "SELECT * FROM donations WHERE donationId = ?"
    ).get(id);

    if (!donation) {
        return res.status(404).json({
            message: "Donation not found"
        });
    }

    db.prepare(`
        UPDATE donations
        SET status = ?, acceptedBy = ?
        WHERE donationId = ?
    `).run("accepted", acceptedBy, id);

    const updatedDonation = db.prepare(
        "SELECT * FROM donations WHERE donationId = ?"
    ).get(id);

    res.json(updatedDonation);
});


// ======================================================
// PICK UP DONATION
// ======================================================

app.put("/api/donations/:id/pickup", (req, res) => {

    const id = Number(req.params.id);
    const volunteerId = req.body.volunteerId || null;

const volunteerUser = db.prepare(
    "SELECT * FROM users WHERE userId = ? AND role = 'VOLUNTEER'"
).get(volunteerId);

if (!volunteerUser) {
    return res.status(403).json({
        message: "Only registered volunteers can pick up donations"
    });
}

    const donation = db.prepare(
        "SELECT * FROM donations WHERE donationId = ?"
    ).get(id);

    if (!donation) {
        return res.status(404).json({
            message: "Donation not found"
        });
    }
    if (Number(donation.acceptedBy) !== Number(volunteerId)) {
    return res.status(403).json({
        message: "Only the volunteer who accepted this donation can pick it up"
    });
}

    db.prepare(`
        UPDATE donations
        SET status = ?
        WHERE donationId = ?
    `).run("picked_up", id);

    const updatedDonation = db.prepare(
        "SELECT * FROM donations WHERE donationId = ?"
    ).get(id);

    res.json(updatedDonation);
});


// ======================================================
// DELIVER DONATION
// ======================================================

app.put("/api/donations/:id/deliver", (req, res) => {

    const id = Number(req.params.id);
    const volunteerId = req.body.volunteerId || null;
    const donation = db.prepare(
        "SELECT * FROM donations WHERE donationId = ?"
    ).get(id);

    if (!donation) {
        return res.status(404).json({
            message: "Donation not found"
        });
    }
    if (Number(donation.acceptedBy) !== Number(volunteerId)) {
    return res.status(403).json({
        message: "Only the volunteer who accepted this donation can deliver it"
    });
}

    db.prepare(`
        UPDATE donations
        SET status = ?
        WHERE donationId = ?
    `).run("delivered", id);

    const updatedDonation = db.prepare(
        "SELECT * FROM donations WHERE donationId = ?"
    ).get(id);

    res.json(updatedDonation);
});


// ======================================================
// START SERVER
// ======================================================

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});