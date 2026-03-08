function login() {
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value.trim();

  if(!email || !password){
    alert("Please enter both email and password");
    return;
  }

  fetch("https://ride2-6.onrender.com/api/auth/login", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  credentials: "include",   // 🔥 MUST
  body: JSON.stringify({ email, password })
})
  .then(res => res.json())
  .then(data => {
    if(data.success){
      localStorage.setItem("userEmail", email); // for frontend
      window.location.href = "booking.html";
    } else {
      alert(data.message || "Invalid email or password");
    }
  })
  .catch(err => alert("Login failed. Try again."));
}
