import jwt from "jsonwebtoken";
import { asyncHandler } from "../utils/asyncHandler.js";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";

export const verifyJWT = asyncHandler(async (req, res, next) => {
  const token =
    req.cookies?.accessToken ||
    req.header("Authorization")?.replace("Bearer ", "");

  if (!token) {
    console.warn(`[AUTH] Missing token for ${req.method} ${req.originalUrl}`);
    throw new ApiError(401, "Unauthorized request, Token missing");
  }

  try {
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

    const user = await User.findById(decoded._id).select(
      "-password -refreshToken"
    );

    if (!user) {
      console.warn(`[AUTH] Invalid user for token on ${req.method} ${req.originalUrl}`);
      throw new ApiError(401, "Invalid access token");
    }

    req.user = user;
    next();
  } catch (error) {
    console.warn(`[AUTH] Token verification failed on ${req.method} ${req.originalUrl}: ${error?.message || 'invalid token'}`);
    throw new ApiError(401, "Token expired or invalid");
  }
});

export const authorizeRoles = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      throw new ApiError(401, "Unauthorized request");
    }

    if (!allowedRoles.includes(req.user.role)) {
      throw new ApiError(403, "You are not allowed to access this route");
    }

    next();
  };
};
