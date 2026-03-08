require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const session = require('express-session');
const passport = require('passport');
require('./googleAuth');

// ✅ CREATE APP FIRST
const app = express();

// ✅ NOW import routes
const rideRoutes = require("./routes/rideRoutes");

// ======== MONGODB ========
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Atlas connected"))
  .catch(err => console.error(err));
// ======== MIDDLEWARE ========
app.use(cors({
  origin: ["http://127.0.0.1:8080", "http://localhost:8080","https://ride2-6.onrender.com" ,"https://ride2-7.onrender.com"],// frontend URL
  credentials: true
}));


app.use(session({
  secret: process.env.SESSION_SECRET || 'session_secret',
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    secure: false
  }
}));
app.use(express.json());
app.use(passport.initialize());
app.use(passport.session());
// ✅ ADD THIS HERE
app.get("/", (req, res) => {
  res.send("Ride2 backend is running 🚀");
});

// ======== ROUTES ========
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/rides', require('./routes/rideRoutes'));
app.use('/api/owner', require('./routes/ownerRoutes'));
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/driver", require("./routes/driverRoutes"));
// ======== DRIVER ADD/GET (Optional) ========
const Driver = require('./models/Driver');
app.post('/api/login', async (req, res) => {
  const { email } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ msg: "Email not registered" });

    // ✅ IMPORTANT: set session
    req.session.userId = user._id;

    res.json({ msg: "Login successful", user });
  } catch (err) {
    res.status(500).json({ msg: "Server error" });
  }
});

app.post('/api/owner/drivers', async (req, res) => {
  try {
    const { name, contact } = req.body;
    if (!name || !contact) return res.status(400).json({ message: "All fields required" });

    const driver = new Driver({ name, contact });
    await driver.save();
    res.json(driver);
  } catch (err) {
    console.error("Error adding driver:", err);
    res.status(500).json({ message: "Server error" });
  }
});

app.get('/api/owner/drivers', async (req, res) => {
  try {
    const drivers = await Driver.find();
    res.json(drivers);
  } catch (err) {
    console.error("Error getting drivers:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// ======== USER SIGNUP / LOGIN ========
const User = require('./models/User');

// SIGNUP
app.post("/api/signup", async (req, res) => {
  const { email, password } = req.body;
  const existingUser = await User.findOne({ email });
  if (existingUser) return res.status(400).json({ msg: "Email exists" });

  const user = new User({ email, password });
  await user.save();

  // ✅ Set session
  req.session.userId = user._id;
  req.session.userEmail = user.email;

  res.json({ user });
});

// LOGIN


// ======== GOOGLE AUTH ========

// Login with Google
app.get('/auth/google',
  passport.authenticate('google', { scope: ['profile', 'email'], prompt: "select_account" })
);

// Google callback
app.get('/auth/google/callback',
  passport.authenticate('google', { failureRedirect: "https://ride2-6.onrender.com/login.html" }),
  (req, res) => {
    req.session.userId = req.user._id; // store logged-in user in session
   res.redirect("https://ride2-6.onrender.com/booking.html");
  }
);

// ======== START SERVER ========
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});


