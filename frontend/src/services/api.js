import axios from "axios";

const API_BASE_URL =
  process.env.REACT_APP_API_URL || "http://localhost:5001/api";

/**
 * Process user query and get response from the backend
 * @param {string} query - User's query text
 * @param {string} language - Language preference (hi, en, ta, te, bn)
 * @returns {Object} - Response with text
 */
export const processUserQuery = async (query, language = "hi") => {
  try {
    // Convert 2-letter language codes to full language names for backend
    const languageMap = {
      hi: "hindi",
      en: "english",
      ta: "tamil",
      te: "telugu",
      bn: "bengali",
    };

    const backendLanguage = languageMap[language] || "hindi";

    const response = await axios.post(`${API_BASE_URL}/query`, {
      query,
      language: backendLanguage,
    });
    return response.data;
  } catch (error) {
    console.error("API Error:", error);
    throw error;
  }
};

/**
 * Fetch scheme data, optionally filtered by category
 * @param {string} category - Optional category to filter schemes
 * @returns {Array} - Array of schemes
 */
export const fetchSchemes = async (category = null) => {
  try {
    const url = category
      ? `${API_BASE_URL}/schemes?category=${category}`
      : `${API_BASE_URL}/schemes`;

    const response = await axios.get(url);
    return response.data;
  } catch (error) {
    console.error("API Error:", error);
    throw error;
  }
};
