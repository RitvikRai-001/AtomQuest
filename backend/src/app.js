import path from "path";
import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import adminCycleRouter from "./routes/adminCycle.routes.js";
import achievementRouter from "./routes/achievement.routes.js";
import checkinRouter from "./routes/checkin.routes.js";
import goalSheetRouter from "./routes/goalSheet.routes.js";

const app = express();

// --------------------
// Middleware
// --------------------
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || "http://localhost:5173",
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

app.use("/api/v1/goal-sheets", goalSheetRouter);
app.use("/api/v1/achievements", achievementRouter);
app.use("/api/v1/checkins", checkinRouter);
app.use("/api/v1/admin", adminCycleRouter);

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`,
  });
});


app.use((err, req, res, next) => {
  console.error("=== GLOBAL ERROR HANDLER ===");
  console.error(err);

  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || "Internal Server Error",
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
});

export { app };
