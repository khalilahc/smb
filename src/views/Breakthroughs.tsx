// src/views/Breakthroughs.tsx
import React, { useState, useEffect } from "react";
import { collection, addDoc, onSnapshot, getFirestore } from "firebase/firestore";
import { firebaseApp } from "../firebase";
import confetti from "canvas-confetti";
import Layout from "@/components/Layout";

const firestore = getFirestore(firebaseApp);

export default function Breakthroughs() {
  const [input, setInput] = useState("");
  const [entries, setEntries] = useState<any[]>([]);

  const submitBreakthrough = async () => {
    if (!input.trim()) return;

    await addDoc(collection(firestore, "breakthroughs"), {
      text: input,
      createdAt: new Date().toISOString(),
    });

    setInput("");

    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
    });
  };

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(firestore, "breakthroughs"), (snapshot) => {
      const list = snapshot.docs.map((doc) => doc.data());
      setEntries(list);
    });

    return unsubscribe;
  }, []);

  return (
    <Layout>
      <div className="p-4 bg-white rounded shadow">
        <h2 className="text-xl font-bold mb-4">💡 Your Breakthroughs</h2>

        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Share your revelation..."
          className="w-full p-2 border rounded mb-4"
        />

        <button
          onClick={submitBreakthrough}
          className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700"
        >
          Submit
        </button>

        <ul className="mt-6 space-y-2">
          {entries.map((entry, idx) => (
            <li key={idx} className="p-2 border rounded bg-purple-50">
              {entry.text}
            </li>
          ))}
        </ul>
      </div>
    </Layout>
  );
}
