function sendOTP() {
  const mobile = document.getElementById("mobile").value;

  fetch("http://localhost:5000/api/otp/send", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ mobile })
  })
  .then(res => res.json())
  .then(data => {
    alert("Your OTP (Demo): " + data.otp);
    document.getElementById("otpBox").style.display = "block";
  });
}

function verifyOTP() {
  const mobile = document.getElementById("mobile").value;
  const otp = document.getElementById("otp").value;

  fetch("http://localhost:5000/api/otp/verify", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ mobile, otp })
  })
  .then(res => res.json())
  .then(data => {
    if (data.success) {
      alert("confirm your ride successful");
      window.location.href = "success.html";
    } else {
      alert("Wrong OTP");
    }
  });
}
