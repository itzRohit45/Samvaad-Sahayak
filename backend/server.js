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

// API endpoint to process user queries
app.post("/api/query", async (req, res) => {
  try {
    const { query, language } = req.body;

    if (!query || typeof query !== "string") {
      return res.status(400).json({
        error: "Invalid query format. Please provide a valid text query.",
      });
    }

    console.log(
      `Processing query: "${query}" in language: ${language || "hindi"}`
    );

    // Process the query with language support
    const result = await processQuery(query, language);
    res.json(result);
  } catch (error) {
    console.error("Error in query processing:", error);
    // Return a friendlier error to the client
    res.status(500).json({
      error:
        "Unable to process your query at this time. Please try again later.",
      details:
        process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
});

// API endpoint to get schemes
app.get("/api/schemes", async (req, res) => {
  try {
    const { filter } = req.query;
    const schemes = await getSchemes(filter);
    res.json(schemes);
  } catch (error) {
    console.error("Error fetching schemes:", error);
    res.status(500).json({
      error: "Failed to fetch schemes",
      message: error.message,
    });
  }
});

// Add the validation endpoint
app.get("/api/validate", async (req, res) => {
  const validation = {
    environment: {
      nodeEnv: process.env.NODE_ENV || "not set",
      port: process.env.PORT || "5000 (default)",
      demoMode: process.env.DEMO_MODE || "not set",
    },
    apis: {
      geminiApiKey: process.env.GEMINI_API_KEY ? "configured" : "missing",
      geminiKeyValid: "checking...",
    },
    data: {
      schemesFilePath: path.join(__dirname, "./data/schemes.json"),
      schemesFileExists: false,
      schemeCount: 0,
    },
  };

  // Check schemes.json
  try {
    const schemeDataPath = path.join(__dirname, "./data/schemes.json");
    if (fs.existsSync(schemeDataPath)) {
      validation.data.schemesFileExists = true;
      const data = await fs.promises.readFile(schemeDataPath, "utf8");
      const schemes = JSON.parse(data);
      validation.data.schemeCount = schemes.length;
    }
  } catch (error) {
    validation.data.error = error.message;
  }

  // Check Gemini API key
  try {
    if (process.env.GEMINI_API_KEY) {
      const genAI = new (require("@google/generative-ai").GoogleGenerativeAI)(
        process.env.GEMINI_API_KEY
      );
      const model = genAI.getGenerativeModel({ model: "gemini-pro" });
      await model.generateContent("Hello");
      validation.apis.geminiKeyValid = "valid";
    } else {
      validation.apis.geminiKeyValid = "not tested (key missing)";
    }
  } catch (error) {
    validation.apis.geminiKeyValid = "invalid: " + error.message;
  }

  res.json(validation);
});

// Routes
app.use("/api", apiRoutes);

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({ status: "ok", environment: process.env.NODE_ENV });
});

// Serve static assets in production
if (process.env.NODE_ENV === "production") {
  // Set static folder
  app.use(express.static(path.join(__dirname, "../frontend/build")));

  app.get("*", (req, res) => {
    res.sendFile(path.resolve(__dirname, "../frontend", "build", "index.html"));
  });
}

// Debug endpoint for development
if (process.env.NODE_ENV === "development") {
  app.get("/api/debug/search", async (req, res) => {
    try {
      const { query } = req.query;

      if (!query) {
        return res.status(400).json({ error: "Query parameter is required" });
      }

      const { searchSchemeKnowledgeBase } = require("./services/ragService");
      const results = await searchSchemeKnowledgeBase(query);

      res.json({
        query,
        resultCount: results ? results.length : 0,
        results: results
          ? results.map((item) => ({
              id: item.id,
              name: item.name,
              category: item.category,
              hasContent: !!item.content,
              contentPreview: item.content
                ? item.content.substring(0, 100) + "..."
                : "No content",
            }))
          : [],
      });
    } catch (error) {
      console.error("Debug search error:", error);
      res.status(500).json({ error: error.message });
    }
  });
}

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
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
