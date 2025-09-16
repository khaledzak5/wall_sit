import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./styles/tailwind.css";
import "./styles/index.css";

// Apply persisted theme early (before React render) to avoid flash
try {
  const savedTheme = localStorage.getItem('theme');
  if (savedTheme === 'dark') {
    document.documentElement.classList.add('dark');
  } else if (savedTheme === 'light') {
    document.documentElement.classList.remove('dark');
  }
} catch (e) {
  // ignore (e.g., localStorage not available)
}

const container = document.getElementById("root");
const root = createRoot(container);

root.render(<App />);
