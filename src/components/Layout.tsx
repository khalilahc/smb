// src/components/Layout.tsx
import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";

export default function Layout({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const isDashboard = location.pathname === "/dashboard";
  const [menuOpen, setMenuOpen] = useState(false);

  const handleNavClick = () => setMenuOpen(false);

  return (
    <div className="min-h-screen px-4 pt-6 md:px-12 relative">
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur flex justify-between items-center mb-6 px-4 py-3 border-b border-pink-100 shadow-sm">
        <h1 className="text-xl font-bold text-pink-700">She Means Business</h1>
        <div className="flex items-center gap-4">
          {!isDashboard && (
            <Link
              to="/dashboard"
              className="text-sm text-pink-600 underline hover:text-pink-800 transition"
            >
              ← Back to Dashboard
            </Link>
          )}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="md:hidden text-sm text-pink-600 underline hover:text-pink-800"
          >
            ☰ Menu
          </button>
        </div>
      </header>

      {menuOpen && (
        <>
          <div className="fixed inset-0 bg-black/30 z-40" onClick={handleNavClick}></div>
          <div className="md:hidden px-4 pb-4 z-50 relative">
            <nav className="space-y-2 bg-white p-4 rounded shadow">
              <Link to="/bible-plan-tracker" className="block text-pink-700" onClick={handleNavClick}>📖 Bible Plan Tracker</Link>
              <Link to="/affirmations" className="block text-pink-700" onClick={handleNavClick}>🌸 Affirmations</Link>
              <Link to="/prayers" className="block text-pink-700" onClick={handleNavClick}>🙏 Prayers</Link>
              <Link to="/journal" className="block text-pink-700" onClick={handleNavClick}>📓 Journal</Link>
              <Link to="/rewards" className="block text-pink-700" onClick={handleNavClick}>🎁 Rewards</Link>
              {/* Add more links as needed */}
            </nav>
          </div>
        </>
      )}

      <main className="space-y-4">
        {children}
      </main>
    </div>
  );
}
