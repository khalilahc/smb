// src/views/Badges.tsx
import React, { useEffect, useState } from "react";
import { getFirestore, collection, onSnapshot, setDoc, doc } from "firebase/firestore";
import { firebaseApp } from "../firebase";
import { motion } from "framer-motion";
import confetti from "canvas-confetti";
import Layout from "@/components/Layout";

const firestore = getFirestore(firebaseApp);

const badgeCriteria = [
  { id: "dayOne", label: "Day 1 Devotee", condition: (entries: any[]) => entries.length >= 1 },
  { id: "streakFive", label: "5-Day Streak", condition: (entries: any[]) => entries.length >= 5 },
  { id: "angelicWriter", label: "Angelic Writer", condition: (entries: any[]) => entries.some(e => e.category === "Angelic Downloads") },
];

export default function Badges() {
  const [badges, setBadges] = useState<any[]>([]);

  useEffect(() => {
    const entriesUnsub = onSnapshot(collection(firestore, "journalEntries"), (snap) => {
      const entries = snap.docs.map(doc => doc.data());
      evaluateBadges(entries);
    });

    const badgeUnsub = onSnapshot(collection(firestore, "badges"), (snap) => {
      const data = snap.docs.map(doc => doc.data());
      setBadges(data);
    });

    return () => {
      entriesUnsub();
      badgeUnsub();
    };
  }, []);

  const evaluateBadges = async (entries: any[]) => {
    for (let badge of badgeCriteria) {
      if (badge.condition(entries)) {
        const ref = doc(firestore, "badges", badge.id);
        await setDoc(ref, { id: badge.id, label: badge.label }, { merge: true });
        confetti({ particleCount: 100, spread: 70, origin: { y: 0.4 } });
      }
    }
  };

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-pink-50 to-yellow-100 py-10 px-4">
        <div className="max-w-3xl mx-auto bg-white rounded-3xl p-6 shadow-xl border-4 border-yellow-100">
          <h2 className="text-4xl font-extrabold text-pink-700 mb-6 text-center">🏆 Your Badges</h2>
          <p className="text-center text-pink-600 italic mb-8">Because spiritual growth deserves sparkle and applause.</p>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {badges.map((badge, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                className="bg-pink-100 border-2 border-yellow-400 rounded-xl p-4 shadow-md text-center"
              >
                <div className="text-3xl mb-2">✨</div>
                <div className="font-bold text-pink-800">{badge.label}</div>
              </motion.div>
            ))}
          </div>

          <div className="mt-10 text-center text-xs text-gray-400 italic">
            More badges coming soon... including "Holy Hustler" and "Crowned Visionary".
          </div>
        </div>
      </div>
    </Layout>
  );
}
