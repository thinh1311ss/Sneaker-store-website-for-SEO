const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Users",
    required: true,
  },
  orderItems: [
    {
      name: { type: String, required: true },
      quantity: { type: Number, required: true },
      size: { type: String },
      price: { type: Number, required: true },
      image: { type: String },
      product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Products",
        required: true,
      },
    },
  ],
  shippingAddress: {
    fullName: { type: String, required: true },
    address: { type: String, required: true },
    telephone: { type: String, required: true },
  },
  note: { type: String },
  orderTime: { type: Date, default: Date.now },
  paymentMethod: { type: String, required: true },
  totalPrice: { type: Number, required: true },
  status: { type: String, default: "pending" },
});

const Order = mongoose.model("Order", orderSchema);
module.exports = Order;
