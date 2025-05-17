// src/components/DailyAffirmations.tsx
import React, { useEffect, useState } from "react";
import { getFirestore, collection, query, where, orderBy, limit, getDocs } from "firebase/firestore";
import { firebaseApp } from "../firebase";

const db = getFirestore(firebaseApp);

// Affirmations based on general emotional buckets
const affirmationsMap: Record<string, string[]> = {
  happy: [
    "You are a magnet for goodness.",
    "Joy flows effortlessly through you.",
    "Shine on, Queen."
  ],
  sad: [
    "Even now, you are worthy.",
    "Tears water purpose.",
    "You are held in love."
  ],
  angry: [
    "You are more than the moment.",
    "Peace returns to you now.",
    "Your strength is sacred."
  ],
  tired: [
    "Rest is your revolution.",
    "Pause is power.",
    "You deserve softness."
  ],
  anxious: [
    "You are safe in this moment.",
    "Breathe, beautiful. You've got this.",
    "Let go. Let God."
  ],
  default: [
    "You are becoming all you were made to be.",
    "Heaven backs your boldness.",
    "Divine favor surrounds you like a shield."
  ]
};

export default function DailyAffirmations({ userId }: { userId: string }) {
  const [affirmations, setAffirmations] = useState<string[]>([]);

  useEffect(() => {
    const fetchMoodAndSetAffirmations = async () => {
      let mood: string | undefined;

      try {
        const moodQuery = query(
          collection(db, "moods"),
          where("userId", "==", userId),
          orderBy("timestamp", "desc"),
          limit(1)
        );
        const moodSnap = await getDocs(moodQuery);
        if (!moodSnap.empty) {
          mood = moodSnap.docs[0].data().mood?.toLowerCase();
        }
      } catch (e) {
        console.error("Mood fetch failed:", e);
      }

      const pool = affirmationsMap[mood || ""] || affirmationsMap.default;
      const shuffled = [...pool].sort(() => 0.5 - Math.random());
      setAffirmations(shuffled.slice(0, 3));
    };

    fetchMoodAndSetAffirmations();
  }, [userId]);

  return (
    <div className="bg-pink-100 p-6 rounded-lg shadow-lg mt-4">
      <h3 className="text-2xl font-bold text-purple-700 mb-4">💖 Daily Affirmations</h3>
      <ul className="space-y-2 text-pink-800 italic">
        {affirmations.map((a, i) => (
          <li key={i}>✨ {a}</li>
        ))}
      </ul>
    </div>
  );
}
