const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Users",
  },
  orderItems: [
    {
      name: String,
      quantity: Number,
      size: String,
      price: Number,
      image: String,
      product: {
        type: Number,
        ref: "Products",
      },
    },
  ],
  shippingAddress: {
    fullName: String,
    address: String,
    telephone: Number,
  },
  note: String,
  orderTime: Date,
  paymentMethod: String,
  totalPrice: Number,
});

const Order = mongoose.model("Order", orderSchema);
module.exports = Order;
