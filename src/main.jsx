// src/main.jsx
import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import AppRouter from "./Capacitor";
import "./index.css";
import { HuddleProvider, HuddleClient } from "@huddle01/react";

const huddleClient = new HuddleClient({
  projectId: "ak_sahuUymyVEh9GdSe", // replace with your real project ID
});

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <HuddleProvider client={huddleClient}>
      <BrowserRouter>
        <AppRouter />
      </BrowserRouter>
    </HuddleProvider>
  </React.StrictMode>
);
