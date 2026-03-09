document.getElementById("rideInfo").innerText =
  "Pickup: Thane | Drop: Mulund | Fare: ₹120";

function sendOTP() {
  const mobile = document.getElementById("mobile").value;

  fetch("https://ride2-6.onrender.com/api/otp/send", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ mobile })
  })
  .then(res => res.json())
  .then(data => {
    alert("OTP (Demo): " + data.otp);
    document.getElementById("otpBox").style.display = "block";
  });
}

function verifyOTP() {
  const mobile = document.getElementById("mobile").value;
  const otp = document.getElementById("otp").value;

  fetch("https://ride2-6.onrender.com/api/otp/verify-otp", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ mobile, otp })
  })
  .then(res => res.json())
  .then(data => {
    if (data.success) {
      window.location.href = "success.html";
    } else {
      alert("Wrong OTP");
    }
  });
}
const socket = io("https://ride2-6.onrender.com");
const rideId = localStorage.getItem("rideId");

if (navigator.geolocation) {
  setInterval(() => {
    navigator.geolocation.getCurrentPosition((pos) => {
      socket.emit("driverLocation", {
        rideId,
        lat: pos.coords.latitude,
        lng: pos.coords.longitude
      });
    });
  }, 3000);
}
