import React from "react";
import { BrowserRouter } from "react-router-dom";
import { UserProvider } from "./context/UserContext";
import AppRoutes from "./routes";

export default function App() {
  return (
    <BrowserRouter>
      <UserProvider>
        <AppRoutes />
      </UserProvider>
    </BrowserRouter>
  );
}
