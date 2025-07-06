import React, { useState, useRef, useEffect } from "react";
import "./LanguageSelector.css";
import { useLanguage } from "../contexts/LanguageContext";

function LanguageSelector() {
  const { language, setLanguage } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const languages = [
    { code: "hi", name: "हिन्दी (Hindi)", flag: "🇮🇳" },
    { code: "en", name: "English", flag: "🇬🇧" },
    { code: "bn", name: "বাংলা (Bengali)", flag: "🇧🇩" },
    { code: "ta", name: "தமிழ் (Tamil)", flag: "🇮🇳" },
    { code: "te", name: "తెలుగు (Telugu)", flag: "🇮🇳" },
  ];

  const toggleDropdown = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsOpen(!isOpen);
  };

  const handleLanguageSelect = (code) => {
    console.log("Setting language to:", code);
    setLanguage(code);
    setIsOpen(false);
  };

  const getCurrentLanguageInfo = () => {
    return languages.find((lang) => lang.code === language) || languages[0];
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }
  }, [isOpen]);

  return (
    <div className="language-selector" ref={dropdownRef}>
      <button
        className="language-button"
        onClick={toggleDropdown}
        aria-expanded={isOpen}
        type="button"
      >
        <span className="language-flag">{getCurrentLanguageInfo().flag}</span>
        <span className="language-name">
          {getCurrentLanguageInfo().code.toUpperCase()}
        </span>
        <span className="dropdown-arrow">{isOpen ? "▲" : "▼"}</span>
      </button>

      {isOpen && (
        <ul className="language-dropdown">
          {languages.map((lang) => (
            <li
              key={lang.code}
              className={lang.code === language ? "active" : ""}
              onClick={() => handleLanguageSelect(lang.code)}
            >
              <span className="language-flag">{lang.flag}</span>
              <span className="language-name">{lang.name}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default LanguageSelector;
