require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const session = require('express-session');
const passport = require('passport');
const bcrypt = require('bcrypt');
require('./googleAuth'); // Google OAuth config

// ======== MODELS ========
const User = require('./models/User');
const Driver = require('./models/Driver');
const Ride = require('./models/Ride');

// ======== CREATE APP ========
const app = express();

// ======== MONGODB CONNECT ========
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log("✅ MongoDB Atlas connected"))
.catch(err => console.error("❌ MongoDB connection error:", err));

// ======== CORS ========
const allowedOrigins = [
  "http://127.0.0.1:8080",
  "http://localhost:8080",
  "https://ride2-6.onrender.com",
  "https://ride2-7.onrender.com"
];

app.use(cors({
  origin: function(origin, callback) {
    if (!origin) return callback(null, true); // for Postman / mobile
    if (allowedOrigins.includes(origin)) return callback(null, true);
    return callback(new Error('CORS not allowed'));
  },
  credentials: true
}));

// ======== MIDDLEWARE ========
app.use(express.json());
app.use(session({
  secret: process.env.SESSION_SECRET || 'session_secret',
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax'
  }
}));

app.use(passport.initialize());
app.use(passport.session());

// ======== ROUTES ========
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/rides', require('./routes/rideRoutes'));
app.use('/api/owner', require('./routes/ownerRoutes'));
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/driver', require('./routes/driverRoutes'));

// ======== DRIVER ADD/GET ========
app.post('/api/owner/drivers', async (req, res) => {
  const { name, contact } = req.body;
  if (!name || !contact) return res.status(400).json({ message: "All fields required" });

  try {
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

// ======== USER SIGNUP ========
app.post("/api/users/signup", async (req, res) => {
  const { email, password, name, image } = req.body;

  try {
    if (!email || !password) return res.status(400).json({ msg: "Email and password required" });

    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ msg: "Email already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new User({
      email,
      password: hashedPassword,
      name: name || "",
      image: image || ""
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

// ======== USER LOGIN ========
app.post('/api/users/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    if (!email || !password) return res.status(400).json({ msg: "Email and password required" });

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ msg: "Invalid email or password" });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(400).json({ msg: "Invalid email or password" });

    req.session.userId = user._id;
    req.session.userEmail = user.email;

    res.json({ user });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ msg: "Server error" });
  }
});

// ======== GOOGLE AUTH ========
app.get('/auth/google',
  passport.authenticate('google', { scope: ['profile', 'email'], prompt: "select_account" })
);

app.get('/auth/google/callback',
  passport.authenticate('google', { failureRedirect: "https://ride2-6.onrender.com/login.html" }),
  (req, res) => {
    req.session.userId = req.user._id;
    req.session.userEmail = req.user.email;
    res.redirect("https://ride2-6.onrender.com/booking.html");
  }
);

// ======== DEFAULT ROUTE ========
app.get("/", (req, res) => res.send("🚀 Ride2 backend is running"));

// ======== START SERVER ========
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));