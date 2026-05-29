async function login() {

  const username = document.getElementById("username").value;
  const password = document.getElementById("password").value;

  const response = await fetch("http://localhost:5000/login", {
    method: "POST",
    headers: {
      "Content-Type":"application/json"
    },
    body: JSON.stringify({
      username,
      password
    })
  });

  const data = await response.json();

  document.getElementById("message").innerText = data.message;
}

async function signup() {
  const username = document.getElementById("signup-username").value;
  const password = document.getElementById("signup-password").value;

  const response = await fetch("http://localhost:5000/signup", {
    method: "POST",
    headers: {
      "Content-Type":"application/json"
    },
    body: JSON.stringify({
      username,
      password
    })
  });

  const data = await response.json();

  document.getElementById("message").innerText = data.message;
}
