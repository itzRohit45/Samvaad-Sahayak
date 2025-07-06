import React, { useEffect, useRef } from "react";
import "./SchemeNavigation.css";

// Define scheme categories with icons
const schemeCategories = {
  "कृषि (Krishi)": {
    icon: "🌾",
    schemes: [
      "प्रधानमंत्री किसान सम्मान निधि (PM-KISAN)",
      "मृदा स्वास्थ्य कार्ड",
      "किसान क्रेडिट कार्ड योजना",
    ],
  },
  "आवास (Awas)": {
    icon: "🏠",
    schemes: ["प्रधानमंत्री आवास योजना (PMAY)", "ग्रामीण आवास योजना"],
  },
  "स्वास्थ्य (Swasthya)": {
    icon: "🏥",
    schemes: [
      "आयुष्मान भारत",
      "जन औषधि योजना",
      "प्रधानमंत्री जन आरोग्य योजना (PMJAY)",
    ],
  },
  "शिक्षा (Education)": {
    icon: "📚",
    schemes: ["प्रधानमंत्री कौशल विकास योजना (PMKVY)", "बेटी बचाओ बेटी पढ़ाओ"],
  },
  "वित्त (Finance)": {
    icon: "💰",
    schemes: [
      "प्रधानमंत्री जन धन योजना (PMJDY)",
      "सुकन्या समृद्धि योजना (SSY)",
    ],
  },
  "बीमा (Insurance)": {
    icon: "🛡️",
    schemes: [
      "प्रधानमंत्री जीवन ज्योति बीमा योजना (PMJJBY)",
      "प्रधानमंत्री सुरक्षा बीमा योजना (PMSBY)",
    ],
  },
  "ऊर्जा (Energy)": {
    icon: "⚡",
    schemes: ["प्रधानमंत्री उज्ज्वला योजना", "सौभाग्य योजना"],
  },
  "पेंशन (Pension)": {
    icon: "👵",
    schemes: ["अटल पेंशन योजना (APY)", "प्रधानमंत्री वय वंदना योजना"],
  },
};

function SchemeNavigation({ onClose }) {
  const navRef = useRef(null);

  // Handle outside click to close navigation
  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (navRef.current && !navRef.current.contains(event.target)) {
        onClose();
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, [onClose]);

  // Handle scheme click - FIXED to properly search for schemes
  const handleSchemeClick = (scheme) => {
    // Create a query string from the scheme name
    const query = `${scheme} के बारे में जानकारी दें`;

    try {
      // Dispatch a custom event that App.js can listen for
      const event = new CustomEvent("schemeSelected", {
        detail: query,
      });
      document.dispatchEvent(event);

      console.log("Scheme selected:", query);

      // Close the navigation after selection
      onClose();
    } catch (error) {
      console.error("Error dispatching scheme selection event:", error);
    }
  };

  // Handle background click to close
  const handleBackgroundClick = (e) => {
    // Only close if clicking the background, not its children
    if (e.target.classList.contains("scheme-navigation")) {
      onClose();
    }
  };

  return (
    <div className="scheme-navigation-overlay" onClick={handleBackgroundClick}>
      <div className="scheme-navigation-panel" ref={navRef}>
        <div className="scheme-nav-header">
          <h2>सरकारी योजनाएँ</h2>
          <button
            className="close-button"
            onClick={onClose}
            aria-label="बंद करें"
          >
            ✕
          </button>
        </div>

        <div className="categories-grid">
          {Object.entries(schemeCategories).map(
            ([category, { icon, schemes }]) => (
              <div key={category} className="category-card">
                <div className="category-header">
                  <span className="category-icon">{icon}</span>
                  <h3 className="category-title">{category}</h3>
                </div>

                <div className="schemes-list">
                  {schemes.map((scheme, idx) => (
                    <button
                      key={idx}
                      className="scheme-button"
                      onClick={() => handleSchemeClick(scheme)}
                    >
                      {scheme}
                    </button>
                  ))}
                </div>
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
}

export default SchemeNavigation;
