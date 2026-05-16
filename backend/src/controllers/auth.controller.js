import { asyncHandler } from "../utils/asyncHandler.js";
import { User } from "../models/user.model.js";
import "../models/department.model.js";
import { ApiError } from "../utils/ApiError.js";

const loginUser = asyncHandler(async (req, res) => {
  const { email, password, role } = req.body;

  if (!email || !password || !role) {
    throw new ApiError(400, "Email, password and role are required");
  }

  if (!["employee", "manager", "admin"].includes(role)) {
    throw new ApiError(400, "Invalid role selected");
  }

  const user = await User.findOne({ email: email.toLowerCase().trim() });

  if (!user) {
    throw new ApiError(401, "Invalid email or password");
  }

  if (user.role !== role) {
    throw new ApiError(403, `This account is not registered as ${role}`);
  }

  if (!user.isActive) {
    throw new ApiError(403, "This account is inactive");
  }

  const isPasswordCorrect = await user.isPasswordCorrect(password);

  if (!isPasswordCorrect) {
    throw new ApiError(401, "Invalid email or password");
  }

  const accessToken = user.generateAccessToken();
  const refreshToken = user.generateRefreshToken();

  user.refreshToken = refreshToken;
  user.lastLogin = new Date();
  await user.save({ validateBeforeSave: false });

  const safeUser = await User.findById(user._id)
    .select("-password -refreshToken")
    .populate("departmentId", "name code")
    .populate("managerId", "fullname email role");

  return res
    .status(200)
    .cookie("accessToken", accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
    })
    .json({
      success: true,
      message: "Login successful",
      data: {
        user: safeUser,
        accessToken,
      },
    });
});

const getCurrentUser = asyncHandler(async (req, res) => {
  return res.status(200).json({
    success: true,
    data: {
      user: req.user,
    },
  });
});

const logoutUser = asyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(req.user._id, {
    $unset: {
      refreshToken: 1,
    },
  });

  return res
    .status(200)
    .clearCookie("accessToken")
    .json({
      success: true,
      message: "Logout successful",
    });
});

export { loginUser, getCurrentUser, logoutUser };
