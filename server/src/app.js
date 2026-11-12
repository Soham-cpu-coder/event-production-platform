const express = require("express");
const helmet = require("helmet");
const cors = require("cors");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");

const env = require("./config/env");
const connectDB = require("./config/db");
const routes = require("./routes");
const ApiError = require("./utils/ApiError");
const { notFound, errorHandler } = require("./middleware/error");

const app = express();

// Behind Vercel's proxy: needed so rate limiting sees the real client IP.
app.set("trust proxy", 1);

const allowedOrigins = env.clientOrigin
  .split(",")
  .map((o) => o.trim().replace(/\/+$/, ""))
  .filter(Boolean);

app.use(helmet());
app.use(
  cors({
    origin(origin, callback) {
      // No Origin header = same-origin / curl / server-to-server.
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes("*") || allowedOrigins.includes(origin)) return callback(null, true);
      if (process.env.ALLOW_VERCEL_PREVIEWS === "true" && /\.vercel\.app$/.test(origin)) {
        return callback(null, true);
      }
      return callback(null, false);
    },
    methods: ["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    maxAge: 86400,
  })
);
app.use(express.json({ limit: "100kb" }));
if (env.nodeEnv !== "test") app.use(morgan(env.nodeEnv === "production" ? "combined" : "dev"));

app.get("/", (_req, res) => res.json({ success: true, service: "event-production-api", docs: "/api/health" }));

// Immediate health check route that responds even while the database is initializing
app.get("/api/health", (_req, res) => {
  const dbStates = ["disconnected", "connected", "connecting", "disconnecting"];
  const mongoose = require("mongoose");
  res.json({
    success: true,
    status: "ok",
    database: dbStates[mongoose.connection.readyState] || "unknown",
  });
});

app.use("/api", rateLimit({ windowMs: 15 * 60 * 1000, limit: 600, standardHeaders: true, legacyHeaders: false }));

// Lazily connect (and reuse the connection) so the API works both as a long-running server and on serverless.
app.use("/api", async (_req, _res, next) => {
  try {
    await connectDB();
    next();
  } catch (err) {
    console.error("Database connection failed:", err.message);
    next(new ApiError(503, "Database is temporarily unavailable"));
  }
});

app.use("/api", routes);
app.use(notFound);
app.use(errorHandler);

module.exports = app;
