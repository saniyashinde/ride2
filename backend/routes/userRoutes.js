const express = require("express");
const router = express.Router();
const User = require("../models/User");
const bcrypt = require("bcrypt");

// ---------------- SIGNUP ----------------
router.post("/signup", async (req, res) => {
  try {
    const { email, password, name, image } = req.body;

    if (!email || !password) return res.status(400).json({ msg: "Email and password required" });

    let user = await User.findOne({ email });
    if (user) return res.status(400).json({ msg: "Email already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);

    user = new User({
      email,
      password: hashedPassword,
      
    });

    await user.save();

    req.session.userId = user._id;
    req.session.userEmail = user.email;

    res.json({ user });
  } catch (err) {
    console.error("Signup error:", err);
    res.status(500).json({ msg: "Server error" });
  }
});

// ---------------- LOGIN ----------------
// LOGIN FIX
router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if(!user) return res.status(400).json({ msg: "Invalid email or password" });

  const match = await bcrypt.compare(password, user.password);
  if(!match) return res.status(400).json({ msg: "Invalid email or password" });

  req.session.userId = user._id;
  req.session.userEmail = user.email;

  res.json({ user }); // <-- must return user here
});
// ---------------- LOGOUT ----------------
router.get("/logout", (req, res) => {
  req.session.destroy();
  res.json({ success: true });
});

module.exports = router;