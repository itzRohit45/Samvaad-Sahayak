import React, { useState, useCallback, useRef } from "react";
import "./App.css";
import Header from "./components/Header";
import ChatArea from "./components/ChatArea";
import InputArea from "./components/InputArea";
import YojanaBuddy from "./components/YojanaBuddy";
import EligibilityChecker from "./components/EligibilityChecker";
import { processUserQuery } from "./services/api";
import {
  startSpeechRecognition,
  stopSpeechRecognition,
} from "./services/speechServices";
import { useLanguage } from "./contexts/LanguageContext";

function App() {
  const [activeTab, setActiveTab] = useState("chat");
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const audioRef = useRef(null);
  const { translateText, language } = useLanguage();

  // Handle user query (text or voice)
  const handleQuerySubmit = useCallback(
    async (query, isVoice = false) => {
      if (!query.trim()) return;

      // Add user message to chat
      const userMessage = {
        id: Date.now(),
        text: query,
        isUser: true,
        timestamp: new Date(),
      };

      setMessages((prevMessages) => [...prevMessages, userMessage]);
      setIsLoading(true);
      setActiveTab("chat");

      try {
        // Get response from API with current language
        const response = await processUserQuery(query, language);

        // Add response to chat
        const botMessage = {
          id: Date.now() + 1,
          text: response.text,
          isUser: false,
          timestamp: new Date(),
        };

        setMessages((prevMessages) => [...prevMessages, botMessage]);
      } catch (error) {
        console.error("Error processing query:", error);

        // Add error message
        const errorMessage = {
          id: Date.now() + 1,
          text:
            translateText("offlineMessage") ||
            "कुछ गलत हुआ है। कृपया बाद में कोशिश करें।",
          isUser: false,
          timestamp: new Date(),
          isError: true,
        };

        setMessages((prevMessages) => [...prevMessages, errorMessage]);
      } finally {
        setIsLoading(false);
      }
    },
    [translateText, language]
  );

  // Toggle speech recognition
  const toggleListening = () => {
    if (isListening) {
      console.log("Stopping speech recognition");
      stopSpeechRecognition();
      setIsListening(false);
    } else {
      console.log("Starting speech recognition with language:", language);
      startSpeechRecognition(
        (finalTranscript) => {
          console.log("Speech recognition completed:", finalTranscript);
          if (finalTranscript.trim()) {
            handleQuerySubmit(finalTranscript);
          }
          setIsListening(false);
        },
        (error) => {
          console.error("Speech recognition error:", error);
          setIsListening(false);
        },
        language // Pass current language
      );
      setIsListening(true);
    }
  };

  return (
    <div className="app-container">
      <Header activeTab={activeTab} setActiveTab={setActiveTab} />

      <main className="main-content">
        {activeTab === "chat" ? (
          <>
            <ChatArea
              messages={messages}
              isLoading={isLoading}
              audioRef={audioRef}
              onSuggestionClick={handleQuerySubmit}
            />
            <EligibilityChecker />
            <InputArea
              onSubmit={handleQuerySubmit}
              isListening={isListening}
              toggleListening={toggleListening}
              isLoading={isLoading}
            />
          </>
        ) : (
          <YojanaBuddy onSchemeSelect={handleQuerySubmit} />
        )}

        <audio ref={audioRef} className="hidden" />
      </main>
    </div>
  );
}

export default App;
