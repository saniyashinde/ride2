const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");

const Ride = require("../models/ride");   // Ride schema must have timestamps
const User = require("../models/user");
const Driver = require("../models/Driver");

// ===============================
// 🚕 BOOK A RIDE
// ===============================
router.post("/book-ride", async (req, res) => {
  try {
    const { userId, pickup, drop, distance, fare } = req.body;
    if (!userId || !pickup || !drop || !distance || !fare) {
      return res.status(400).json({ message: "All fields required" });
    }

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    const ride = new Ride({
      userId,
      pickup,
      drop,
      distance,
      fare,
      status: "Pending",
      driverId: null
    });

    await ride.save();
    res.status(201).json({ message: "Ride booked successfully", ride });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Booking failed" });
  }
});

// ===============================
// ✅ ACCEPT RIDE
// ===============================
router.post("/accept-ride", async (req, res) => {
  try {
    const { rideId, driverId } = req.body;
    if (!rideId || !driverId) return res.status(400).json({ message: "Ride ID and Driver ID required" });

    const driver = await Driver.findById(driverId);
    if (!driver) return res.status(404).json({ message: "Driver not found" });

    const ride = await Ride.findOneAndUpdate(
      { _id: rideId, status: { $regex: /^pending$/i } },
      { driverId, status: "Ongoing", otp: Math.floor(1000 + Math.random() * 9000).toString() },
      { new: true }
    );

    if (!ride) return res.status(404).json({ message: "Ride not available" });

    res.json({ message: "Ride accepted successfully", ride });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error accepting ride" });
  }
});

// ===============================
// ✅ VERIFY OTP
// ===============================
router.post("/verify-otp", async (req, res) => {
  try {
    const { rideId, otp } = req.body;
    if (!rideId || !otp) return res.status(400).json({ success: false, message: "Missing rideId or otp" });

    const ride = await Ride.findById(rideId).populate("userId", "email");
    if (!ride) return res.status(404).json({ success: false, message: "Ride not found" });
    if (ride.status !== "Ongoing") return res.status(400).json({ success: false, message: "Ride not started or already verified" });
    if (ride.otp !== otp) return res.json({ success: false, message: "OTP incorrect" });

    ride.status = "Started";
    ride.otpVerified = true;
    ride.otp = null;
    await ride.save();

    res.json({ success: true, ride });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "OTP verification failed" });
  }
});

// ===============================
// ✅ COMPLETE RIDE
// ===============================
router.post("/complete-ride", async (req, res) => {
  try {
    const { rideId, driverId, paymentMode } = req.body;
    if (!rideId || !driverId) return res.status(400).json({ message: "Missing rideId or driverId" });

    const ride = await Ride.findById(rideId);
    if (!ride) return res.status(404).json({ message: "Ride not found" });
    if (ride.status !== "Started") return res.status(400).json({ message: "Ride not started or already completed" });
    if (ride.driverId.toString() !== driverId) return res.status(403).json({ message: "Unauthorized driver" });

    ride.status = "Completed";
    ride.paymentMode = paymentMode;
    ride.completedAt = new Date();
    await ride.save();

    await Driver.findByIdAndUpdate(driverId, { $inc: { rides: 1 } });

    res.json({ message: "Ride completed successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Completion failed" });
  }
});

// ===============================
// 📌 PENDING RIDES
// ===============================
router.get("/pending", async (req, res) => {
  try {
    const loginTime = req.query.loginTime ? new Date(req.query.loginTime) : new Date(0);

    const rides = await Ride.find({
      status: "Pending",
      createdAt: { $gte: loginTime }
    }).populate("userId", "email name phone");

    res.json(rides);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error fetching rides" });
  }
});

module.exports = router;
