const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
  productName: { type: String, unique: true, required: true },

  brand: { type: String, required: true },

  price: { type: Number, required: true },
  originalPrice: { type: Number, default: null },
  discountPercent: { type: Number, default: 0 },

  category: {
    type: String,
    enum: ["Sneaker", "Chạy bộ", "Đi bộ", "Thể thao", "Khác"],
    default: "Sneaker",
  },

  description: String,
  specifications: String,
  careInstructions: String,
  storageInstructions: String,

  sizes: {
    US6: { type: Number, default: 0 },
    US6_5: { type: Number, default: 0 },
    US7: { type: Number, default: 0 },
    US7_5: { type: Number, default: 0 },
    US8: { type: Number, default: 0 },
    US8_5: { type: Number, default: 0 },
    US9: { type: Number, default: 0 },
    US9_5: { type: Number, default: 0 },
    US10: { type: Number, default: 0 },
    US10_5: { type: Number, default: 0 },
  },

  quantity: { type: Number, default: 0 },

  images: [String],
});

const Product = mongoose.model("Products", productSchema, "Product");
module.exports = Product;
