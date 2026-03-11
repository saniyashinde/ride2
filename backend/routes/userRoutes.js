const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const User = require("../models/User");

// ================= GET ALL USERS (for owner dashboard) =================
// ✅ owner.html calls GET /api/users to show all users
router.get("/", async (req, res) => {
  try {
    const users = await User.find({}, { name: 1, email: 1, createdAt: 1 });
    res.json(users);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
});

// ================= SIGNUP =================
router.post("/signup", async (req, res) => {
  try {
    const { name, email, password, image } = req.body;

    if (!email || !name) {
      return res.status(400).json({ msg: "Name and email required" });
    }

    let user = await User.findOne({ email });

    // GOOGLE LOGIN — user already exists, just return
    if (user) {
      return res.json({ user });
    }

    // NORMAL SIGNUP
    let hashedPassword = null;
    if (password && password !== "google_oauth") {
      hashedPassword = await bcrypt.hash(password, 10);
    }

    user = new User({
      name,
      email,
      password: hashedPassword,
      image: image || ""
    });

    await user.save();

    req.session.userId = user._id;
    res.json({ user });

  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
});

// ================= LOGIN =================
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ msg: "Email and password required" });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ msg: "User not found" });
    }

    if (!user.password) {
      return res.status(400).json({ msg: "Login with Google" });
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(400).json({ msg: "Wrong password" });
    }

    req.session.userId = user._id;
    res.json({ user });

  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
});

// ================= LOGOUT =================
router.get("/logout", (req, res) => {
  req.session.destroy(() => {
    res.json({ msg: "Logout successful" });
  });
});

module.exports = router;
