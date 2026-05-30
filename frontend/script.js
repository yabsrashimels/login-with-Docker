const RENDER_BACKEND_URL = "https://your-backend-service.onrender.com";
const API_URL = ["localhost", "127.0.0.1"].includes(window.location.hostname)
  ? "http://localhost:5000"
  : RENDER_BACKEND_URL;

async function sendRequest(path, body) {
  const message = document.getElementById("message");

  try {
    const response = await fetch(`${API_URL}${path}`, {
      method: "POST",
      headers: {
        "Content-Type":"application/json"
      },
      body: JSON.stringify(body)
    });

    const data = await response.json();
    message.innerText = data.message;
  } catch (error) {
    message.innerText = `Cannot connect to backend at ${API_URL}`;
  }
}

async function login() {

  const username = document.getElementById("username").value;
  const password = document.getElementById("password").value;

  await sendRequest("/login", {
    username,
    password
  });
}

async function signup() {
  const username = document.getElementById("signup-username").value;
  const password = document.getElementById("signup-password").value;

  await sendRequest("/signup", {
    username,
    password
  });
}
