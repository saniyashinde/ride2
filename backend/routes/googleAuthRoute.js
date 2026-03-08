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
    failureRedirect: "https://ride2-5.onrender.com/login.html",
  }),
  (req, res) => {
    req.session.userId = req.user._id;

    res.redirect("https://ride2-5.onrender.com/booking.html");
  }
);

module.exports = router;