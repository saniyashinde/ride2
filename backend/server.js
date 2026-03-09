require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const session = require('express-session');
const passport = require('passport');
const bcrypt = require('bcrypt');

require('./googleAuth');

const app = express();

// ======== MONGODB ========
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
  .then(() => console.log("✅ MongoDB connected"))
  .catch(err => console.error("❌ MongoDB error:", err));

// ======== CORS ========
const allowedOrigins = [
  "http://127.0.0.1:8080",
  "http://localhost:8080",
  "https://ride2-7.onrender.com",
  "https://ride2-6.onrender.com"
];

app.use(cors({
  origin: function (origin, callback) {
    // allow requests with no origin (like mobile apps, curl, Postman)
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS: " + origin));
    }
  },
  credentials: true
}));

// ======== SESSION ========
app.use(session({
  secret: process.env.SESSION_SECRET || 'session_secret',
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production', // ✅ true on Render, false on localhost
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax' // ✅ required for cross-site cookies
  }
}));

app.use(express.json());
app.use(passport.initialize());
app.use(passport.session());

// ======== ROUTES ========
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/rides', require('./routes/rideRoutes'));
app.use('/api/owner', require('./routes/ownerRoutes'));
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/driver', require('./routes/driverRoutes'));

// ======== GOOGLE AUTH ========
app.get('/auth/google',
  passport.authenticate('google', { scope: ['profile', 'email'], prompt: "select_account" })
);

app.get('/auth/google/callback',
  passport.authenticate('google', { failureRedirect: "https://ride2-7.onrender.com/signup.html" }),
  (req, res) => {
    req.session.userId = req.user._id;
    res.redirect("https://ride2-7.onrender.com/booking.html");
  }
);

// ======== START SERVER ========
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});