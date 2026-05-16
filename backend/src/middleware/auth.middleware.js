import jwt from "jsonwebtoken";
import { asyncHandler } from "../utils/asyncHandler.js";
import { User } from "../models/user.model.js";

export const verifyJWT = asyncHandler(async (req, res, next) => {
  const token =
    req.cookies?.accessToken ||
    req.header("Authorization")?.replace("Bearer ", "");

  if (!token) {
    console.warn(`[AUTH] Missing token for ${req.method} ${req.originalUrl}`);
    return res.status(401).json({
      success: false,
      message: "Unauthorized request, Token missing",
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

    const user = await User.findById(decoded._id).select(
      "-password -refreshToken"
    );

    if (!user) {
      console.warn(`[AUTH] Invalid user for token on ${req.method} ${req.originalUrl}`);
      return res.status(401).json({
        success: false,
        message: "Invalid access token",
      });
    }

    req.user = user;
    next();
  } catch (error) {
    console.warn(`[AUTH] Token verification failed on ${req.method} ${req.originalUrl}: ${error?.message || 'invalid token'}`);
    return res.status(401).json({
      success: false,
      message: "Token expired or invalid",
    });
  }
});

export const authorizeRoles = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized request",
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: "You are not allowed to access this route",
      });
    }

    next();
  };
};
