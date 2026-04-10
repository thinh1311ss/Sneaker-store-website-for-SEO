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
    const order = await orderModel.findById(id).populate("orderItems.product");
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
      return res.status(400).json({ error: "Dữ liệu đơn hàng không hợp lệ" });
    }

    // 1. Chuyển đổi userId
    let userId;
    if (mongoose.Types.ObjectId.isValid(user)) {
      userId = new mongoose.Types.ObjectId(user);
    } else {
      return res.status(400).json({ error: "Định dạng User ID không hợp lệ" });
    }

    let subtotal = 0;
    const enrichedOrderItems = [];

    // 2. Duyệt qua từng item để kiểm tra tồn kho và tính tiền
    for (const item of orderItems) {
      const { product: productId, size, quantity } = item;
      const qty = Number(quantity);

      const product = await productModel.findById(productId);

      if (!product) {
        return res
          .status(404)
          .json({ error: `Sản phẩm ID ${productId} không tồn tại` });
      }

      // Kiểm tra tồn kho theo size
      if (size) {
        const stockAvailable = product.sizes ? product.sizes[size] : 0;
        if (stockAvailable < qty) {
          return res.status(400).json({
            error: `Sản phẩm ${product.productName} size ${size} không đủ hàng (Còn lại: ${stockAvailable})`,
          });
        }

        // Cập nhật tồn kho trong Database
        const newSizes = { ...product.sizes, [size]: stockAvailable - qty };
        const newTotalQty = Object.values(newSizes).reduce(
          (a, b) => a + Number(b),
          0,
        );

        await productModel.findByIdAndUpdate(productId, {
          sizes: newSizes,
          quantity: newTotalQty,
        });
      }

      enrichedOrderItems.push({
        name: product.productName,
        quantity: qty,
        size: size || "",
        price: product.price,
        image:
          product.images && product.images.length > 0 ? product.images[0] : "",
        product: productId,
      });

      subtotal += product.price * qty;
    }

    const shipping = subtotal > 500000 ? 0 : SHIPPING_FEE;
    const totalPrice = subtotal + shipping;

    // 3. Tạo đơn hàng mới
    const newOrder = await orderModel.create({
      user: userId,
      orderItems: enrichedOrderItems,
      shippingAddress: {
        fullName: shippingAddress.fullName,
        telephone: shippingAddress.telephone,
        address: shippingAddress.address,
        email: shippingAddress.email || "",
      },
      note: note || "",
      orderTime: orderTime ? new Date(orderTime) : new Date(),
      paymentMethod,
      totalPrice: totalPrice,
      status: "pending",
    });

    // Trả về kết quả thành công cho Frontend
    return res.status(201).json({
      success: true,
      message: "Đặt hàng thành công",
      order: newOrder,
    });
  } catch (error) {
    console.error("postOrder error:", error);
    return res.status(500).json({
      error: "Lỗi hệ thống khi tạo đơn hàng",
      detail: error.message,
    });
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
