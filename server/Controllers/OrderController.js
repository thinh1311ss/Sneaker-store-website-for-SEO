const mongoose = require("mongoose");
const orderModel = require("../Models/OrderModel");
const productModel = require("../Models/ProductModel");

const SHIPPING_FEE = 30000;

const getListOrder = async (req, res) => {
  try {
    const orders = await orderModel.find().populate("user", "userName email");
    return res.status(200).send(orders);
  } catch (error) {
    console.log("getListOrder error", error);
    return res.status(500).json({ error: "Cannot fetch orders" });
  }
};

const getOrderDetail = async (req, res) => {
  try {
    const { id } = req.params;
    const order = await orderModel.findById(id);
    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }
    return res.status(200).send(order);
  } catch (error) {
    console.log("getOrderDetail error", error);
    return res.status(500).json({ error: "Cannot fetch order detail" });
  }
};

const getUserOrders = async (req, res) => {
  try {
    const { id } = req.params;
    const orders = await orderModel
      .find({ user: id })
      .populate("orderItems.product");
    return res.status(200).send(orders);
  } catch (error) {
    console.log("getUserOrders error", error);
    return res.status(500).json({ error: "Cannot fetch user orders" });
  }
};

const postOrder = async (req, res) => {
  try {
    const {
      user,
      orderItems,
      shippingAddress,
      note,
      orderTime,
      paymentMethod,
    } = req.body;

    if (!user || !Array.isArray(orderItems) || orderItems.length === 0) {
      return res.status(400).json({ error: "Invalid order payload" });
    }

    // 1. Chuyển đổi userId
    let userId;
    if (mongoose.Types.ObjectId.isValid(user)) {
      userId = new mongoose.Types.ObjectId(user);
    } else {
      return res.status(400).json({ error: "Invalid user ID format" });
    }

    let subtotal = 0;
    const enrichedOrderItems = [];

    // 2. Lặp qua từng item để check stock và tính tiền
    for (const item of orderItems) {
      const { product: productId, size, quantity } = item;
      const qty = Number(quantity);

      // Tìm sản phẩm theo trường 'id' (Number)
      const product = await productModel.findOne({ id: Number(productId) });

      if (!product) {
        return res
          .status(404)
          .json({ error: `Sản phẩm ID ${productId} không tồn tại` });
      }

      // Check tồn kho theo size
      if (size) {
        const stockAvailable = product.sizes ? product.sizes[size] : 0;
        if (stockAvailable < qty) {
          return res.status(400).json({
            error: `Sản phẩm ${product.productName} size ${size} không đủ hàng`,
          });
        }

        // Cập nhật tồn kho
        const newSizes = { ...product.sizes, [size]: stockAvailable - qty };
        const newTotalQty = Object.values(newSizes).reduce((a, b) => a + b, 0);

        await productModel.findOneAndUpdate(
          { id: Number(productId) },
          { sizes: newSizes, quantity: newTotalQty },
        );
      }

      enrichedOrderItems.push({
        name: product.productName,
        quantity: qty,
        size: size || "",
        price: product.price,
        image:
          product.images && product.images.length > 0 ? product.images[0] : "",
        product: Number(productId),
      });

      subtotal += product.price * qty;
    }

    const shipping = subtotal > 500000 ? 0 : SHIPPING_FEE;
    const finalPrice = subtotal + shipping;

    // 3. Tạo đơn hàng mới
    const newOrder = await orderModel.create({
      user: userId,
      orderItems: enrichedOrderItems,
      shippingAddress: {
        fullName: shippingAddress.fullName,
        telephone: Number(shippingAddress.telephone),
        address: shippingAddress.address,
        email: shippingAddress.email || "",
      },
      note: note || "",
      orderTime: orderTime ? new Date(orderTime) : new Date(),
      paymentMethod,
      totalPrice,
      status: "pending",
    });
  } catch (error) {
    console.error("postOrder error:", error);
    return res
      .status(500)
      .json({ error: "Internal Server Error", detail: error.message });
  }
};

const deleteOrder = async (req, res) => {
  try {
    const { orderId } = req.params;
    const deleted = await orderModel.findByIdAndDelete(orderId);
    if (!deleted) {
      return res.status(404).json({ error: "Order not found" });
    }
    return res.status(200).json({ message: "Order deleted successfully" });
  } catch (error) {
    console.log("deleteOrder error", error);
    return res.status(500).json({ error: "Cannot delete order" });
  }
};

const updateOrder = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status } = req.body;

    const updatedOrder = await orderModel.findByIdAndUpdate(
      orderId,
      { status },
      { new: true },
    );

    if (!updatedOrder) {
      return res.status(404).json({ error: "Order not found" });
    }

    return res.status(200).json({
      success: true,
      message: "Order updated successfully",
      data: updatedOrder,
    });
  } catch (error) {
    console.log("updateOrder error", error);
    return res.status(500).json({ error: "Cannot update order" });
  }
};

module.exports = {
  getListOrder,
  postOrder,
  deleteOrder,
  updateOrder,
  getOrderDetail,
  getUserOrders,
};
