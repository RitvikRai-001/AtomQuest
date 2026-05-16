import path from "path";
import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import adminCycleRouter from "./routes/adminCycle.routes.js";
import achievementRouter from "./routes/achievement.routes.js";
import authRouter from "./routes/auth.routes.js";
import checkinRouter from "./routes/checkin.routes.js";
import goalSheetRouter from "./routes/goalSheet.routes.js";
import { ApiError } from "./utils/ApiError.js";
import { errorHandler } from "./middleware/error.middleware.js";

const app = express();

const defaultAllowedOrigins = [
  "http://localhost:3000",
  "http://localhost:5173",
  "http://localhost:8080",
  "http://127.0.0.1:3000",
  "http://127.0.0.1:5173",
  "http://127.0.0.1:8080",
];

const envAllowedOrigins = (process.env.CORS_ORIGIN || "")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

const allowedOrigins = [...new Set([...defaultAllowedOrigins, ...envAllowedOrigins])];

// --------------------
// Middleware
// --------------------
app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(new ApiError(403, `CORS blocked origin: ${origin}`));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Service-Key"],
  })
);


app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));
app.use("/uploads", express.static("public/uploads"));


app.get("/", (req, res) => {
  res.send("ATOMQUEST Goal Tracking API is running");
});

app.use("/api/v1/auth", authRouter);
app.use("/api/v1/goal-sheets", goalSheetRouter);
app.use("/api/v1/achievements", achievementRouter);
app.use("/api/v1/checkins", checkinRouter);
app.use("/api/v1/admin", adminCycleRouter);

app.use((req, res) => {
  throw new ApiError(404, `Route ${req.originalUrl} not found`);
});

app.use(errorHandler);

export { app };
