const express = require("express");
const router = express.Router();
const User = require("../models/User");
const bcrypt = require("bcrypt");

// ---------------- SIGNUP ----------------

router.post("/signup", async (req, res) => {
  const { email, password } = req.body;

  let user = await User.findOne({ email });
  if (user) return res.status(400).json({ msg: "Email already exists" });

  const hashedPassword = await bcrypt.hash(password, 10);

  user = new User({
    email,
    password: hashedPassword
  });

  await user.save();

  req.session.userId = user._id;

  res.json({ user });
});

// ---------------- LOGIN ----------------

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password required" });
    }

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "Invalid email or password" });

    if (!user.password) {
      return res.status(400).json({ message: "Please login with Google" });
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(400).json({ message: "Invalid email or password" });

    req.session.userId = user._id;
    req.session.userEmail = user.email;

    res.json({ success: true, user });
  } catch (err) {
    console.error("Login error in authRoutes:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// ---------------- LOGOUT ----------------

router.get("/logout", (req, res) => {
  req.session.destroy();
  res.json({ success: true });
});

module.exports = router;