import { nodeCache } from "../app.js";
import { Order } from "../models/order.js";
import { Product } from "../models/products.js";

export const invalidateCache = async({
  product,
  order,
  admin,
  userId,
  orderId,
  productId,
}) => {
  if (product) {
    const productKeys = [
      "latest-products",
      "categories",
      "all-products",
    ];
    if(typeof(productId) === "string"){
      productKeys.push(`product-${productId}`)
    } 
    if(typeof(productId) === "object"){
      productId.forEach((i)=>productKeys.push(`product-${i}`));
    }
    nodeCache.del(productKeys);
  }
  if (order) {
    const orderKeys = ["all-orders", `my-orders-${userId}`, `order-${orderId}`];
    nodeCache.del(orderKeys);
  }
  if (admin) {
    nodeCache.del(["admin-stats" , "admin-pie-charts" , "admin-bar-charts" ,
    "admin-line-charts"])
  }
};
