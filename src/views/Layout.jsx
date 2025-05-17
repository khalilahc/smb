// src/views/Layout.jsx
import React from "react";

export default function Layout({ children }) {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-pink-600 text-white text-center py-4 font-bold text-lg shadow">
        📖 She Means Business — Devotional App
      </header>

      <main className="flex-grow bg-pink-50 px-4 py-6">
        {children}
      </main>

      <footer className="text-center text-xs text-pink-600 py-3 border-t border-pink-200">
        &copy; {new Date().getFullYear()} She Means Business. All rights reserved.
      </footer>
    </div>
  );
}
