// Browser Speech Recognition API wrapper
let recognition = null;

/**
 * Initialize and start speech recognition with improved silence detection
 * @param {Function} onResult - Callback for recognition result
 * @param {Function} onError - Callback for errors
 * @param {string} language - Language code (hi, en, ta, te, bn)
 */
export const startSpeechRecognition = (onResult, onError, language = "hi") => {
  try {
    // Initialize Web Speech API
    window.SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!window.SpeechRecognition) {
      onError("Speech recognition not supported in this browser");
      return;
    }

    recognition = new window.SpeechRecognition();
    recognition.continuous = true; // Keep listening for continued speech
    recognition.interimResults = true; // Show interim results while speaking

    // Set language based on selection
    const languageMap = {
      hi: "hi-IN",
      en: "en-US",
      ta: "ta-IN",
      te: "te-IN",
      bn: "bn-IN",
    };

    recognition.lang = languageMap[language] || "hi-IN";
    recognition.maxAlternatives = 1;

    console.log(
      `Speech recognition initialized for language: ${recognition.lang}`
    );

    // Silence detection variables
    let finalTranscript = "";
    let interimTranscript = "";
    let silenceTimer = null;
    let hasSpokenSomething = false;
    let isProcessing = false;

    // Silence detection timeout (1.5 seconds of silence after speech)
    const SILENCE_TIMEOUT = 1500;
    // Maximum recognition time (10 seconds)
    const MAX_RECOGNITION_TIME = 10000;

    // Set maximum recognition time
    const maxTimer = setTimeout(() => {
      console.log("Maximum recognition time reached - stopping");
      if (recognition && !isProcessing) {
        recognition.stop();
      }
    }, MAX_RECOGNITION_TIME);

    recognition.onstart = () => {
      console.log("Speech recognition started - speak now!");
      isProcessing = false;
    };

    recognition.onspeechstart = () => {
      console.log("Speech detected");
      hasSpokenSomething = true;

      // Clear any existing silence timer
      if (silenceTimer) {
        clearTimeout(silenceTimer);
        silenceTimer = null;
      }
    };

    recognition.onspeechend = () => {
      console.log("Speech ended - starting silence detection");

      // Start silence timer when speech ends
      if (!isProcessing) {
        silenceTimer = setTimeout(() => {
          console.log("Silence detected - stopping recognition");
          if (recognition && !isProcessing) {
            isProcessing = true;
            recognition.stop();
          }
        }, SILENCE_TIMEOUT);
      }
    };

    recognition.onresult = (event) => {
      let tempInterim = "";
      let tempFinal = "";

      // Process all results
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript.trim();
        if (event.results[i].isFinal) {
          tempFinal += transcript + " ";
        } else {
          tempInterim += transcript;
        }
      }

      // Update transcripts
      if (tempFinal) {
        finalTranscript += tempFinal;
      }
      interimTranscript = tempInterim;

      // Reset silence timer on new results
      if (silenceTimer) {
        clearTimeout(silenceTimer);
        silenceTimer = null;
      }

      console.log("Interim:", interimTranscript);
      console.log("Final so far:", finalTranscript);

      // If we have substantial final text, start shorter silence timer
      if (finalTranscript.trim().length > 3 && !interimTranscript.trim()) {
        silenceTimer = setTimeout(() => {
          console.log("Auto-stopping - final text detected with silence");
          if (recognition && !isProcessing) {
            isProcessing = true;
            recognition.stop();
          }
        }, 1000); // Shorter timeout for completed sentences
      }
    };

    recognition.onend = () => {
      console.log("Speech recognition ended");

      // Clear all timers
      if (silenceTimer) {
        clearTimeout(silenceTimer);
        silenceTimer = null;
      }
      if (maxTimer) {
        clearTimeout(maxTimer);
      }

      // Return the best available transcript
      const resultText = (
        finalTranscript.trim() || interimTranscript.trim()
      ).trim();

      if (resultText && resultText.length > 0) {
        console.log("Returning speech result:", resultText);
        onResult(resultText);
      } else if (hasSpokenSomething) {
        onError(
          "Speech was detected but could not be understood clearly. Please try again."
        );
      } else {
        onError("No speech detected. Please speak clearly and try again.");
      }

      // Reset recognition
      recognition = null;
      isProcessing = false;
    };

    recognition.onerror = (event) => {
      console.error("Speech recognition error:", event.error);

      // Clear all timers on error
      if (silenceTimer) {
        clearTimeout(silenceTimer);
        silenceTimer = null;
      }
      if (maxTimer) {
        clearTimeout(maxTimer);
      }

      // Reset processing flag
      isProcessing = false;

      // Handle different error types
      if (event.error === "no-speech") {
        onError("No speech detected. Please speak clearly and try again.");
      } else if (event.error === "audio-capture") {
        onError("Microphone not accessible. Please check permissions.");
      } else if (event.error === "not-allowed") {
        onError(
          "Microphone permission denied. Please allow microphone access."
        );
      } else if (event.error === "aborted") {
        // This is normal when we stop recognition manually
        console.log("Recognition was stopped manually");
        return; // Don't call onError for manual stops
      } else if (event.error === "network") {
        onError("Network error. Please check your internet connection.");
      } else {
        onError(`Speech recognition error: ${event.error}`);
      }

      // Reset recognition
      recognition = null;
    };

    recognition.onnomatch = () => {
      console.log("No speech match found");
      onError("Could not understand speech. Please speak more clearly.");
    };

    recognition.start();
    console.log("Speech recognition initiated with improved auto-stop");
  } catch (error) {
    console.error("Error starting speech recognition:", error);
    onError(error.message);
  }
};

