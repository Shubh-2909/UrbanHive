import { nodeCache } from "../app.js";
import { Order } from "../models/order.js";
import { Product } from "../models/products.js";
import { User } from "../models/user.js";
import ErrorHandler from "../utils/ErrorHandler.js";
import { calculatePercentage } from "../utils/calculatePercentage.js";

export const getDashboardStats = async (req, res, next) => {
  try {
    let stats = {};
    if (nodeCache.has("admin-stats")) {
      stats = JSON.parse(nodeCache.get("admin-stats"));
    } else {
      const today = new Date();
      const sixMonthAgo = new Date();
      sixMonthAgo.setMonth(sixMonthAgo.getMonth() - 6);

      const startOfThisMonth = new Date(
        today.getFullYear(),
        today.getMonth(),
        1
      );
      const startOfLastMonth = new Date(
        today.getFullYear(),
        today.getMonth() - 1,
        1
      );
      const endOfLastMonth = new Date(today.getFullYear(), today.getMonth(), 0); // nov 0 means 31st october
      // End of this month is today only because we are fetching till now date
      const endOfThisMonth = today;

      const thisMonthProducts = Product.find({
        createdAt: {
          $gte: startOfThisMonth,
          $lte: endOfThisMonth,
        },
      });

      const lastMonthProducts = Product.find({
        createdAt: {
          $gte: startOfLastMonth,
          $lte: endOfLastMonth,
        },
      });

      const thisMonthUsers = User.find({
        createdAt: {
          $gte: startOfThisMonth,
          $lte: endOfThisMonth,
        },
      });

      const lastMonthUsers = User.find({
        createdAt: {
          $gte: startOfLastMonth,
          $lte: endOfLastMonth,
        },
      });

      const thisMonthOrders = Order.find({
        createdAt: {
          $gte: startOfThisMonth,
          $lte: endOfThisMonth,
        },
      });

      const lastMonthOrders = Order.find({
        createdAt: {
          $gte: startOfLastMonth,
          $lte: endOfLastMonth,
        },
      });

      const lastSixMonthOrders = Order.find({
        createdAt: {
          $gte: sixMonthAgo,
          $lte: today,
        },
      });

      const latestTransactions = Order.find({})
        .select(["orderItems", "discount", "total", "status"])
        .limit(4);

      const [
        thisMonthOrdersRes,
        thisMonthProductsRes,
        thisMonthUsersRes,
        lastMonthOrdersRes,
        lastMonthProductsRes,
        lastMonthUsersRes,
        productsCountRes,
        usersCountRes,
        allOrdersRes,
        lastSixMonthOrdersRes,
        categories,
        femaleUsersCount,
        latestTransactionsRes,
      ] = await Promise.all([
        thisMonthOrders,
        thisMonthProducts,
        thisMonthUsers,
        lastMonthOrders,
        lastMonthProducts,
        lastMonthUsers,
        Product.countDocuments(),
        User.countDocuments(),
        Order.find({}).select("total"),
        lastSixMonthOrders,
        Product.distinct("category"),
        User.countDocuments({ gender: "female" }),
        latestTransactions,
      ]);

      const thisMonthRevenue = thisMonthOrdersRes.reduce(
        (total, order) => total + (order.total || 0),
        0
      );
      const lastMonthRevenue = lastMonthOrdersRes.reduce(
        (total, order) => total + (order.total || 0),
        0
      );

      const productChangePercent = calculatePercentage(
        thisMonthProductsRes.length,
        lastMonthProductsRes.length
      );
      const userChangePercent = calculatePercentage(
        thisMonthUsersRes.length,
        lastMonthUsersRes.length
      );
      const orderChangePercent = calculatePercentage(
        thisMonthOrdersRes.length,
        lastMonthOrdersRes.length
      );
      const revenueChangePercent = calculatePercentage(
        thisMonthRevenue,
        lastMonthRevenue
      );

      const revenue = allOrdersRes.reduce(
        (total, order) => total + (order.total || 0),
        0
      );

      const count = {
        revenue,
        user: usersCountRes,
        product: productsCountRes,
        order: allOrdersRes.length,
      };

      const orderMonthCounts = new Array(6).fill(0);
      const orderMonthlyRevenue = new Array(6).fill(0);

      lastSixMonthOrdersRes.forEach((order) => {
        const creationDate = order.createdAt;
        const monthDiff =
          (today.getMonth() - creationDate.getMonth() + 12) % 12;

        if (monthDiff < 6) {
          orderMonthCounts[6 - monthDiff - 1] += 1;
          orderMonthlyRevenue[6 - monthDiff - 1] += order.total;
        }
      });

      const categoriesCountPromise = categories.map((category) =>
        Product.countDocuments({ category })
      );

      const categoriesCount = await Promise.all(categoriesCountPromise);

      const categoryCount = [];

      categories.forEach((category, i) => {
        categoryCount.push({
          [category]: Math.round((categoriesCount[i] / productsCountRes) * 100),
        });
      });

      const userRatio = {
        male: usersCountRes - femaleUsersCount,
        female: femaleUsersCount,
      };

      const modifiedLatestTransaction = latestTransactionsRes.map((i) => ({
        _id: i._id,
        discount: i.discount,
        amount: i.total,
        quantity: i.orderItems.length,
        status: i.status,
      }));

      stats = {
        productChangePercent,
        userChangePercent,
        orderChangePercent,
        revenueChangePercent,
        count,
        chart: {
          order: orderMonthCounts,
          revenue: orderMonthlyRevenue,
        },
        userRatio,
        latestTransactionsRes: modifiedLatestTransaction,
      };

      nodeCache.set("admin-stats", JSON.stringify(stats));
    }

    return res.status(200).json({
      success: true,
      stats,
    });
  } catch (error) {
    return next(new ErrorHandler("Error in fetching dashboard stats", 500));
  }
};

