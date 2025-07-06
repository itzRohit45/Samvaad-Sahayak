const express = require("express");
const apiController = require("../controllers/apiController");
const router = express.Router();

// Process query route
router.post("/query", apiController.processQuery);

// Get schemes route
router.get("/schemes", apiController.getSchemes);

// Health check route
router.get("/health", (req, res) => {
  res.json({
    status: "ok",
    message: "API routes are working",
    timestamp: new Date().toISOString(),
  });
});

module.exports = router;
