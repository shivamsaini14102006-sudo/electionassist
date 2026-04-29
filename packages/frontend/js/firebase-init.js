import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js";
import { getAnalytics, logEvent } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-analytics.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-auth.js";

const firebaseConfig = {
  // TODO: Replace placeholders with your actual Firebase Web API Key and IDs
  apiKey: "YOUR_API_KEY",
  authDomain: "challange-2-494409.firebaseapp.com",
  projectId: "challange-2-494409",
  storageBucket: "challange-2-494409.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID",
  measurementId: "YOUR_MEASUREMENT_ID"
};

try {
  // Avoid initialization if config is missing required keys
  if (firebaseConfig.apiKey !== "YOUR_API_KEY") {
    const app = initializeApp(firebaseConfig);
    const analytics = getAnalytics(app);
    const auth = getAuth(app);
    
    // Expose globally for app.js to use without module imports
    window.firebaseAnalytics = { analytics, logEvent };
    window.firebaseAuth = auth;
    console.log("Firebase initialized successfully");
  } else {
    console.warn("Firebase Web configuration missing. Using mock analytics.");
    window.firebaseAnalytics = { logEvent: () => {} };
  }
} catch (e) {
  console.warn("Firebase initialization failed:", e);
  window.firebaseAnalytics = { logEvent: () => {} };
}
