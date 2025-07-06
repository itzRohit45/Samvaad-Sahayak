import React, { useEffect, useRef, useState } from "react";
import "./ChatArea.css";
import { speakText } from "../services/speechServices";
import { useLanguage } from "../contexts/LanguageContext";

// Sample questions for carousel
const SAMPLE_QUESTIONS = [
  "प्रधानमंत्री आवास योजना के बारे में बताएं",
  "उज्ज्वला योजना क्या है?",
  "शिक्षा लोन कैसे मिलता है?",
  "बीमा योजना किनके लिए है?",
  "किसान सम्मान निधि के लिए आवेदन कैसे करें?",
  "पेंशन योजना कौन-कौन सी हैं?",
  "जन धन योजना के क्या लाभ हैं?",
];

// Helper function to remove markdown before speaking
const stripMarkdownForSpeech = (text) => {
  return text
    .replace(/\*\*/g, "") // Remove bold marks
    .replace(/\*/g, "") // Remove italic marks
    .replace(/```.*?```/gs, "") // Remove code blocks
    .replace(/`/g, "") // Remove inline code marks
    .replace(/#+\s/g, "") // Remove heading markers
    .replace(/\n\n+/g, "\n") // Replace multiple newlines with single
    .replace(/[*_~>#]/g, ""); // Remove other markdown characters
};

// Helper function to render structured content with emojis
const renderStructuredContent = (
  text,
  messageId,
  handlePlayAudio,
  speakingMessageId
) => {
  // Check if the text contains sections like "पात्रता:", "लाभ:", "आवेदन प्रक्रिया:"
  if (
    text.includes("पात्रता:") ||
    text.includes("लाभ:") ||
    text.includes("आवेदन प्रक्रिया:")
  ) {
    // Split the text by common section headers - fixed regex
    const parts = text.split(/\n\n|\n(?=\p{L}.*?:)/u);

    return (
      <>
        <p>{parts[0]}</p> {/* Main description */}
        <div className="structured-content">
          {parts.slice(1).map((part, index) => {
            let icon = "📋";

            if (part.startsWith("पात्रता:")) icon = "✅";
            else if (part.startsWith("लाभ:")) icon = "🎁";
            else if (part.startsWith("आवेदन प्रक्रिया:")) icon = "📝";
            else if (part.toLowerCase().includes("योग्यता")) icon = "🎯";

            return (
              <div key={index} className="content-section">
                <h4>
                  <span className="emoji-icon">{icon}</span>
                  {part.split(":")[0]}:
                </h4>
                <p>{part.split(":").slice(1).join(":")}</p>
              </div>
            );
          })}
        </div>
        {/* Add Step-by-Step Application Guide */}
        <details className="application-steps">
          <summary>📋 आवेदन की प्रक्रिया</summary>
          <ol>
            <li>सरकारी पोर्टल या नज़दीकी सेवा केंद्र पर जाएं</li>
            <li>
              आवश्यक दस्तावेज़ तैयार करें (आधार कार्ड, पहचान प्रमाण, आय प्रमाण)
            </li>
            <li>आवेदन फॉर्म भरें और सभी आवश्यक दस्तावेज़ जमा करें</li>
            <li>आवेदन जमा करने का प्रमाण पत्र प्राप्त करें</li>
            <li>आवेदन की स्थिति की जांच नियमित रूप से करें</li>
            <li>प्रक्रिया पूर्ण होने पर SMS/ईमेल द्वारा सूचित किया जाएगा</li>
          </ol>
        </details>
        {/* Voice button with better styling */}
        <div className="voice-button-container">
          <button
            className="voice-button"
            onClick={() => handlePlayAudio(text, messageId)}
            aria-label={
              speakingMessageId === messageId ? "इसे रोकें" : "इसे सुनें"
            }
          >
            <span className="voice-icon">
              {speakingMessageId === messageId ? "🔇" : "🔊"}
            </span>
            <span className="voice-text">
              {speakingMessageId === messageId ? "रोकें" : "सुनें"}
            </span>
          </button>
        </div>
      </>
    );
  }

  // If no structured content, return text as is with voice button at the end
  return (
    <>
      <p>{text}</p>
      <div className="voice-button-container">
        <button
          className="voice-button"
          onClick={() => handlePlayAudio(text, messageId)}
          aria-label={
            speakingMessageId === messageId ? "इसे रोकें" : "इसे सुनें"
          }
        >
          <span className="voice-icon">
            {speakingMessageId === messageId ? "🔇" : "🔊"}
          </span>
          <span className="voice-text">
            {speakingMessageId === messageId ? "रोकें" : "सुनें"}
          </span>
        </button>
      </div>
    </>
  );
};

function ChatArea({ messages, isLoading, audioRef, onSuggestionClick }) {
  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);
  const activeSpeechRef = useRef(null);
  const [speakingMessageId, setSpeakingMessageId] = useState(null);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const suggestionBarRef = useRef(null);
  const { language } = useLanguage(); // Add language context

  // Scroll to bottom on new messages
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  // Add scroll button visibility logic
  useEffect(() => {
    const handleScroll = () => {
      if (!messagesContainerRef.current) return;

      const { scrollTop, scrollHeight, clientHeight } =
        messagesContainerRef.current;
      setShowScrollButton(scrollHeight - scrollTop - clientHeight > 300);
    };

    const messagesContainer = messagesContainerRef.current;
    if (messagesContainer) {
      messagesContainer.addEventListener("scroll", handleScroll);
      return () =>
        messagesContainer.removeEventListener("scroll", handleScroll);
    }
  }, []);

  // Scroll to bottom function
  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  // Play text using browser's speech synthesis
  const handlePlayAudio = (text, messageId) => {
    console.log("Play audio clicked for message:", messageId);

    // Stop any ongoing speech
    if (activeSpeechRef.current) {
      console.log("Stopping previous speech");
      activeSpeechRef.current.stop();
      activeSpeechRef.current = null;
      setSpeakingMessageId(null);
    }

    // If clicking on the same message that's already playing, just stop it
    if (messageId === speakingMessageId) {
      console.log("Toggling off same message");
      setSpeakingMessageId(null);
      return;
    }

    // Start new speech with markdown stripped
    const cleanText = stripMarkdownForSpeech(text);
    console.log(
      "Starting speech for message:",
      messageId,
      "in language:",
      language
    );

    try {
      activeSpeechRef.current = speakText(cleanText, {}, language);
      setSpeakingMessageId(messageId);

      // Listen for speech end event
      if (activeSpeechRef.current) {
        activeSpeechRef.current.onEnd = () => {
          console.log("Speech ended callback");
          setSpeakingMessageId(null);
          activeSpeechRef.current = null;
        };
      }
    } catch (error) {
      console.error("Error playing speech:", error);
      setSpeakingMessageId(null);
    }
  };

  // Stop audio playback
  const handleStopAudio = (e) => {
    e.stopPropagation(); // Prevent triggering the parent button
    console.log("Stop audio clicked");

    if (activeSpeechRef.current) {
      activeSpeechRef.current.stop();
      activeSpeechRef.current = null;
    }
    setSpeakingMessageId(null);
  };

  // Reset speaking state when component unmounts
  useEffect(() => {
    return () => {
      if (activeSpeechRef.current) {
        activeSpeechRef.current.stop();
      }
    };
  }, []);

  // Generate a set of suggestions (random + based on last message content)
  const getSuggestions = (message) => {
    // Return up to 3 sample questions as suggestions
    return SAMPLE_QUESTIONS.slice(0, 3);
  };

  // Add scroll indicator functionality for the suggestion bar
  useEffect(() => {
    const handleSuggestionScroll = () => {
      if (!suggestionBarRef.current) return;

      const { scrollLeft, scrollWidth, clientWidth } = suggestionBarRef.current;

      // Show right gradient only when there's more content to the right
      if (scrollLeft + clientWidth >= scrollWidth - 10) {
        suggestionBarRef.current.classList.add("scrolled-end");
      } else {
        suggestionBarRef.current.classList.remove("scrolled-end");
      }

      // Show left gradient only when scrolled from left
      if (scrollLeft > 10) {
        suggestionBarRef.current.classList.add("scrolled-start");
      } else {
        suggestionBarRef.current.classList.remove("scrolled-start");
      }
    };

    const suggestionBar = suggestionBarRef.current;
    if (suggestionBar) {
      suggestionBar.addEventListener("scroll", handleSuggestionScroll);
      // Initial check
      handleSuggestionScroll();
      return () =>
        suggestionBar.removeEventListener("scroll", handleSuggestionScroll);
    }
  }, []);

  return (
    <div className="chat-area">
      {/* Replace question-carousel with suggestion-bar */}
      <div className="suggestion-bar" ref={suggestionBarRef}>
        {SAMPLE_QUESTIONS.map((question, index) => (
          <button
            key={index}
            onClick={() => onSuggestionClick(question)}
            aria-label={`सुझाव प्रश्न: ${question}`}
          >
            {question}
          </button>
        ))}
      </div>

      <div
        className="messages-container"
        role="log"
        aria-live="polite"
        ref={messagesContainerRef}
      >
        {messages.length === 0 && (
          <div className="welcome-message">
            <h2>संवाद सहायक में आपका स्वागत है!</h2>
            <p>सरकारी योजनाओं के बारे में कोई भी प्रश्न पूछें</p>
          </div>
        )}

        {messages.map((message, index) => {
          // Determine if this is the last bot message
          const isLastBotMessage =
            !message.isUser &&
            index === messages.findLastIndex((m) => !m.isUser);

          return (
            <div key={message.id}>
              <div
                className={`message ${
                  message.isUser ? "user-message" : "bot-message"
                }`}
              >
                <div className="message-content">
                  {message.isUser ? (
                    <p>{message.text}</p>
                  ) : (
                    renderStructuredContent(
                      message.text,
                      message.id,
                      handlePlayAudio,
                      speakingMessageId
                    )
                  )}

                  {/* Remove the old play button position */}

                  {/* Show speech control while speaking */}
                  {speakingMessageId === message.id && (
                    <div className="speech-control">
                      <div className="speaking-indicator">
                        <span></span>
                        <span></span>
                        <span></span>
                      </div>
                      <button
                        className="stop-button"
                        onClick={handleStopAudio}
                        aria-label="भाषण रोकें"
                      >
                        रोकें
                      </button>
                    </div>
                  )}
                </div>
                <div className="message-timestamp">
                  {new Date(message.timestamp).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </div>
              </div>

              {/* Show suggestions after the last bot message */}
              {isLastBotMessage && (
                <div className="suggestion-chips">
                  {getSuggestions(message).map((suggestion, idx) => (
                    <button
                      key={idx}
                      className="suggestion-chip"
                      onClick={() => onSuggestionClick(suggestion)}
                      aria-label={suggestion}
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              )}
            </div>
          );
        })}

        {isLoading && (
          <div className="message bot-message loading">
            <div className="message-content">
              <div
                className="loading-indicator"
                aria-label="प्रतिक्रिया उत्पन्न हो रही है"
              >
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {showScrollButton && (
        <button
          onClick={scrollToBottom}
          className="scroll-bottom-button"
          aria-label="नीचे जाएं"
        >
          ⬇
        </button>
      )}
    </div>
  );
}

export default ChatArea;
