// Middleware to makesure only admin is allowed

import { User } from "../models/user.js";
import ErrorHandler from "./error.js";

export const adminOnly = async (req, res , next) => {
  try {
    const { id } = req.query;
    if (!id) return next(new ErrorHandler("Do Login first", 401));
    const user = await User.findById(id);
    if (!user) {
      return next(
        new ErrorHandler("Id is not matching with our databases", 401)
      );
    }
    if (user.role !== "admin") {
      return next(new ErrorHandler("You are not a Admin", 401));
    }
    next();
  } catch (error) {
    return new ErrorHandler("Problem in verfying that you are admin or not" , 500)
  }
};

// query api
// "api/v1/user/dgajhgiu?key=24"   Here query.params has key=24
