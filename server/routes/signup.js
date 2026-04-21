const express = require("express");
const router = express.Router();

const { signup,verifyOtp } = require("../controllers/signup.controller");

router.post("/", signup);
router.post("/signup", signup);
router.post("/verify-otp", verifyOtp);

module.exports = router;