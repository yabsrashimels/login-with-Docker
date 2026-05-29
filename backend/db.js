const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log("Server running on port " + PORT);
});


// const { Pool } = require("pg");

// const pool = new Pool({
//   user: process.env.DB_USER || "postgres",
//   host: process.env.DB_HOST || "db",
//   database: process.env.DB_NAME || "loginapp",
//   password: process.env.DB_PASSWORD || "1234",
//   port: process.env.DB_PORT || 5432,
// });

// module.exports = pool;
