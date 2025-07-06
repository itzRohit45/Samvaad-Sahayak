const { processQuery } = require("../services/queryProcessor");
const { getSchemes } = require("../services/schemeService");

/**
 * Process user query and return AI response
 */
exports.processQuery = async (req, res) => {
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
};

/**
 * Get schemes, optionally filtered by category
 */
exports.getSchemes = async (req, res) => {
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
};
