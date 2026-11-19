import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import Game from "./Game.jsx";
import "./style.css";

const rootElement = document.getElementById("root");

if (!rootElement) {
  throw new Error("THE EARTH: Root element was not found.");
}

const isGamePage = window.location.pathname === "/game";

createRoot(rootElement).render(
  <React.StrictMode>
    {isGamePage ? <Game /> : <App />}
  </React.StrictMode>
);
