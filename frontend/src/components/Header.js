import React, { useState, useEffect } from 'react';
import './Header.css';
import SchemeNavigation from './SchemeNavigation';
import LanguageSelector from './LanguageSelector';
import { useLanguage } from '../contexts/LanguageContext';

function Header({ activeTab, setActiveTab }) {
  const [isNavOpen, setIsNavOpen] = useState(false);
  const { translateText } = useLanguage();
  
  // Close the navigation when clicking outside
  useEffect(() => {
    if (!isNavOpen) return;
    
    const handleClickOutside = (e) => {
      if (!e.target.closest('.scheme-navigation') && !e.target.closest('.scheme-button')) {
        setIsNavOpen(false);
      }
    };
    
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [isNavOpen]);
  
  const toggleNav = () => {
    setIsNavOpen(!isNavOpen);
  };

  return (
    <header className="header">
      <div className="header-content">
        <div className="title-container">
          <h1 className="app-title">{translateText('appTitle')}</h1>
          <p className="app-subtitle">{translateText('appSubtitle')}</p>
        </div>
        
        <div className="header-actions">
          <div className="tabs">
            <button 
              className={`tab-button ${activeTab === 'chat' ? 'active' : ''}`}
              onClick={() => setActiveTab('chat')}
            >
              💬 {translateText('chat')}
            </button>
            <button 
              className={`tab-button ${activeTab === 'yojanaBuddy' ? 'active' : ''}`}
              onClick={() => setActiveTab('yojanaBuddy')}
            >
              🔍 {translateText('yojanaBuddy')}
            </button>
          </div>
          
          <div className="header-tools">
            <button 
              className="scheme-button"
              onClick={toggleNav}
              aria-label={translateText('searchSchemes')}
              aria-expanded={isNavOpen}
            >
              <span className="icon">🔍</span> {translateText('searchSchemes')}
            </button>
            
            <LanguageSelector />
          </div>
        </div>
      </div>
      
      {isNavOpen && <SchemeNavigation onClose={() => setIsNavOpen(false)} />}
    </header>
  );
}

export default Header;
