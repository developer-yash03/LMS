const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },

  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Course"
  },

  amount: Number,

  paymentStatus: {
    type: String,
    enum: ["pending", "completed"],
    default: "pending"
  },

  paymentId: String,

  createdAt: { type: Date, default: Date.now }
});

// Speeds up payment history queries
orderSchema.index({ user: 1, paymentStatus: 1 });

module.exports = mongoose.model("Order", orderSchema);