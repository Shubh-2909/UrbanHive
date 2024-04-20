import { stripe } from "../app.js";
import { Coupon } from "../models/coupon.js";
import ErrorHandler from "../utils/ErrorHandler.js";


export const createPaymentIntent = async(req , res , next) => {
  try {
    const {amount} = req.body;

    if(!amount) return next(new ErrorHandler("Please enter amount" , 400));

    const paymentIntent = await stripe.paymentIntents.create({
      amount : Number(amount) * 100,
      currency: "inr"
    })
 
    return res.status(201).json({
      success: true,
      clientSecret : paymentIntent.client_secret,
    });
  } catch (error) {
    return next(new ErrorHandler("Error in creating  a Payment", 500));
  }
}

export const newCoupon = async (req, res, next) => {
  try {
    const { code, amount } = req.body;

    if (!code || !amount) {
      return next(new ErrorHandler("Please enter all the fields", 400));
    }

    await Coupon.create({
      code,
      amount,
    });
    return res.status(201).json({
      success: true,
      message: "Coupon created successfully",
    });
  } catch (error) {
    return next(new ErrorHandler("Error in creating a new coupon", 500));
  }
};

export const applyDiscount = async (req, res, next) => {
  try {
    const { coupon } = req.query;

    const discount = await Coupon.findOne({ code: coupon });

    if (!discount) {
      return next(new ErrorHandler("Coupon Invalid", 400));
    }

    return res.status(201).json({
      success: true,
      discount: discount.amount,
    });
  } catch (error) {
    return next(new ErrorHandler("Error in applying a coupon", 500));
  }
};

export const allCoupons = async (req, res, next) => {
  try {
    const coupons = await Coupon.find({});

    if (!coupons) {
      return next(new ErrorHandler("No coupons active right now", 400));
    }

    return res.status(201).json({
      success: true,
      coupons,
    });
  } catch (error) {
    return next(new ErrorHandler("Error in fetching the coupons", 500));
  }
};

export const deleteCoupon = async (req, res, next) => {
  try {
    const { id } = req.params;
    const coupon = await Coupon.findById(id);

    if (!coupon) {
      return next(new ErrorHandler("Coupon doesn't exist", 400));
    }

    await coupon.deleteOne();

    return res.status(201).json({
      success: true,
      message: "Coupon deleted",
    });
  } catch (error) {
    return next(new ErrorHandler("Error in deleting the coupons", 500));
  }
};

