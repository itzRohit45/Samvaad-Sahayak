import React, { useState, useEffect } from 'react';
import './SchemeFilter.css';
import { fetchSchemes } from '../services/api';

function SchemeFilter({ onSelectScheme }) {
  const [isOpen, setIsOpen] = useState(false);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [schemes, setSchemes] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  
  // Fetch categories on component mount
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const allSchemes = await fetchSchemes();
        const uniqueCategories = [...new Set(allSchemes.map(scheme => scheme.category))];
        setCategories(uniqueCategories);
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    };
    
    fetchCategories();
  }, []);
  
  // Fetch schemes by category
  const handleCategorySelect = async (category) => {
    setSelectedCategory(category);
    setIsLoading(true);
    
    try {
      const filteredSchemes = await fetchSchemes(category);
      setSchemes(filteredSchemes);
    } catch (error) {
      console.error('Error fetching schemes by category:', error);
      setSchemes([]);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Handle scheme selection
  const handleSchemeSelect = (scheme) => {
    onSelectScheme(`${scheme.name} के बारे में जानकारी दें`);
    setIsOpen(false);
  };
  
  // Toggle filter panel
  const toggleFilter = () => {
    setIsOpen(!isOpen);
    if (!isOpen && !selectedCategory && categories.length > 0) {
      handleCategorySelect(categories[0]);
    }
  };

  return (
    <div className="scheme-filter">
      <button 
        className="filter-button"
        onClick={toggleFilter}
        aria-label="योजनाएँ खोजें"
      >
        🔎 योजनाएँ खोजें
      </button>
      
      {isOpen && (
        <div className="filter-panel">
          <div className="category-tabs">
            {categories.map((category) => (
              <button
                key={category}
                className={`category-tab ${selectedCategory === category ? 'active' : ''}`}
                onClick={() => handleCategorySelect(category)}
              >
                {getCategoryName(category)}
              </button>
            ))}
          </div>
          
          <div className="schemes-list">
            {isLoading ? (
              <p className="loading-text">लोड हो रहा है...</p>
            ) : schemes.length > 0 ? (
              schemes.map((scheme) => (
                <div 
                  key={scheme.id}
                  className="scheme-item"
                  onClick={() => handleSchemeSelect(scheme)}
                >
                  <h3>{scheme.name}</h3>
                  <p>{scheme.content.split('\n')[0]}</p>
                </div>
              ))
            ) : (
              <p>इस श्रेणी में कोई योजना नहीं मिली</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// Helper function to translate category names to Hindi
function getCategoryName(category) {
  const categoryMap = {
    'housing': 'आवास',
    'agriculture': 'कृषि',
    'health': 'स्वास्थ्य',
    'education': 'शिक्षा',
    'finance': 'वित्त',
    'insurance': 'बीमा',
    'energy': 'ऊर्जा',
    'pension': 'पेंशन'
  };
  
  return categoryMap[category] || category;
}

export default SchemeFilter;
