import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";
import { AuthProvider } from "./context/AuthContext";
// 🚨 FIX: ModalProvider moved to App.tsx to access data-dependent props
// import { ModalProvider } from "./context/ModalContext";
import { BrowserRouter as Router } from "react-router-dom";

if (typeof window !== "undefined") {
  if ("serviceWorker" in navigator && import.meta.env.PROD) {
    window.addEventListener("load", () => {
      void (async () => {
        try {
          // Fetch Service Worker File
          const response = await fetch("/service-worker.js", {
            cache: "no-store",
            headers: {
              Accept: "application/javascript,text/javascript,*/*",
            },
          });

          // Confirm That service worker file type is a js file
          const contentType = response.headers.get("content-type") || "";
          const looksLikeScript =
            response.ok && !contentType.toLowerCase().includes("text/html");

          if (!looksLikeScript) {
            console.warn(
              "Skipping service worker registration because /sw.js did not resolve to a JavaScript file.",
            );
            return;
          }

          await navigator.serviceWorker.register("/service-worker.js");
        } catch (error) {
          console.warn("Service worker registration failed:", error);
        }
      })();
    });
  }
}

const rootElement = document.getElementById("root");
if (!rootElement) throw new Error("Failed to find the root element");

const root = ReactDOM.createRoot(rootElement);

root.render(
  <React.StrictMode>
    <Router>
      {/* Router must wrap everything that uses useNavigate */}
      <AuthProvider>
        {/* App will now contain the logic to fetch data and wrap itself in ModalProvider */}
        <App />
      </AuthProvider>
    </Router>
  </React.StrictMode>,
);
