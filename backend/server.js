const express = require("express");
const cors = require("cors");
const pool = require("./db");

const app = express();

app.use(cors());
app.use(express.json());

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

      // app.listen(5000, () => {
      //   console.log("Server running on port 5000");
      // });
      const PORT = process.env.PORT || 5000;

     app.listen(PORT, () => {
  console.log("Server running on port " + PORT);
      });

      return;
    } catch (error) {
      console.log(`Database setup attempt ${attempt} failed`);
      await new Promise((resolve) => setTimeout(resolve, 3000));
    }
  }

  console.log("Database setup failed");
  process.exit(1);
}

app.post("/signup", async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: "Username and password are required" });
  }

  try {
    await pool.query(
      "INSERT INTO users (username, password) VALUES ($1, $2)",
      [username, password]
    );

    res.status(201).json({ message: "Signup successful" });
  } catch (error) {
    if (error.code === "23505") {
      return res.status(409).json({ message: "Username already exists" });
    }

    console.log(error);
    res.status(500).json({ message: "Server error" });
  }
});

app.post("/login", async (req, res) => {

  const { username, password } = req.body;

  try {

    const result = await pool.query(
      "SELECT * FROM users WHERE username=$1 AND password=$2",
      [username, password]
    );

    if(result.rows.length > 0){
      res.json({ message: "Login successful" });
    } else {
      res.json({ message: "Invalid credentials" });
    }

  } catch(error){
    console.log(error);
    res.status(500).json({ message: "Server error" });
  }

});

startServer();
