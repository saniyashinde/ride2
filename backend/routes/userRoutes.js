const express = require("express");
const router = express.Router();
const User = require("../models/User");
const bcrypt = require("bcrypt");

// ---------------- SIGNUP ----------------
router.post("/signup", async (req, res) => {
  try {
    const { name, email, password, image } = req.body;

    if (!name || !email) return res.status(400).json({ msg: "Name aur email required hai" });

    const existingUser = await User.findOne({ email });

    // ✅ Google OAuth user already exist karta hai — seedha login karo
    if (existingUser) {
      req.session.userId = existingUser._id;
      req.session.userEmail = existingUser.email;
      return res.json({ user: existingUser });
    }

    // ✅ Normal signup — password hash karo
    let hashedPassword = null;
    if (password && password !== "google_oauth") {
      if (password.length < 6) return res.status(400).json({ msg: "Password kam se kam 6 characters ka hona chahiye" });
      hashedPassword = await bcrypt.hash(password, 10);
    }

    const user = new User({
      name,
      email,
      password: hashedPassword,
      image: image || "https://www.example.com/default-profile.png"
    });

    await user.save();

    req.session.userId = user._id;
    req.session.userEmail = user.email;

    res.json({ user });
  } catch (err) {
    console.error("❌ Signup error:", err);
    res.status(500).json({ msg: "Server error" });
  }
});

// ---------------- LOGIN ----------------
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) return res.status(400).json({ msg: "Email aur password required hai" });

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ msg: "Email ya password galat hai" });

    // ✅ Google se signup kiya tha — password se login nahi ho sakta
    if (!user.password) {
      return res.status(400).json({ msg: "Yeh account Google se bana hai. Google se login karo." });
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(400).json({ msg: "Email ya password galat hai" });

    req.session.userId = user._id;
    req.session.userEmail = user.email;

    res.json({ user });
  } catch (err) {
    console.error("❌ Login error:", err);
    res.status(500).json({ msg: "Server error" });
  }
});

// ---------------- LOGOUT ----------------
router.get("/logout", (req, res) => {
  req.session.destroy();
  res.json({ success: true });
});

module.exports = router;