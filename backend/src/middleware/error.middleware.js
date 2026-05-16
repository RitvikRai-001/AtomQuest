const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || err.status || 500;
  let message = err.message || "Internal Server Error";
  let errors = err.errors || [];

  if (err.name === "ValidationError") {
    statusCode = 400;
    message = "Validation failed";
    errors = Object.values(err.errors).map((error) => error.message);
  }

  if (err.name === "CastError") {
    statusCode = 400;
    message = `Invalid ${err.path}: ${err.value}`;
  }

  if (err.code === 11000) {
    statusCode = 409;
    const fields = Object.keys(err.keyValue || {}).join(", ");
    message = `${fields || "Value"} already exists`;
  }

  if (err.name === "JsonWebTokenError") {
    statusCode = 401;
    message = "Invalid access token";
  }

  if (err.name === "TokenExpiredError") {
    statusCode = 401;
    message = "Access token expired";
  }

  if (message.startsWith("CORS blocked origin")) {
    statusCode = 403;
  }

  console.error("=== GLOBAL ERROR HANDLER ===");
  console.error({
    method: req.method,
    url: req.originalUrl,
    statusCode,
    message,
    stack: err.stack,
  });

  return res.status(statusCode).json({
    success: false,
    message,
    errors,
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
};

export { errorHandler };
