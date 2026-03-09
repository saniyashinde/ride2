const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name:     { type: String, required: true },
  email:    { type: String, required: true, unique: true },
  password: { type: String, default: null },   // ✅ null for Google OAuth users
  googleId: { type: String, default: null },   // ✅ Google users ke liye
  image:    { type: String, default: "https://www.example.com/default-profile.png" },
  bookings: { type: Number, default: 0 },
}, { timestamps: true });

module.exports = mongoose.models.User || mongoose.model("User", userSchema);