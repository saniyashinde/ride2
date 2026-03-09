const express = require("express");
const router = express.Router();
const User = require("../models/user");
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
  const { email, password } = req.body;

  const user = await User.findOne({ email });
  if (!user) return res.json({ message: "Invalid email or password" });

  const match = await bcrypt.compare(password, user.password);
  if (!match) return res.json({ message: "Invalid email or password" });

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