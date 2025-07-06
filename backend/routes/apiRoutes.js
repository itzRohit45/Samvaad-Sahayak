const express = require("express");
const apiController = require("../controllers/apiController");
const path = require("path");
const fs = require("fs");
const router = express.Router();

console.log("[API ROUTES] Module loaded successfully");

// Add logging middleware for debugging
router.use((req, res, next) => {
  console.log(
    `[API ROUTES] ${req.method} ${req.path} - ${new Date().toISOString()}`
  );
  next();
});

// Process query route
router.post("/query", apiController.processQuery);

// Get schemes route
router.get("/schemes", apiController.getSchemes);

// Health check route
router.get("/health", (req, res) => {
  console.log("[API ROUTES] Health check endpoint hit");
  res.json({
    status: "ok",
    message: "API routes are working",
    timestamp: new Date().toISOString(),
  });
});

// Validation endpoint
router.get("/validate", async (req, res) => {
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
      schemesFilePath: path.join(__dirname, "../data/schemes.json"),
      schemesFileExists: false,
      schemeCount: 0,
    },
  };

  // Check schemes.json
  try {
    const schemeDataPath = path.join(__dirname, "../data/schemes.json");
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
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
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

// Debug endpoint for development
if (process.env.NODE_ENV === "development") {
  router.get("/debug/search", async (req, res) => {
    try {
      const { query } = req.query;

      if (!query) {
        return res.status(400).json({ error: "Query parameter is required" });
      }

      const { searchSchemeKnowledgeBase } = require("../services/ragService");
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

console.log(
  "[API ROUTES] All routes registered: POST /query, GET /schemes, GET /health, GET /validate"
);

module.exports = router;
