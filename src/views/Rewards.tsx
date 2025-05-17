// src/views/Rewards.tsx
import React, { useEffect, useState } from "react";
import {
  getFirestore,
  collection,
  onSnapshot,
  query,
  where,
  addDoc,
  getDocs,
  doc,
  updateDoc,
} from "firebase/firestore";
import { firebaseApp } from "../firebase";
import confetti from "canvas-confetti";
import Layout from "@/components/Layout";

const firestore = getFirestore(firebaseApp);

const playTrumpetSound = () => {
  const audio = new Audio("/sounds/trumpet.mp3");
  audio.play().catch((err) => console.error("Trumpet sound error:", err));
};

export default function Rewards() {
  const [rewards, setRewards] = useState<any[]>([]);

  const checkAndAwardRewards = async () => {
    const journalQuery = query(collection(firestore, "journalEntries"));
    const journalSnap = await getDocs(journalQuery);

    const prayerQuery = query(collection(firestore, "prayerResponses"));
    const prayerSnap = await getDocs(prayerQuery);

    const journalCount = journalSnap.size;
    const prayerCount = prayerSnap.size;

    const newRewards: any[] = [];

    if (journalCount >= 7) {
      newRewards.push({
        title: "Journal Streak!",
        description: "You journaled for 7 days straight!",
        createdAt: new Date().toISOString(),
      });
    }

    if (prayerCount >= 3) {
      newRewards.push({
        title: "Answered Believer",
        description: "3 prayers were answered. Keep believing!",
        createdAt: new Date().toISOString(),
      });
    }

    for (const reward of newRewards) {
      await addDoc(collection(firestore, "rewards"), reward);
      confetti({
        particleCount: 150,
        spread: 80,
        origin: { y: 0.6 },
      });
      playTrumpetSound();
    }
  };

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(firestore, "rewards"), (snapshot) => {
      const list = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setRewards(list);
    });

    checkAndAwardRewards();

    return unsubscribe;
  }, []);

  const earnedTitles = rewards.map(r => r.title);

  const badgeCatalog = [
    { title: "Journal Streak!", icon: "📓" },
    { title: "Answered Believer", icon: "🙏" },
    { title: "Prayer Warrior", icon: "🛡️" },
    { title: "Consistent Contributor", icon: "⏰" },
    { title: "Faithful Friend", icon: "🤝" },
  ];

  return (
    <Layout>
      <div className="p-4 bg-white rounded shadow space-y-6">
        <h2 className="text-2xl font-bold mb-4 text-yellow-800">🏆 Your Rewards</h2>

        {rewards.length === 0 ? (
          <p className="text-gray-600">No rewards yet. Write more, pray more. Your crown awaits.</p>
        ) : (
          <>
            <ul className="space-y-3">
              {rewards.map((reward) => (
                <li
                  key={reward.id}
                  className="border p-3 rounded bg-yellow-50 shadow-sm hover:shadow-md transition"
                >
                  <strong className="text-yellow-800">🎖️ {reward.title}</strong>
                  <p className="text-sm text-gray-700 mt-1">{reward.description}</p>
                  <p className="text-xs text-gray-400 mt-1 italic">
                    {reward.createdAt && new Date(reward.createdAt).toLocaleString()}
                  </p>
                </li>
              ))}
            </ul>

            <div className="border-t pt-4 mt-6">
              <h3 className="text-lg font-semibold text-purple-800 mb-2">📈 Reward Timeline</h3>
              <ol className="list-decimal pl-6 text-sm text-gray-700">
                {[...rewards]
                  .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
                  .map((reward, idx) => (
                    <li key={idx}>
                      <span className="text-yellow-700 font-medium">{reward.title}</span> – {new Date(reward.createdAt).toLocaleDateString()}
                    </li>
                  ))}
              </ol>
            </div>

            <div className="border-t pt-4 mt-6">
              <h3 className="text-lg font-semibold text-purple-800 mb-2">🖼️ Badge Wall</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {badgeCatalog.map((badge) => {
                  const earned = earnedTitles.includes(badge.title);
                  return (
                    <div
                      key={badge.title}
                      className={`flex flex-col items-center p-4 border rounded-lg shadow transition hover:shadow-lg ${earned ? "bg-yellow-100" : "bg-gray-100 opacity-40"}`}
                      title={badge.title}
                    >
                      <div className="text-4xl animate-bounce">{badge.icon}</div>
                      <div className="text-sm font-bold text-center mt-2 text-yellow-800">
                        {badge.title}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </>
        )}
      </div>
    </Layout>
  );
}
