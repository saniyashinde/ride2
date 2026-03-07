
const express = require("express");
const router = express.Router();
const User = require("../models/User");
const bcrypt = require("bcrypt"); // <-- ADD THIS AT THE TOP

// ---------------- SIGNUP ----------------

router.post("/signup", async (req, res) => {
  const { email, password } = req.body;

  let user = await User.findOne({ email });
  if (user) return res.status(400).json({ msg: "Email already exists" });

  user = new User({ email, password });
  await user.save();

  // ✅ Optionally set session here if auto-login
  req.session.userId = user._id;  

  res.json({ user });
});


// ---------------- LOGIN ----------------


router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });
  if(!user) return res.json({ message: "Invalid email or password" });
// 🔥 YAHI ADD KARNA HAI
  req.session.userId = user._id;
  req.session.userEmail = user.email;

  const match = await bcrypt.compare(password, user.password);
  if(!match) return res.json({ message: "Invalid email or password" });

  req.session.userId = user._id;
   req.session.userEmail = user.email;
  res.json({ success: true });
});

// ---------------- LOGOUT ----------------
router.get("/logout", (req, res) => {
  req.session.destroy();
  res.json({ success: true });
});

module.exports = router;
