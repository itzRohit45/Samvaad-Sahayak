const fs = require('fs').promises;
const path = require('path');

/**
 * Get schemes with optional filtering
 * @param {string} filter - Optional filter term
 * @returns {Array} - List of schemes
 */
async function getSchemes(filter = '') {
  try {
    // Read schemes from JSON file
    const schemeDataPath = path.join(__dirname, '../data/schemes.json');
    const data = await fs.readFile(schemeDataPath, 'utf8');
    const schemes = JSON.parse(data);
    
    // Apply filter if provided
    if (filter) {
      const lowerFilter = filter.toLowerCase();
      return schemes.filter(scheme => {
        // Filter by name, category, or keywords
        return (
          scheme.name.toLowerCase().includes(lowerFilter) ||
          scheme.category.toLowerCase().includes(lowerFilter) ||
          scheme.keywords.some(keyword => 
            keyword.toLowerCase().includes(lowerFilter)
          )
        );
      });
    }
    
    return schemes;
  } catch (error) {
    console.error('Error fetching schemes:', error);
    throw error;
  }
}

module.exports = {
  getSchemes
};
