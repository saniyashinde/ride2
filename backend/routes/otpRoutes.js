const express = require("express");
const router = express.Router();

const otpStore = {}; // mobile → otp

router.post("/send", (req, res) => {
  const { mobile } = req.body;

  const otp = Math.floor(100000 + Math.random() * 900000);
  otpStore[mobile] = otp;

  console.log("Ride OTP:", otp);

  res.json({
    message: "OTP generated",
    otp // demo only
  });
});

router.post("/verify", (req, res) => {
  const { mobile, otp } = req.body;

  if (otpStore[mobile] == otp) {
    delete otpStore[mobile];
    return res.json({ success: true });
  }

  res.json({ success: false });
});

module.exports = router;
