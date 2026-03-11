// =============================================
// otp.js — MoveMaster OTP Logic
// =============================================

// ===== SAFE localStorage PARSE =====
// ✅ Prevents "undefined is not valid JSON" crash
function safeGet(key) {
  try {
    const raw = localStorage.getItem(key);
    if (!raw || raw === "undefined" || raw === "null") return null;
    return JSON.parse(raw);
  } catch (e) {
    return null;
  }
}

// ===== NAVBAR =====
function toggleMenu() {
  const m = document.getElementById("menu");
  m.style.display = m.style.display === "block" ? "none" : "block";
}
document.addEventListener("click", function (e) {
  if (!e.target.closest(".profile"))
    document.getElementById("menu").style.display = "none";
});
function logout() {
  localStorage.clear();
  alert("Logged out successfully");
  window.location.href = "login.html";
}

// ===== SEND OTP =====
function sendOTP() {
  const mobileInput = document.getElementById("mobile");
  const statusMsg   = document.getElementById("statusMsg");
  const sendBtn     = document.getElementById("sendBtn");

  // Strip non-digits before length check
  const mobile = mobileInput.value.replace(/\D/g, "").trim();

  // Validate 10 digits
  if (mobile.length !== 10) {
    statusMsg.style.color     = "#ff4d4d";
    statusMsg.style.animation = "none";
    statusMsg.textContent     = "⚠️ Please enter a valid 10-digit mobile number!";
    return;
  }

  // Reset UI
  statusMsg.style.color     = "#0aa2e6";
  statusMsg.style.animation = "";
  statusMsg.textContent     = "";
  sendBtn.disabled          = true;
  document.getElementById("otpResult").style.display = "none";

  // Generate 4-digit OTP
  const otp = Math.floor(1000 + Math.random() * 9000).toString();

  // ✅ Safe read — won't crash if undefined/null/corrupt
  let ride = safeGet("currentRide") || {};
  ride.otp         = otp;
  ride.otpVerified = false;
  ride.mobile      = mobile;
  localStorage.setItem("currentRide", JSON.stringify(ride));

  // ✅ Also save as "rideOTP" — confirm.html reads this key
  localStorage.setItem("rideOTP", otp);

  // 3-second countdown
  let countdown = 3;
  statusMsg.textContent = "📩 Sending OTP to +91-" + mobile + "... " + countdown + "s";

  const timer = setInterval(function () {
    countdown--;
    if (countdown > 0) {
      statusMsg.textContent = "📩 Sending OTP to +91-" + mobile + "... " + countdown + "s";
    } else {
      clearInterval(timer);
      statusMsg.textContent = "";
      sendBtn.disabled      = false;

      // Show OTP on screen
      document.getElementById("otpDigits").textContent   = otp;
      document.getElementById("otpResult").style.display = "block";
    }
  }, 1000);
}

// ===== COPY OTP =====
function copyOTP() {
  const otp = document.getElementById("otpDigits").textContent;

  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(otp).then(showCopied).catch(function () {
      fallbackCopy(otp);
    });
  } else {
    fallbackCopy(otp);
  }
}

function fallbackCopy(otp) {
  const el = document.createElement("textarea");
  el.value = otp;
  el.style.position = "fixed";
  el.style.opacity  = "0";
  document.body.appendChild(el);
  el.focus();
  el.select();
  try {
    document.execCommand("copy");
    showCopied();
  } catch (err) {
    alert("Your OTP is: " + otp + "\n\nPlease copy it manually.");
  }
  document.body.removeChild(el);
}

function showCopied() {
  const btn = document.getElementById("copyBtn");
  btn.textContent = "✅ OTP Copied!";
  btn.classList.add("copied");
  setTimeout(function () {
    btn.textContent = "📋 Copy OTP";
    btn.classList.remove("copied");
  }, 2000);
}

// ===== GO TO NEXT PAGE =====
function goNext() {
  window.location.href = "confirm.html";
}
