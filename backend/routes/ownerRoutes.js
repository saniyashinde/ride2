const express = require("express");
const router = express.Router();
const Driver = require("../models/Driver");
const User = require("../models/User");
const Ride = require("../models/Ride");

/* ===============================
   ADD DRIVER
=============================== */
router.post("/drivers", async (req, res) => {
  try {
    const { name, contact } = req.body;

    if (!name || !contact) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const existingDriver = await Driver.findOne({ name });
    if (existingDriver) {
      return res.status(400).json({ message: "Driver already exists" });
    }

    const driver = new Driver({
      name,
      contact,
      available: true,
      rides: 0,
      rating: 5
    });

    await driver.save();
    res.json(driver);

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

/* ===============================
   GET ALL DRIVERS
=============================== */
router.get("/drivers", async (req, res) => {
  try {
    const drivers = await Driver.find();
    res.json(drivers);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

/* ===============================
   GET ALL USERS WITH RIDE SUMMARY
=============================== */
router.get("/users", async (req, res) => {
  try {
    const users = await User.find();

    const result = await Promise.all(
      users.map(async (u) => {

        const total = await Ride.countDocuments({ userId: u._id });

        const completed = await Ride.countDocuments({
          userId: u._id,
          status: "Completed"
        });

        const cancelled = await Ride.countDocuments({
          userId: u._id,
          status: "Cancelled"
        });

        return {
          email: u.email,
          total,
          completed,
          cancelled
        };
      })
    );

    res.json(result);

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

/* ===============================
   GET ACTIVE RIDES
=============================== */
router.get("/active-rides", async (req, res) => {
  try {
    const rides = await Ride.find({
      status: { $in: ["pending", "ongoing"] }
    })
    .populate("userId", "email")
    .populate("driverId", "name");

    res.json(rides);

  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

/* ===============================
   GET COMPLETED SUMMARY
=============================== */
router.get("/completed-summary", async (req, res) => {
  try {
    const completedRides = await Ride.find({ status: "Completed" });

    const driverMap = {};
    const userMap = {};

    completedRides.forEach(r => {

      if (r.driverId) {
        driverMap[r.driverId] = (driverMap[r.driverId] || 0) + 1;
      }

      if (r.userId) {
        userMap[r.userId] = (userMap[r.userId] || 0) + 1;
      }
    });

    res.json({ driverMap, userMap });

  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

/* ===============================
   SIGNUP STATS
=============================== */
router.get("/stats", async (req, res) => {
  try {
    const users = await User.find();

    const signupCounts = {};

    users.forEach(u => {
      if (u.createdAt) {
        const date = u.createdAt.toISOString().split("T")[0];
        signupCounts[date] = (signupCounts[date] || 0) + 1;
      }
    });

    const signups = Object.keys(signupCounts).map(date => ({
      date,
      count: signupCounts[date]
    }));

    res.json({ signups });

  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
