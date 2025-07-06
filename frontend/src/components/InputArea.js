import React, { useState, useRef, useEffect } from "react";
import "./InputArea.css";
import { useLanguage } from "../contexts/LanguageContext";

function InputArea({ onSubmit, isListening, toggleListening, isLoading }) {
  const [query, setQuery] = useState("");
  const inputRef = useRef(null);
  const { translateText } = useLanguage();

  // Focus input when component mounts
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();

    if (query.trim() && !isLoading) {
      onSubmit(query);
      setQuery("");
    }
  };

  // Handle input change
  const handleChange = (e) => {
    setQuery(e.target.value);
  };

  return (
    <div className="input-area">
      <form className="input-form" onSubmit={handleSubmit}>
        <input
          type="text"
          className="query-input"
          value={query}
          onChange={handleChange}
          placeholder={
            translateText("typeQuestion") || "अपना प्रश्न यहां टाइप करें..."
          }
          ref={inputRef}
          disabled={isListening}
          aria-label={translateText("typeQuestion") || "प्रश्न इनपुट फ़ील्ड"}
        />

        <button
          type="button"
          className={`mic-button ${isListening ? "listening" : ""}`}
          onClick={toggleListening}
          disabled={isLoading}
          aria-label={
            isListening
              ? translateText("recording") || "रिकॉर्डिंग रोकें"
              : translateText("typeQuestion") || "अपनी आवाज रिकॉर्ड करें"
          }
        >
          {isListening ? "⏹️" : "🎤"}
        </button>

        <button
          type="submit"
          className="send-button"
          disabled={!query.trim() || isListening || isLoading}
          aria-label={translateText("send") || "प्रश्न भेजें"}
        >
          {isLoading ? "⏳" : "📨"}
        </button>
      </form>
    </div>
  );
}

export default InputArea;
