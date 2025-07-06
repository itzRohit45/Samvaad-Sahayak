/**
 * Translation service for utility functions
 * Note: This service provides utility functions that don't use React hooks directly.
 * For React components, use the useLanguage hook directly from LanguageContext.
 */

/**
 * Create a translation function with pre-loaded translate function
 * This is a utility to avoid hook usage in regular functions
 * @param {Function} translateFn - The translate function from useLanguage hook
 * @returns {Function} - A function that can translate text
 */
export const createTranslator = (translateFn) => {
  return (key, language) => translateFn(key, language);
};

/**
 * Translate UI elements in bulk using a pre-loaded translate function
 * @param {Object} elements - Object with keys as element IDs and values as translation keys
 * @param {Function} translateFn - The translate function from useLanguage hook
 */
export const translateUI = (elements, translateFn) => {
  Object.entries(elements).forEach(([id, key]) => {
    const element = document.getElementById(id);
    if (element) {
      element.textContent = translateFn(key);
    }
  });
};
