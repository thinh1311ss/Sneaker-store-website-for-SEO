const jwt = require("jsonwebtoken");
const orderModel = require("../Models/OrderModel");
const productModel = require("../Models/ProductModel");

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
    console.log("postOrder called", req.body);
    const {
      user,
      orderItems,
      shippingAddress,
      note,
      orderTime,
      paymentMethod,
      totalPrice,
    } = req.body;

    if (!user || !Array.isArray(orderItems) || orderItems.length === 0) {
      return res.status(400).json({ error: "Invalid order payload" });
    }

    for (const item of orderItems) {
      const { product: productId, size, quantity } = item;
      const product = await productModel.findById(productId);
      if (!product) {
        return res
          .status(404)
          .json({ error: `Product ${productId} not found` });
      }
      if (!quantity || quantity <= 0) {
        return res
          .status(400)
          .json({ error: "Order item quantity must be greater than zero" });
      }

      if (size && typeof size === "string") {
        const currentSizeQty = Number(product.sizes?.[size] ?? 0);
        if (currentSizeQty < quantity) {
          return res
            .status(400)
            .json({ error: `Not enough stock for size ${size}` });
        }
        const updatedSizes = {
          ...product.sizes,
          [size]: currentSizeQty - Number(quantity),
        };
        const updatedQuantity = Object.values(updatedSizes).reduce(
          (sum, qty) => sum + Number(qty),
          0,
        );
        await productModel.findByIdAndUpdate(productId, {
          sizes: updatedSizes,
          quantity: updatedQuantity,
        });
      } else {
        if (product.quantity < quantity) {
          return res.status(400).json({
            error: `Not enough stock for product ${product.productName}`,
          });
        }
        await productModel.findByIdAndUpdate(productId, {
          quantity: product.quantity - Number(quantity),
        });
      }
    }

    await orderModel.create({
      user,
      orderItems,
      shippingAddress,
      note,
      orderTime,
      paymentMethod,
      totalPrice,
    });
    return res.status(200).send("create order successfully");
  } catch (error) {
    console.log("postOrder error", error);
    return res.status(500).json({ error: "Cannot create order" });
  }
};

const deleteOrder = async (req, res) => {
  try {
    const orderId = req.params.orderId;
    const deleted = await orderModel.findByIdAndDelete(orderId);
    if (!deleted) {
      return res.status(404).json({ error: "Order not found" });
    }
    return res.status(200).send("delete order successfully");
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
  getListOrder: getListOrder,
  postOrder: postOrder,
  deleteOrder: deleteOrder,
  updateOrder: updateOrder,
  getOrderDetail: getOrderDetail,
  getUserOrders: getUserOrders,
};
