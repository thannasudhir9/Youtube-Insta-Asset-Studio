import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Global fetch interceptor to inject custom Gemini API Key
const originalFetch = window.fetch;
try {
  Object.defineProperty(window, "fetch", {
    configurable: true,
    enumerable: true,
    writable: true,
    value: async function (input: RequestInfo | URL, init?: RequestInit) {
      const url = typeof input === "string" ? input : input instanceof URL ? input.toString() : input.url;
      if (url.includes("/api/")) {
        const customKey = localStorage.getItem("the90s_Breeze_gemini_api_key");
        const customYtKey = localStorage.getItem("the90s_Breeze_youtube_key");
        
        if (customKey || customYtKey) {
          init = init || {};
          init.headers = init.headers || {};
          
          if (init.headers instanceof Headers) {
            if (customKey) init.headers.set("x-gemini-key", customKey);
            if (customYtKey) init.headers.set("x-youtube-key", customYtKey);
          } else if (Array.isArray(init.headers)) {
            if (customKey) init.headers.push(["x-gemini-key", customKey]);
            if (customYtKey) init.headers.push(["x-youtube-key", customYtKey]);
          } else {
            init.headers = {
              ...init.headers,
              ...(customKey ? { "x-gemini-key": customKey } : {}),
              ...(customYtKey ? { "x-youtube-key": customYtKey } : {})
            };
          }
        }
      }
      return originalFetch(input, init);
    }
  });
} catch (e) {
  console.warn("Could not patch window.fetch directly. Creating custom fallback helper.", e);
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
