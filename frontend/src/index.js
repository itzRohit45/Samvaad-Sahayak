import React from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App";
import * as serviceWorkerRegistration from "./serviceWorkerRegistration";
import { LanguageProvider } from "./contexts/LanguageContext";

const container = document.getElementById("root");
const root = createRoot(container);

root.render(
  <React.StrictMode>
    <LanguageProvider>
      <App />
    </LanguageProvider>
  </React.StrictMode>
);

// Register the service worker for PWA functionality
serviceWorkerRegistration.register({
  onUpdate: (registration) => {
    // Show a notification when a new version is available
    const waitingServiceWorker = registration.waiting;

    if (waitingServiceWorker) {
      waitingServiceWorker.addEventListener("statechange", (event) => {
        if (event.target.state === "activated") {
          // New update activated, show refresh notification
          if (window.confirm("नया अपडेट उपलब्ध है। पृष्ठ रीफ्रेश करें?")) {
            window.location.reload();
          }
        }
      });
      waitingServiceWorker.postMessage({ type: "SKIP_WAITING" });
    }
  },
});
