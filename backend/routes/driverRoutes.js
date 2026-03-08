const express = require("express");
const router = express.Router();
const Driver = require("../models/Driver");

// ===============================
// 🔍 GET ALL DRIVERS
// ===============================
router.get("/all", async (req, res) => {
  try {
    const drivers = await Driver.find({}, {
      name: 1,
      contact: 1,
      rides: 1,
      rating: 1,
      available: 1
    });

    res.json(drivers);
  } catch (err) {
    res.status(500).json({ message: "Failed to load drivers" });
  }
});


// ===============================
// 🔐 GET DRIVER BY NAME (LOGIN FIX)
// ===============================
router.get("/by-name/:name", async (req, res) => {
  try {
    const driver = await Driver.findOne({ name: req.params.name });

    if (!driver) {
      return res.status(404).json({ message: "Driver not found" });
    }

    res.json(driver);
  } catch (err) {
    console.error("❌ Driver login error:", err);
    res.status(500).json({ message: "Server error" });
  }
});


// ===============================
// 📍 UPDATE DRIVER LOCATION
// ===============================
router.post("/update-location", async (req, res) => {
  try {
    const { driverId, lat, lng } = req.body;

    await Driver.findByIdAndUpdate(driverId, { lat, lng });

    res.json({ message: "Location updated" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// ===============================
// 🗺 DRIVER LOCATION API FOR MAP
// ===============================
router.get("/locations", async (req, res) => {
  try {
    const drivers = await Driver.find(
      { lat: { $ne: null }, lng: { $ne: null } },
      { name: 1, lat: 1, lng: 1, available: 1 }
    );

    res.json(drivers);
  } catch (err) {
    console.error("❌ Driver map error:", err);
    res.status(500).json({ message: "Failed to load driver locations" });
  }
});


module.exports = router;
