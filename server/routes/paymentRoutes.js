const express = require("express");
const { createOrder, verifyPayment, getPaymentHistory, getInstructorEarnings } = require("../controllers/paymentController");
const { verifyToken } = require("../middlewares/auth");

const router = express.Router();

router.post("/create-order", verifyToken, createOrder);
router.post("/verify", verifyToken, verifyPayment);
router.get("/history", verifyToken, getPaymentHistory);
router.get("/earnings", verifyToken, getInstructorEarnings);

module.exports = router;
