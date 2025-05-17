// src/views/DailyAffirmations.tsx
import React, { useEffect, useState } from "react";
import { getFirestore, doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
import { firebaseApp } from "../firebase";
import Layout from "@/components/Layout";
import jsPDF from "jspdf";
import { Link, Outlet, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";

const firestore = getFirestore(firebaseApp);

interface DailyAffirmationsProps {
  userId: string;
}

export default function DailyAffirmations({ userId }: DailyAffirmationsProps) {
  const [affirmation, setAffirmation] = useState<string>("Loading today's affirmation...");
  const [input, setInput] = useState<string>("");
  const [selectedDate, setSelectedDate] = useState<string>(() => {
    const today = new Date();
    return today.toISOString().split("T")[0];
  });
  const [liked, setLiked] = useState(false);

  const location = useLocation();

  const fetchAffirmation = async (dateKey: string) => {
    const ref = doc(firestore, "daily-affirmations", dateKey);
    const snap = await getDoc(ref);
    if (snap.exists()) {
      const data = snap.data();
      setAffirmation(data.text || "You are radiant and resilient.");
      setLiked(data.likes?.includes(userId) || false);
    } else {
      setAffirmation("No affirmation found for this date.");
    }
  };

  useEffect(() => {
    fetchAffirmation(selectedDate);
  }, [selectedDate]);

  const handleSubmit = async () => {
    if (!input.trim()) return;
    const ref = doc(firestore, "daily-affirmations", selectedDate);
    await setDoc(ref, { text: input.trim(), submittedBy: userId, likes: [] });
    setAffirmation(input.trim());
    setInput("");
    setLiked(false);
    alert("✨ Affirmation submitted successfully!");
  };

  const toggleLike = async () => {
    const ref = doc(firestore, "daily-affirmations", selectedDate);
    const snap = await getDoc(ref);
    if (!snap.exists()) return;
    const data = snap.data();
    const currentLikes = data.likes || [];
    const updatedLikes = liked ? currentLikes.filter((id: string) => id !== userId) : [...currentLikes, userId];
    await updateDoc(ref, { likes: updatedLikes });
    setLiked(!liked);
  };

  const handleExport = () => {
    const docPDF = new jsPDF();
    docPDF.text("Daily Affirmation", 20, 20);
    docPDF.text(`Date: ${selectedDate}`, 20, 30);
    docPDF.text(`Affirmation: ${affirmation}`, 20, 40);
    docPDF.save(`affirmation-${selectedDate}.pdf`);
  };

  const handleShare = () => {
    const shareText = `🌸 Daily Affirmation (${selectedDate}):\n\n\"${affirmation}\"`;
    const shareURL = `mailto:?subject=Daily Affirmation&body=${encodeURIComponent(shareText)}`;
    window.open(shareURL);
  };

  return (
    <Layout>
      <div className="min-h-screen flex flex-col items-center justify-center bg-pink-50 text-center p-8 space-y-6">
        <h1 className="text-3xl font-bold text-pink-700">🌸 Daily Affirmation</h1>

        <input
          type="date"
          className="border rounded px-3 py-1 text-sm"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
        />

        <p className="text-lg text-pink-900 bg-yellow-100 px-6 py-4 rounded-xl shadow-lg max-w-xl">
          {affirmation}
        </p>

        <div className="flex gap-3 flex-wrap justify-center">
          <button
            onClick={toggleLike}
            className={`px-4 py-2 rounded font-bold text-white ${liked ? "bg-green-600" : "bg-gray-500"}`}
          >
            {liked ? "❤️ Liked" : "♡ Like"}
          </button>
          <button
            onClick={handleExport}
            className="bg-blue-500 text-white px-4 py-2 rounded font-semibold hover:bg-blue-600"
          >
            ⬇️ Export PDF
          </button>
          <button
            onClick={handleShare}
            className="bg-pink-500 text-white px-4 py-2 rounded font-semibold hover:bg-pink-600"
          >
            📤 Share via Email
          </button>
        </div>

        <textarea
          className="w-full max-w-xl border border-pink-300 rounded p-3 text-sm"
          rows={3}
          placeholder="Write your affirmation..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
        ></textarea>

        <button
          onClick={handleSubmit}
          className="bg-pink-700 hover:bg-pink-800 text-white font-semibold px-6 py-2 rounded shadow"
        >
          ✍️ Submit Affirmation
        </button>

        <div className="pt-10">
          <Link
            to="affirmations"
            className="text-purple-700 underline hover:text-purple-900"
          >
            Go to Affirmations Vault →
          </Link>

          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="mt-6"
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </Layout>
  );
}
