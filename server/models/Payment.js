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

module.exports = mongoose.model("Order", orderSchema);