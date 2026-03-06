const mongoose = require("mongoose");

const driverSchema = new mongoose.Schema({
  name: String,
  contact: String,

  rides: { type: Number, default: 0 },
  rating: { type: Number, default: 5 },
  available: { type: Boolean, default: true },

  // 🔥 REQUIRED FOR MAP
  lat: Number,
  lng: Number
});

module.exports = mongoose.model("Driver", driverSchema);
