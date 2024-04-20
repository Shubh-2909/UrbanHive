import { nodeCache } from "../app.js";
import { Order } from "../models/order.js";
import ErrorHandler from "../utils/ErrorHandler.js";
import { invalidateCache } from "../utils/invalidateCache.js";
import { reduceStock } from "../utils/reduceStock.js";

export const newOrder = async (req, res, next) => {
  try {
    const {
      shippingInfo,
      orderItems,
      user,
      subtotal,
      tax,
      shippingCharges,
      discount,
      total,
    } = req.body;

    if (!shippingInfo || !orderItems || !user || !subtotal || !tax || !total) {
      return next(new ErrorHandler("Please fill all required fields", 400));
    }
    const order = await Order.create({
      shippingInfo,
      orderItems,
      user,
      subtotal,
      tax,
      shippingCharges,
      discount,
      total,
    });

    await reduceStock(orderItems);

    await invalidateCache({
      product: true,
      order: true,
      admin: true,
      userId: user,
      productId: order.orderItems.map((i) => String(i.productId))
    });
    return res.status(201).json({
      success: true,
      message: "Order placed sucessfully",
    });
  } catch (error) {
    return next(new ErrorHandler("Failed to create a new order", 500));
  }
};

export const myOrders = async (req, res, next) => {
  try {
    const { id: user } = req.query;
    let orders = [];
    if (nodeCache.has(`my-orders-${user}`))
      orders = JSON.parse(nodeCache.get(`my-orders-${user}`));
    else {
      orders = await Order.find({ user });
      nodeCache.set(`my-orders-${user}`, JSON.stringify(orders));
    }
    return res.status(201).json({
      success: true,
      orders,
    });
  } catch (error) {
    return next(new ErrorHandler("cannot able to retrieve your orders ", 404));
  }
};

export const allOrders = async (req, res, next) => {
  try {
    let orders = [];
    if (nodeCache.has(`all-orders`))
      orders = JSON.parse(nodeCache.get(`all-orders`));
    else {
      orders = await Order.find().populate("user", "name");
      nodeCache.set(`all-orders`, JSON.stringify(orders));
    }
    return res.status(201).json({
      success: true,
      orders,
    });
  } catch (error) {
    return next(new ErrorHandler("Error in fetching all orders", 404));
  }
};

export const getSingleOrder = async (req, res, next) => {
  try {
    const id = req.params.id;
    let order;
    if (nodeCache.has("order-${id}")) {
      order = JSON.parse(nodeCache.get("order-${id}"));
    } else {
      order = await Order.findById(id).populate("user", "name");
      if (!order) {
        return next(new ErrorHandler("order not found", 404));
      }
      nodeCache.set(`order-${id}`, JSON.stringify(order));
    }
    return res.status(201).json({
      success: true,
      order,
    });
  } catch (error) {
    return next(new ErrorHandler("Error in retrival of order", 500));
  }
};

export const processOrder = async (req, res, next) => {
  try {
    const { id } = req.params;
    const order = await Order.findById(id);
    if (!order) return next(new ErrorHandler("Order not found", 404));
    switch (order.status) {
      case "Processing":
        order.status = "Shipped";
        break;
      case "Shipped":
        order.status = "Delivered";
        break;
      default:
        order.status = "Delivered";
        break;
    }

    await order.save();
    await invalidateCache({
      product: false,
      order: true,
      admin: true,
      userId: order.user,
      orderId: order._id,
    });
    return res.status(201).json({
      success: true,
      message: "Order processed",
    });
  } catch (error) {
    return next(new ErrorHandler("Error in processing of order", 500));
  }
};

export const deleteOrder = async (req, res, next) => {
  try {
    const { id } = req.params;
    const order = await Order.findById(id);
    if (!order) return next(new ErrorHandler("Order not found", 404));

    await order.deleteOne();
    await invalidateCache({
      product: false,
      order: true,
      admin: true,
      userId: order.user,
      orderId: order._id,
    });
    return res.status(201).json({
      success: true,
      message: "Order deleted",
    });
  } catch (error) {
    return next(new ErrorHandler("Error in deletion of order", 500));
  }
};
