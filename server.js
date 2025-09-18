// ─────────────────────────────────────────────────────────────────────────────
// Express server setup with robust, environment-driven CORS.
// ─────────────────────────────────────────────────────────────────────────────

const express  = require("express");
const cors     = require("cors");
const mongoose = require("mongoose");
require("dotenv").config();

const app  = express();
const port = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI;

// ─────────────────────────────────────────────────────────────────────────────
// 1. CORS Configuration
//    - Allowed origins read from .env: ALLOWED_ORIGINS="https://a,https://b"
//    - Normalizes incoming origin via URL parsing
//    - Allows non-browser clients (no Origin header)
//    - Enables credentials (cookies, auth headers)
// ─────────────────────────────────────────────────────────────────────────────
const rawOrigins = process.env.ALLOWED_ORIGINS || "";
const allowedOrigins = rawOrigins
  .split(",")
  .map((o) => o.trim())
  .filter((o) => o.length > 0);

const corsOptions = {
  origin: (incomingOrigin, callback) => {
    // Allow tools like curl, Postman, or server-to-server
    if (!incomingOrigin) {
      return callback(null, true);
    }

    let originToCheck;
    try {
      originToCheck = new URL(incomingOrigin).origin;
    } catch {
      return callback(
        new Error(`CORS error: invalid origin "${incomingOrigin}"`),
        false
      );
    }

    if (allowedOrigins.includes(originToCheck)) {
      return callback(null, true);
    }

    callback(
      new Error(`CORS policy: origin "${originToCheck}" not allowed`),
      false
    );
  },
  credentials: true,
};

app.use(cors(corsOptions));

// ─────────────────────────────────────────────────────────────────────────────
// 2. Built-in Middleware
// ─────────────────────────────────────────────────────────────────────────────
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ─────────────────────────────────────────────────────────────────────────────
// 3. MongoDB Connection
// ─────────────────────────────────────────────────────────────────────────────
mongoose
  .connect(MONGO_URI)
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => console.error("❌ MongoDB connection error:", err));

// ─────────────────────────────────────────────────────────────────────────────
// 4. Route Definitions
// ─────────────────────────────────────────────────────────────────────────────
const authRoutes     = require("./routes/authRoutes");
const coupleRoutes   = require("./routes/coupleRoutes");
const activityRoutes = require("./routes/activityRoutes");
const tokenRoutes    = require("./routes/tokenRoutes");
const postRoutes     = require("./routes/postRoutes");
const uploadRoutes   = require("./routes/uploadRoutes");
const streakRoutes   = require("./routes/streakRoutes");

app.use("/api/auth",     authRoutes);     // → /api/auth/
app.use("/api/couple",   coupleRoutes);   // → /api/couple/:coupleId
app.use("/api/activity", activityRoutes); // → /api/activity/:coupleId
app.use("/api/tokens",   tokenRoutes);    // → /api/tokens/:coupleId
app.use("/api/posts",    postRoutes);     // → /api/posts?coupleId=...&visibility=...
app.use("/api/upload",   uploadRoutes);   // → /api/upload
app.use("/api/streak",   streakRoutes);   // → /api/streak

// ─────────────────────────────────────────────────────────────────────────────
// 5. Health Check Endpoint
// ─────────────────────────────────────────────────────────────────────────────
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "ok",
    uptime: `${process.uptime().toFixed(0)}s`,
    timestamp: new Date().toISOString(),
    message: "Backend is healthy",
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 6. Start Server
// ─────────────────────────────────────────────────────────────────────────────
app.listen(port, () => {
  console.log(`Server listening on http://localhost:${port}`);
});