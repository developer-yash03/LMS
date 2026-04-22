const express = require("express");
const router = express.Router();

const { signup,verifyOtp } = require("../controllers/signup.controller");

router.get("/", (req, res) => {
	res.json({
		message: "Signup endpoint is available",
		use: {
			signup: "POST /api/signup",
			verifyOtp: "POST /api/signup/verify-otp",
		},
	});
});

router.get("/signup", (req, res) => {
	res.json({
		message: "Use POST /api/signup to register a user",
	});
});

router.post("/", signup);
router.post("/signup", signup);
router.post("/verify-otp", verifyOtp);

module.exports = router;