export const getPieCharts = async (req, res, next) => {
  try {
    let charts;
    if (nodeCache.has("admin-pie-charts")) {
      charts = JSON.parse(nodeCache.get("admin-pie-charts"));
    } else {
      const [
        processingOrder,
        shippedOrder,
        deliveredOrder,
        categories,
        productsCount,
        productsOutofStock,
        allOrders,
        allUsers,
        adminUsers,
        customerUsers,
      ] = await Promise.all([
        Order.countDocuments({ status: "Processing" }),
        Order.countDocuments({ status: "Shipped" }),
        Order.countDocuments({ status: "Delivered" }),
        Product.distinct("category"),
        Product.countDocuments(),
        Product.countDocuments({ stock: 0 }),
        Order.find({}).select([
          "total",
          "discount",
          "subtotal",
          "tax",
          "shippingCharges",
        ]),
        User.find({}).select(["dob"]),
        User.countDocuments({ role: "admin" }),
        User.countDocuments({ role: "user" }),
      ]);

      const orderFullfillment = {
        processing: processingOrder,
        shipped: shippedOrder,
        delivered: deliveredOrder,
      };

      const categoriesCountPromise = categories.map((category) =>
        Product.countDocuments({ category })
      );

      const categoriesCount = await Promise.all(categoriesCountPromise);

      const categoryCount = [];

      categories.forEach((category, i) => {
        categoryCount.push({
          [category]: Math.round((categoriesCount[i] / productsCount) * 100),
        });
      });

      const stockAvailability = {
        inStock: productsCount - productsOutofStock,
        outOfStock: productsOutofStock,
      };

      const grossIncome = allOrders.reduce(
        (prev, order) => prev + (order.total || 0),
        0
      );

      const discount = allOrders.reduce(
        (prev, order) => prev + (order.discount || 0),
        0
      );

      const productionCost = allOrders.reduce(
        (prev, order) => prev + (order.shippingCharges || 0),
        0
      );

      const burnt = allOrders.reduce(
        (prev, order) => prev + (order.tax || 0),
        0
      );

      const marketingCost = Math.round(grossIncome * (30 / 100));

      const netMargin =
        grossIncome - discount - productionCost - burnt - marketingCost;

      const revenueDistribution = {
        netMargin,
        discount,
        productionCost,
        burnt,
        marketingCost,
      };

      const usersAgeGroup = {
        teen: allUsers.filter((i) => i.age < 20).length,
        adult: allUsers.filter((i) => i.age >= 20 && i.age < 40).length,
        old: allUsers.filter((i) => i.age >= 40).length,
      };

      const adminCustomer = {
        admin: adminUsers,
        customer: customerUsers,
      };

      charts = {
        orderFullfillment,
        categoryCount,
        stockAvailability,
        revenueDistribution,
        usersAgeGroup,
        adminCustomer,
      };

      nodeCache.set("admin-pie-charts", JSON.stringify(charts));
    }
    return res.status(200).json({
      success: true,
      charts,
    });
  } catch (error) {
    return next(new ErrorHandler("Error in fetching Pie chart stats", 500));
  }
};

