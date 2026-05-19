import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";
import { AuthProvider } from "./context/AuthContext";
// 🚨 FIX: ModalProvider moved to App.tsx to access data-dependent props
// import { ModalProvider } from "./context/ModalContext";
import { BrowserRouter as Router } from "react-router-dom";

const rootElement = document.getElementById("root");
if (!rootElement) throw new Error("Failed to find the root element");

const root = ReactDOM.createRoot(rootElement);

root.render(
  <React.StrictMode>
    <Router>
      {" "}
      {/* Router must wrap everything that uses useNavigate */}
      <AuthProvider>
        {/* App will now contain the logic to fetch data and wrap itself in ModalProvider */}
        <App />
      </AuthProvider>
    </Router>
  </React.StrictMode>,
);
