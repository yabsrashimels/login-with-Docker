require("dotenv").config();

const crypto = require("crypto");
const express = require("express");
const cors = require("cors");
const pool = require("./db");

const app = express();

const PORT = process.env.PORT || 5000;

// SIMPLE CORS FOR NETLIFY + LOCALHOST
app.use(cors());

app.use(express.json());

function hashPassword(password) {

  const salt = crypto.randomBytes(16).toString("hex");

  const hash = crypto
    .scryptSync(password, salt, 64)
    .toString("hex");

  return `${salt}:${hash}`;
}

function verifyPassword(password, savedPassword) {

  if (!savedPassword || !savedPassword.includes(":")) {
    return false;
  }

  const [salt, savedHash] = savedPassword.split(":");

  const hash = crypto.scryptSync(password, salt, 64);

  const savedHashBuffer = Buffer.from(savedHash, "hex");

  return (
    savedHashBuffer.length === hash.length &&
    crypto.timingSafeEqual(savedHashBuffer, hash)
  );
}

async function createUsersTable() {

  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      username VARCHAR(100) UNIQUE NOT NULL,
      password VARCHAR(255) NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

}

async function startServer() {

  for (let attempt = 1; attempt <= 10; attempt++) {

    try {

      await createUsersTable();

      app.listen(PORT, "0.0.0.0", () => {
        console.log("Server running on port " + PORT);
      });

      return;

    } catch (error) {

      console.log(`Database setup attempt ${attempt} failed`);

      console.log(error);

      await new Promise((resolve) =>
        setTimeout(resolve, 3000)
      );

    }

  }

  console.log("Database setup failed");

  process.exit(1);
}

app.get("/", (req, res) => {

  res.json({
    message: "Backend is running"
  });

});

app.post("/signup", async (req, res) => {

  const { username, password } = req.body;

  if (!username || !password) {

    return res.status(400).json({
      message: "Username and password are required"
    });

  }

  try {

    await pool.query(
      "INSERT INTO users (username, password) VALUES ($1, $2)",
      [username, hashPassword(password)]
    );

    res.status(201).json({
      message: "Signup successful"
    });

  } catch (error) {

    if (error.code === "23505") {

      return res.status(409).json({
        message: "Username already exists"
      });

    }

    console.log(error);

    res.status(500).json({
      message: "Server error"
    });

  }

});

app.post("/login", async (req, res) => {

  const { username, password } = req.body;

  try {

    const result = await pool.query(
      "SELECT * FROM users WHERE username=$1",
      [username]
    );

    if (
      result.rows.length > 0 &&
      verifyPassword(password, result.rows[0].password)
    ) {

      res.json({
        message: "Login successful"
      });

    } else {

      res.json({
        message: "Invalid credentials"
      });

    }

  } catch (error) {

    console.log(error);

    res.status(500).json({
      message: "Server error"
    });

  }

});

startServer();

/*
require("dotenv").config();

const crypto = require("crypto");
const express = require("express");
const cors = require("cors");
const pool = require("./db");

const app = express();
const PORT = process.env.PORT || 5000;
const allowedOrigins = (process.env.CORS_ORIGIN || "http://localhost:3000,http://127.0.0.1:3000")
  .split(",")
  .map((origin) => origin.trim());

app.use(cors({
  origin(origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    return callback(new Error("Not allowed by CORS"));
  },
}));
app.use(express.json());

function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto.scryptSync(password, salt, 64).toString("hex");

  return `${salt}:${hash}`;
}

function verifyPassword(password, savedPassword) {
  if (!savedPassword || !savedPassword.includes(":")) {
    return false;
  }

  const [salt, savedHash] = savedPassword.split(":");
  const hash = crypto.scryptSync(password, salt, 64);
  const savedHashBuffer = Buffer.from(savedHash, "hex");

  return savedHashBuffer.length === hash.length &&
    crypto.timingSafeEqual(savedHashBuffer, hash);
}

async function createUsersTable() {

  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      username VARCHAR(100) UNIQUE NOT NULL,
      password VARCHAR(255) NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

}

async function startServer() {

  for (let attempt = 1; attempt <= 10; attempt++) {

    try {

      await createUsersTable();

      app.listen(PORT, "0.0.0.0", () => {
        console.log("Server running on port " + PORT);
      });

      return;

    } catch (error) {

      console.log(`Database setup attempt ${attempt} failed`);

      console.log(error);

      await new Promise((resolve) =>
        setTimeout(resolve, 3000)
      );

    }

  }

  console.log("Database setup failed");

  process.exit(1);

}

app.get("/", (req, res) => {
  res.json({
    message: "Backend is running"
  });
});

app.post("/signup", async (req, res) => {

  const { username, password } = req.body;

  if (!username || !password) {

    return res.status(400).json({
      message: "Username and password are required"
    });

  }

  try {

    await pool.query(
      "INSERT INTO users (username, password) VALUES ($1, $2)",
      [username, hashPassword(password)]
    );

    res.status(201).json({
      message: "Signup successful"
    });

  } catch (error) {

    if (error.code === "23505") {

      return res.status(409).json({
        message: "Username already exists"
      });

    }

    console.log(error);

    res.status(500).json({
      message: "Server error"
    });

  }

});

app.post("/login", async (req, res) => {

  const { username, password } = req.body;

  try {

    const result = await pool.query(
      "SELECT * FROM users WHERE username=$1",
      [username]
    );

    if (result.rows.length > 0 && verifyPassword(password, result.rows[0].password)) {

      res.json({
        message: "Login successful"
      });

    } else {

      res.json({
        message: "Invalid credentials"
      });

    }

  } catch (error) {

    console.log(error);

    res.status(500).json({
      message: "Server error"
    });

  }

});

startServer();
*/