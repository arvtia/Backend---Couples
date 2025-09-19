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
const allowedOrigins = [process.env.ALLOWED_ORIGINS];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("CORS policy: origin not allowed"));
    }
  },
  credentials: true,
}));


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