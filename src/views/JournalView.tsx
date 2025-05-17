import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  getFirestore,
  collection,
  addDoc,
  onSnapshot,
  query,
  orderBy,
  serverTimestamp,
  doc,
  updateDoc,
  increment,
  limit
} from "firebase/firestore";
import { firebaseApp } from "../firebase";
import confetti from "canvas-confetti";
import Layout from "@/components/Layout";

const firestore = getFirestore(firebaseApp);

const dailyPrompts = [
  "What bold step did you take today toward your calling?",
  "Describe a moment today where you felt divine alignment.",
  "What lie did you kick to the curb today?",
  "What fear did you face, and what truth replaced it?",
  "Which Queen in your community inspired you today?"
];

const categories = ["Wins", "Fears", "Angelic Downloads", "Business Clarity"];

export default function Journal() {
  const location = useLocation();
  const [entry, setEntry] = useState("");
  const [category, setCategory] = useState(categories[0]);
  const [entries, setEntries] = useState<any[]>([]);
  const [prompt, setPrompt] = useState("");
  const [leaderboard, setLeaderboard] = useState<any[]>([]);

  useEffect(() => {
    const today = new Date().getDate();
    setPrompt(dailyPrompts[today % dailyPrompts.length]);

    const q = query(collection(firestore, "journalEntries"), orderBy("createdAt", "desc"));
    const unsubEntries = onSnapshot(q, (snap) => {
      const list = snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setEntries(list);
    });

    const lbQuery = query(collection(firestore, "userStats"), orderBy("couragePoints", "desc"), limit(5));
    const unsubLB = onSnapshot(lbQuery, (snap) => {
      const list = snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setLeaderboard(list);
    });

    Notification.requestPermission().then((permission) => {
      if (permission === "granted") {
        const hours = 24;
        const timeout = setTimeout(() => {
          new Notification("📝 Your Royal Journal Awaits", {
            body: "Take a few moments to reflect and shine.",
            icon: "/crown.png"
          });
        }, 1000 * 60 * 60 * hours);
        return () => clearTimeout(timeout);
      }
    });

    return () => {
      unsubEntries();
      unsubLB();
    };
  }, []);

  const handleSubmit = async () => {
    if (!entry.trim()) return;

    await addDoc(collection(firestore, "journalEntries"), {
      text: entry,
      category,
      createdAt: serverTimestamp()
    });

    const userStatsRef = doc(firestore, "userStats", "globalCourage");
    await updateDoc(userStatsRef, {
      couragePoints: increment(1)
    });

    setEntry("");
    confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 } });
  };

  const handleDownload = async () => {
    alert("In-app purchase flow coming soon! Prepare your tiara.");
  };

  return (
    <Layout>
      {location.pathname !== "/dashboard" && (
        <div className="mb-4 p-4">
          <Link
            to="/dashboard"
            className="inline-block text-sm text-pink-600 underline hover:text-pink-800"
          >
            ← Back to Dashboard
          </Link>
        </div>
      )}
      <div className="p-6 bg-pink-50 rounded-xl shadow-xl animate-fade-in">
        <h2 className="text-3xl font-extrabold text-pink-700 mb-4 text-center">👑 Journal Your Royal Journey</h2>
        <p className="mb-4 italic text-pink-500 text-center">✨ Prompt: {prompt}</p>

        <div className="flex flex-col items-center space-y-2">
          <select
            className="p-2 border-2 border-pink-400 rounded-lg text-sm w-1/2 text-pink-700"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            {categories.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>

          <textarea
            value={entry}
            onChange={(e) => setEntry(e.target.value)}
            placeholder="Pour your brilliance into the page..."
            className="w-full md:w-3/4 p-3 border-2 border-pink-300 rounded-lg mb-2 bg-white"
          />

          <button
            onClick={handleSubmit}
            className="bg-pink-600 text-white font-semibold px-6 py-2 rounded-full shadow hover:bg-pink-700 transition"
          >
            💌 Submit Entry
          </button>
        </div>

        <div className="mt-10">
          <h3 className="text-xl font-bold text-pink-700 mb-3">📖 Your Entries</h3>
          <ul className="space-y-3">
            {entries.map((e) => (
              <li key={e.id} className="p-4 bg-white border-l-4 border-pink-400 shadow rounded-lg">
                <div className="text-xs text-pink-600 mb-1 font-semibold">{e.category}</div>
                <div className="text-gray-800">{e.text}</div>
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-12 bg-white p-6 rounded-xl shadow border border-pink-200">
          <h3 className="text-lg font-bold text-pink-700 mb-4">👑 Courage Leaderboard</h3>
          {leaderboard.length === 0 ? (
            <p className="text-gray-500 italic">No crowns awarded... yet.</p>
          ) : (
            <ul className="space-y-3">
              {leaderboard.map((user, i) => (
                <li key={user.id} className="flex justify-between bg-pink-50 p-3 rounded-full shadow">
                  <span className="font-medium">🌟 {user.id}</span>
                  <span className="font-bold text-pink-600">{user.couragePoints} pts</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="mt-10 text-center">
          <button
            onClick={handleDownload}
            className="bg-yellow-400 text-white px-6 py-2 font-semibold rounded-full shadow-lg hover:bg-yellow-500"
          >
            ✨ Download Devotional
          </button>
        </div>

        <div className="mt-8 pt-4 text-center text-sm text-pink-400 italic border-t border-pink-200">
          Printed version coming soon. With glitter, of course 💖
        </div>
      </div>
    </Layout>
  );
}
