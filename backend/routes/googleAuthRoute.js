const router = require("express").Router();
const passport = require("passport");
const User = require("../models/User");
// Google login start
router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

// Google callback
router.get(
  "/google/callback",
  passport.authenticate("google", {
    failureRedirect: "http://localhost:5000/login.html",
  }),
  (req, res) => {
    // success
    req.session.userId = req.user._id; // 🔥 VERY IMPORTANT
    res.redirect("http://localhost:5000/booking.html");
  }
);

module.exports = router;
