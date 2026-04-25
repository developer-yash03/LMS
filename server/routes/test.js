const express = require("express");
const router = express.Router();

router.get("/", (req, res) => {
  res.json({
    message: "LMS API is running",
    routes: {
      health: "GET /api/test",
      signup: "POST /api/signup",
      verifySignupOtp: "POST /api/signup/verify-otp",
      login: "POST /api/auth/login",
    },
  });
});

router.get("/test", (req, res) => {
  res.json({ message: "API is working!" });
});

module.exports = router;