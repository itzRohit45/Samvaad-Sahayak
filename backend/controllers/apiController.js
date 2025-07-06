const { processQuery } = require('../services/aiService');
const fs = require('fs').promises;
const path = require('path');

/**
 * Process user query and return AI response
 */
exports.processQuery = async (req, res) => {
  try {
    const { query } = req.body;
    
    if (!query) {
      return res.status(400).json({ error: 'Query text is required' });
    }
    
    const response = await processQuery(query);
    
    res.json(response);
  } catch (error) {
    console.error('Controller error:', error);
    res.status(500).json({ error: 'Failed to process query' });
  }
};

/**
 * Get schemes, optionally filtered by category
 */
exports.getSchemes = async (req, res) => {
  try {
    const { category } = req.query;
    
    // Read schemes data
    const schemeDataPath = path.join(__dirname, '../data/schemes.json');
    const data = await fs.readFile(schemeDataPath, 'utf8');
    let schemes = JSON.parse(data);
    
    // Filter by category if provided
    if (category) {
      schemes = schemes.filter(scheme => scheme.category === category);
    }
    
    res.json(schemes);
  } catch (error) {
    console.error('Controller error:', error);
    res.status(500).json({ error: 'Failed to get schemes' });
  }
};
