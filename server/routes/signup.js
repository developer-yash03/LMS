const express = require("express");
const router = express.Router();

const { signup, verifyOtp, resendOtp } = require("../controllers/signup.controller");

router.post("/", signup);
router.post("/signup", signup);
router.post("/verify-otp", verifyOtp);
router.post("/resend-otp", resendOtp);

module.exports = router;