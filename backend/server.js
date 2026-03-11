require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');   // ✅ keep only this one
const session = require('express-session');
const passport = require('passport');

require('./googleAuth');

const app = express();

const rideRoutes = require("./routes/rideRoutes");


// ======== MONGODB ========
require("dotenv").config()
require("dotenv").config()
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => {
  console.log("✅ MongoDB Atlas connected");
})
.catch((err) => {
  console.log("❌ MongoDB connection error:", err);
});
// ======== CORS ========
const allowedOrigins = [
  "http://127.0.0.1:8080",
  "http://localhost:8080",
  "https://ride2-6.onrender.com",
  "https://ride2-7.onrender.com"
];

app.use(cors({
  origin: function(origin, callback) {
    if (!origin) return callback(null, true); // Postman / mobile
    if (allowedOrigins.includes(origin)) return callback(null, true);
    return callback(new Error('CORS not allowed'));
  },
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


// ======== ROUTES ========
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/rides', require('./routes/rideRoutes'));
app.use('/api/owner', require('./routes/ownerRoutes'));
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/driver", require("./routes/driverRoutes"));


// ======== MODELS ========
const Driver = require('./models/Driver');
const User = require('./models/User');


// ======== LOGIN API ========
app.post("/api/login", async (req, res) => {

  try {

    const { email, password } = req.body;

    if(!email || !password)
      return res.status(400).json({ msg: "Email & password required" });

    const user = await User.findOne({ email });

    if(!user)
      return res.status(400).json({ msg: "Invalid email or password" });

    if(!user.password)
      return res.status(400).json({ msg: "Please login with Google" });

    const bcrypt = require('bcrypt');

    const match = await bcrypt.compare(password, user.password);

    if(!match)
      return res.status(400).json({ msg: "Invalid email or password" });

    req.session.userId = user._id;
    req.session.userEmail = user.email;

    res.json({ user });

  } catch(err) {

    console.error("Login error:", err);

    res.status(500).json({ msg: "Server error" });

  }

});


// ======== OWNER DRIVER APIs ========
app.post('/api/owner/drivers', async (req, res) => {

  try {

    const { name, contact } = req.body;

    if (!name || !contact)
      return res.status(400).json({ message: "All fields required" });

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


// ======== SIGNUP ========
const bcrypt = require('bcrypt');

app.post("/api/signup", async (req, res) => {

  try {

    const { name, email, password } = req.body;

    if(!email || !password)
      return res.status(400).json({ msg: "Email & password required" });

    const existingUser = await User.findOne({ email });

    if(existingUser)
      return res.status(400).json({ msg: "Email exists" });

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new User({
      name,
      email,
      password: hashedPassword
    });

    await user.save();

    req.session.userId = user._id;
    req.session.userEmail = user.email;

    res.json({ user });

  } catch(err) {

    console.error("Signup error:", err);

    res.status(500).json({ msg: "Server error" });

  }

});


// ======== GOOGLE AUTH ========
app.get(
  '/auth/google',
  passport.authenticate('google', {
    scope: ['profile', 'email'],
    prompt: "select_account"
  })
);

app.get(
  '/auth/google/callback',
  passport.authenticate('google', {
    failureRedirect: "https://ride2-7.onrender.com/signup.html"
  }),
  (req, res) => {

    req.session.userId = req.user._id;

    res.redirect("https://ride2-7.onrender.com/booking.html");

  }
);


// ======== START SERVER ========
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {

  console.log(`✅ Server running on http://localhost:${PORT}`);

});