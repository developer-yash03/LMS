const Razorpay = require("razorpay");
const crypto = require("crypto");
const mongoose = require("mongoose");
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

    // Razorpay does not support amounts less than 1.00 INR (100 paise)
    // If the price is 0, the frontend should handle it, but we add a safety check here.
    if (!price || price <= 0) {
      return res.status(400).json({ error: "Invalid price. This course might be free or price not set correctly." });
    }

    const options = {
      amount: Math.round(price * 100), // amount in smallest currency unit (paise), rounded to nearest integer
      currency: "INR",
      receipt: `receipt_order_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
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
      ).populate("course");
      
      if(order) {
        const user = await User.findById(order.user);
        if (user) {
          // Enroll user in course
          if (order.course && order.course._id) {
            await User.findByIdAndUpdate(order.user, {
                $addToSet: { enrolledCourses: order.course._id }
            });

            // Send Receipt Email
            const { sendReceiptEmail } = require("../utils/emailService");
            await sendReceiptEmail(user.email, user.name, {
              courseName: order.course.title || 'Course Enrollment',
              amount: order.amount,
              paymentId: order.paymentId
            });
          }
        }
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

exports.getPaymentHistory = async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    const orders = await Order.find({ user: userId, paymentStatus: 'completed' })
      .populate('course', 'title')
      .sort({ createdAt: -1 });

    const formattedOrders = orders.map(order => ({
      id: order.paymentId || order._id,
      course: order.course ? order.course.title : 'Course Enrollment',
      date: order.createdAt || new Date(),
      price: `₹${order.amount}`,
      status: 'Success'
    }));

    res.status(200).json({ success: true, data: formattedOrders });
  } catch (error) {
    console.error("Fetch Payment History Error:", error);
    res.status(500).json({ success: false, error: "Failed to fetch payment history" });
  }
};

exports.getInstructorEarnings = async (req, res) => {
  try {
    const instructorId = req.user._id;
    const { duration } = req.query; // all, 7d, 30d, 1y

    // 1. Find all courses owned by this instructor
    const courses = await Course.find({ instructor: instructorId }).select("_id title price");
    const courseIds = courses.map(c => c._id);

    // 2. Build time filter
    let timeFilter = {};
    const now = new Date();
    if (duration === "7d") {
      timeFilter = { createdAt: { $gte: new Date(new Date().setDate(now.getDate() - 7)) } };
    } else if (duration === "30d") {
      timeFilter = { createdAt: { $gte: new Date(new Date().setMonth(now.getMonth() - 1)) } };
    } else if (duration === "1y") {
      timeFilter = { createdAt: { $gte: new Date(new Date().setFullYear(now.getFullYear() - 1)) } };
    }

    // 3. Aggregate earnings per course
    const earnings = await Order.aggregate([
      {
        $match: {
          course: { $in: courseIds },
          paymentStatus: "completed",
          ...timeFilter
        }
      },
      {
        $group: {
          _id: "$course",
          totalEarned: { $sum: "$amount" },
          salesCount: { $sum: 1 }
        }
      }
    ]);

    // 4. Map results to include course titles
    const courseMap = {};
    courses.forEach(c => {
      courseMap[String(c._id)] = { title: c.title, price: c.price };
    });

    const report = earnings.map(e => ({
      courseId: e._id,
      title: courseMap[String(e._id)]?.title || "Unknown Course",
      totalEarned: e.totalEarned,
      salesCount: e.salesCount
    }));

    // Calculate total
    const total = report.reduce((sum, item) => sum + item.totalEarned, 0);

    res.json({ success: true, data: report, total });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
