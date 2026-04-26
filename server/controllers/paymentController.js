const Razorpay = require("razorpay");
const crypto = require("crypto");
const Order = require("../models/Payment");
const Course = require("../models/Course");
const User = require("../models/User");

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || "test_key",
  key_secret: process.env.RAZORPAY_SECRET || "test_secret",
});

exports.createOrder = async (req, res) => {
  try {
    const { courseId } = req.body;
    const userId = req.user.id; 

    let price = 500;
    
    // Check if courseId is a valid ObjectId
    const mongoose = require("mongoose");
    if (mongoose.Types.ObjectId.isValid(courseId)) {
      const course = await Course.findById(courseId);
      if (course) {
        price = course.price;
      }
    } else {
      // Mock logic based on frontend
      if (courseId === '1') price = 499;
      if (courseId === '3') price = 299;
    }

    const options = {
      amount: price * 100, // amount in smallest currency unit (paise)
      currency: "INR",
      receipt: `receipt_order_${Math.random() * 10000}`,
    };

    const order = await razorpay.orders.create(options);

    if (!order) {
      return res.status(500).json({ error: "Some error occured creating order" });
    }

    // Save order details to DB
    const newOrder = new Order({
      user: userId,
      course: mongoose.Types.ObjectId.isValid(courseId) ? courseId : null,
      amount: price,
      paymentId: order.id,
      paymentStatus: "pending",
    });

    await newOrder.save();

    res.json({
      orderId: order.id,
      currency: order.currency,
      amount: order.amount,
      keyId: process.env.RAZORPAY_KEY_ID
    });
  } catch (error) {
    console.error("Order Creation Error:", error);
    res.status(500).json({ error: "Server error" });
  }
};

exports.verifyPayment = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    const sign = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSign = crypto
      .createHmac("sha256", process.env.RAZORPAY_SECRET || "test_secret")
      .update(sign.toString())
      .digest("hex");

    if (razorpay_signature === expectedSign) {
      // Payment is successful
      const order = await Order.findOneAndUpdate(
        { paymentId: razorpay_order_id },
        { paymentStatus: "completed" },
        { new: true }
      );
      
      if(order) {
        // Enroll user in course
        await User.findByIdAndUpdate(order.user, {
            $addToSet: { enrolledCourses: order.course }
        });
      }

      return res.status(200).json({ message: "Payment verified successfully" });
    } else {
      return res.status(400).json({ error: "Invalid signature sent!" });
    }
  } catch (error) {
    console.error("Verification Error:", error);
    res.status(500).json({ error: "Server error" });
  }
};
