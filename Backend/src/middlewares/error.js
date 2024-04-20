import ErrorHandler from "../utils/ErrorHandler.js";

export const errorMiddleware = (err, req, res, next) => {
  const errorHandler = new ErrorHandler(err.message || "Internal Server Error", err.statusCode || 500);
  return res.status(400).json({
    success: false,
    message: errorHandler.message,
  });
};

export default ErrorHandler;
