const mongoose = require("mongoose");

const rideSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },

  driverId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Driver",
    default: null
  },

  pickup: String,
  drop: String,
  distance: Number,
  fare: Number,

  status: {
    type: String,
    default: "Pending"
  },

  paymentMode: String,
  completedAt: Date

}, { timestamps: true });

module.exports =
  mongoose.models.Ride || mongoose.model("Ride", rideSchema);