export const getBarCharts = async (req, res, next) => {
  try {
    let charts;
    const key = "admin-bar-chart";

    if (nodeCache.has(key)) {
      charts = JSON.parse(nodeCache.get(key));
    } else {
      const today = new Date();
      const sixMonthsAgo = new Date();
      sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
      const twelveMonthsAgo = new Date();
      twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);

      const sixMonthProductPromise = Product.find({
        createdAt: {
          $gte: sixMonthsAgo,
          $lte: today,
        },
      }).select("createdAt");

      const sixMonthUserPromise = User.find({
        createdAt: {
          $gte: sixMonthsAgo,
          $lte: today,
        },
      }).select("createdAt");

      const twelveMonthOrderPromise = Order.find({
        createdAt: {
          $gte: twelveMonthsAgo,
          $lte: today,
        },
      }).select("createdAt");

      const [products, users, orders] = await Promise.all([
        sixMonthProductPromise,
        sixMonthUserPromise,
        twelveMonthOrderPromise,
      ]);

      const dataForProducts = new Array(6).fill(0);

      products.forEach((order) => {
        const creationDate = order.createdAt;
        const monthDiff =
          (today.getMonth() - creationDate.getMonth() + 12) % 12;

        if (monthDiff < 6) {
          dataForProducts[6 - monthDiff - 1] += 1;
        }
      });

      const dataForUsers = new Array(6).fill(0);

      users.forEach((order) => {
        const creationDate = order.createdAt;
        const monthDiff =
          (today.getMonth() - creationDate.getMonth() + 12) % 12;

        if (monthDiff < 6) {
          dataForUsers[6 - monthDiff - 1] += 1;
        }
      });

      const dataForOrders = new Array(12).fill(0);

      orders.forEach((order) => {
        const creationDate = order.createdAt;
        const monthDiff =
          (today.getMonth() - creationDate.getMonth() + 12) % 12;

        if (monthDiff < 12) {
          dataForOrders[12 - monthDiff - 1] += 1;
        }
      });
 
      charts = {
        users : dataForUsers,
        products : dataForProducts,
        orders: dataForOrders
      };

      nodeCache.set(key, JSON.stringify(charts));
    }

    return res.status(200).json({
      success: true,
      charts,
    });
  } catch (error) {
    return next(new ErrorHandler("Error in fetching Bar chart stats", 500));
  }
};


export const getLineCharts = async (req, res, next) => {
  try {
    let charts;
    const key = "admin-line-chart";

    if (nodeCache.has(key)) {
      charts = JSON.parse(nodeCache.get(key));
    } else {
      const today = new Date();
      const twelveMonthsAgo = new Date();
      twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);

      const twelveMonthProductPromise = Product.find({
        createdAt: {
          $gte: twelveMonthsAgo,
          $lte: today,
        },
      }).select("createdAt");

      const twelveMonthUserPromise = User.find({
        createdAt: {
          $gte: twelveMonthsAgo,
          $lte: today,
        },
      }).select("createdAt");

      const twelveMonthOrderPromise = Order.find({
        createdAt: {
          $gte: twelveMonthsAgo,
          $lte: today,
        },
      }).select(["createdAt" ,"discount" , "total"]);

      const [products, users, orders] = await Promise.all([
        twelveMonthProductPromise,
        twelveMonthUserPromise,
        twelveMonthOrderPromise,
      ]);

      const dataForProducts = new Array(12).fill(0);

      products.forEach((order) => {
        const creationDate = order.createdAt;
        const monthDiff =
          (today.getMonth() - creationDate.getMonth() + 12) % 12;

        if (monthDiff < 12) {
          dataForProducts[12 - monthDiff - 1] += 1;
        }
      });

      const dataForUsers = new Array(12).fill(0);

      users.forEach((order) => {
        const creationDate = order.createdAt;
        const monthDiff =
          (today.getMonth() - creationDate.getMonth() + 12) % 12;

        if (monthDiff < 12) {
          dataForUsers[12 - monthDiff - 1] += 1;
        }
      });

      const dataForDiscount = new Array(12).fill(0);

      orders.forEach((order) => {
        const creationDate = order.createdAt;
        const monthDiff =
          (today.getMonth() - creationDate.getMonth() + 12) % 12;

        if (monthDiff < 12) {
          dataForDiscount[12 - monthDiff - 1] += order["discount"];
        }
      });

      const dataForRevenue = new Array(12).fill(0);

      orders.forEach((order) => {
        const creationDate = order.createdAt;
        const monthDiff =
          (today.getMonth() - creationDate.getMonth() + 12) % 12;

        if (monthDiff < 12) {
          dataForRevenue[12 - monthDiff - 1] += order["total"];
        }
      });

      charts = {
        users: dataForUsers,
        products: dataForProducts,
        discount: dataForDiscount,
        revenue: dataForRevenue
      };

      nodeCache.set(key, JSON.stringify(charts));
    }
    return res.status(200).json({
      success: true,
      charts,
    });
  } catch (error) {
    return next(new ErrorHandler("Error in fetching Line charts stats", 500));
  }
};