/**
 * Stop ongoing speech recognition
 */
export const stopSpeechRecognition = () => {
  if (recognition) {
    console.log("Manually stopping speech recognition");
    try {
      recognition.abort(); // Use abort instead of stop for immediate termination
    } catch (error) {
      console.log("Error stopping recognition:", error);
    }
    recognition = null;
  }
};

/**
 * Clean text before speaking to remove markdown and special characters
 * @param {string} text - Text to clean
 * @returns {string} - Cleaned text
 */
const cleanTextForSpeech = (text) => {
  return text
    .replace(/\*\*/g, "") // Remove bold marks
    .replace(/\*/g, "") // Remove italic marks
    .replace(/```.*?```/gs, "") // Remove code blocks
    .replace(/`/g, "") // Remove inline code marks
    .replace(/#+\s/g, "") // Remove heading markers
    .replace(/\n\n+/g, "\n") // Replace multiple newlines with single
    .replace(/[*_~>#]/g, ""); // Remove other markdown characters
};

// Initialize voices array
let voices = [];

// Load available voices
function loadVoices() {
  voices = window.speechSynthesis.getVoices();
  console.log("Available voices loaded:", voices.length);
}

// Load voices when they become available
if (window.speechSynthesis) {
  // Chrome loads voices asynchronously
  if (window.speechSynthesis.onvoiceschanged !== undefined) {
    window.speechSynthesis.onvoiceschanged = loadVoices;
  }

  // Initial load attempt
  loadVoices();
}

/**
 * Speak text using browser's speech synthesis
 * @param {string} text - Text to speak
 * @param {Object} options - Speaking options
 * @param {string} language - Language code (hi, en, ta, te, bn)
 * @returns {Object} - Speech controller with stop method and onEnd callback
 */
export const speakText = (text, options = {}, language = "hi") => {
  console.log("Speaking text:", text.substring(0, 50) + "...");
  console.log("Language:", language);

  // Check if speech synthesis is available
  if (!window.speechSynthesis) {
    console.error("Speech synthesis not supported");
    return { stop: () => {}, onEnd: null };
  }

  // Clean the text before speaking
  const cleanedText = cleanTextForSpeech(text);

  // Use browser's Speech Synthesis API
  const speech = new SpeechSynthesisUtterance();
  speech.text = cleanedText;

  // Set language based on selection
  const languageMap = {
    hi: "hi-IN",
    en: "en-US",
    ta: "ta-IN",
    te: "te-IN",
    bn: "bn-IN",
  };

  speech.lang = languageMap[language] || "hi-IN";
  speech.rate = options.rate || 0.9;
  speech.pitch = options.pitch || 1;
  speech.volume = 1.0; // Ensure volume is at maximum

  // Find appropriate voice based on language
  const availableVoices = window.speechSynthesis.getVoices();
  console.log("Available voices:", availableVoices.length);

  // Try to find voice for the selected language
  const targetLang = languageMap[language] || "hi-IN";
  const preferredVoice = availableVoices.find((voice) =>
    voice.lang.includes(targetLang.split("-")[0])
  );

  if (preferredVoice) {
    console.log(`Using ${language} voice:`, preferredVoice.name);
    speech.voice = preferredVoice;
  } else {
    // Fallback to any available voice that matches the language family
    const fallbackVoice = availableVoices.find((voice) =>
      voice.lang.toLowerCase().includes(targetLang.split("-")[0].toLowerCase())
    );
    if (fallbackVoice) {
      console.log(`Using fallback voice for ${language}:`, fallbackVoice.name);
      speech.voice = fallbackVoice;
    } else {
      console.log(`No voice found for ${language}, using default voice`);
    }
  }

  // Create a controller object with callbacks
  const controller = {
    stop: () => {
      window.speechSynthesis.cancel();
      if (typeof controller.onEnd === "function") {
        controller.onEnd();
      }
    },
    onEnd: null,
  };

  // Set up the end event
  speech.onend = () => {
    console.log("Speech ended");
    if (typeof controller.onEnd === "function") {
      controller.onEnd();
    }
  };

  // Handle errors
  speech.onerror = (event) => {
    console.error("Speech synthesis error:", event);
    if (typeof controller.onEnd === "function") {
      controller.onEnd();
    }
  };

  // Fix for Chrome issue where speech sometimes doesn't start
  window.speechSynthesis.cancel();

  // Start speaking
  try {
    window.speechSynthesis.speak(speech);
    console.log("Speech started");
  } catch (error) {
    console.error("Error starting speech:", error);
  }

  return controller;
};
