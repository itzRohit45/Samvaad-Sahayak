require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");
const morgan = require("morgan");
const bodyParser = require("body-parser");
const apiRoutes = require("./routes/apiRoutes");
const { processQuery } = require("./services/queryProcessor");
const { getSchemes } = require("./services/schemeService");
const fs = require("fs");

// Initialize app
const app = express();

// Configure CORS
const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(",")
  : ["http://localhost:3000"];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin) return callback(null, true);

      if (allowedOrigins.indexOf(origin) === -1) {
        const msg =
          "The CORS policy for this site does not allow access from the specified Origin.";
        return callback(new Error(msg), false);
      }

      return callback(null, true);
    },
  })
);

// Middleware
app.use(morgan("dev"));
app.use(bodyParser.json());

// Routes - Using centralized route handler
console.log("[SERVER] Setting up API routes at /api");
app.use("/api", apiRoutes);

// Health check endpoints
app.get("/health", (req, res) => {
  res.json({ status: "ok", environment: process.env.NODE_ENV });
});

// API health endpoint is handled by apiRoutes.js

// Root route for API status
app.get("/", (req, res) => {
  console.log("[SERVER] Root route accessed");
  res.json({
    name: "Samvaad Sahayak API",
    status: "running",
    version: "1.0.0",
    endpoints: {
      health: "/api/health",
      schemes: "/api/schemes",
      query: "/api/query",
      validate: "/api/validate",
    },
    documentation: "API for Indian Government Schemes Assistant",
  });
});

// Handle HEAD requests for health checks
app.head("/", (req, res) => {
  console.log("[SERVER] HEAD request to root route");
  res.status(200).end();
});

// Serve static assets in production
if (process.env.NODE_ENV === "production") {
  console.log("[SERVER] Setting up static file serving for production");

  const frontendBuildPath = path.join(__dirname, "../frontend/build");

  // Check if frontend build exists
  if (fs.existsSync(frontendBuildPath)) {
    console.log("[SERVER] Frontend build found, serving static files");
    app.use(express.static(frontendBuildPath));

    // Catch-all handler: send back React's index.html file for any non-API routes
    app.get("*", (req, res) => {
      console.log(`[SERVER] Serving React app for route: ${req.path}`);
      res.sendFile(path.resolve(frontendBuildPath, "index.html"));
    });
  } else {
    console.log("[SERVER] Frontend build not found, serving API-only mode");
    // For API-only deployment, handle unmatched routes with helpful message
    app.get("*", (req, res) => {
      console.log(`[SERVER] API-only mode, route not found: ${req.path}`);
      res.status(404).json({
        error: "Route not found",
        message:
          "This is an API-only deployment. Frontend is deployed separately.",
        availableEndpoints: [
          "/api/health",
          "/api/schemes",
          "/api/query",
          "/api/validate",
        ],
        path: req.path,
      });
    });
  }
}

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(`[SERVER] Error on ${req.method} ${req.path}:`, err.stack);
  res.status(500).json({
    error: "Something went wrong!",
    message: process.env.NODE_ENV === "development" ? err.message : undefined,
  });
});

// Start server with automatic port selection
const startServer = (port, maxAttempts = 10) => {
  const server = app
    .listen(port, () => {
      console.log(`Server running on port ${port}`);
      console.log(`API Provider: ${process.env.AI_PROVIDER}`);
      console.log(`Demo mode: ${process.env.DEMO_MODE}`);
    })
    .on("error", (err) => {
      if (err.code === "EADDRINUSE" && maxAttempts > 0) {
        console.log(`Port ${port} is busy, trying port ${port + 1}`);
        startServer(port + 1, maxAttempts - 1);
      } else if (err.code === "EADDRINUSE") {
        console.error(
          `Error: Could not find an available port after multiple attempts!`
        );
        console.error(`Last attempted port: ${port}`);
        process.exit(1);
      } else {
        console.error("Server error:", err);
        process.exit(1);
      }
    });
};

const PORT = parseInt(process.env.PORT) || 5000;
startServer(PORT);
