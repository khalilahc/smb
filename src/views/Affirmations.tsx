// src/views/Affirmations.tsx
import React, { useState, useEffect } from "react";
import { getFirestore, collection, addDoc, onSnapshot } from "firebase/firestore";
import { firebaseApp } from "../firebase";
import Layout from "@/components/Layout";

const firestore = getFirestore(firebaseApp);

export default function Affirmations() {
  const [affirmations, setAffirmations] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const generateAffirmation = async () => {
    setLoading(true);
    try {
      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer YOUR_API_KEY_HERE`, // replace with secure method
        },
        body: JSON.stringify({
          model: "gpt-3.5-turbo",
          messages: [
            {
              role: "system",
              content: "You are a motivational coach who crafts affirmations inspired by the book 'She Means Business'.",
            },
            {
              role: "user",
              content: "Give me a powerful affirmation inspired by 'She Means Business'.",
            },
          ],
        }),
      });

      const data = await response.json();
      const message = data.choices[0].message.content.trim();

      await addDoc(collection(firestore, "affirmations"), {
        text: message,
        createdAt: new Date().toISOString(),
      });
    } catch (err) {
      console.error("Affirmation generation failed:", err);
    }
    setLoading(false);
  };

  useEffect(() => {
    const unsub = onSnapshot(collection(firestore, "affirmations"), (snapshot) => {
      const list = snapshot.docs.map((doc) => doc.data());
      setAffirmations(list);
    });
    return unsub;
  }, []);

  return (
    <Layout>
      <div className="p-6 max-w-2xl mx-auto bg-white rounded shadow">
        <h2 className="text-2xl font-bold mb-4">🌸 AI Affirmations</h2>
        <button
          onClick={generateAffirmation}
          disabled={loading}
          className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700"
        >
          {loading ? "Thinking..." : "Generate Affirmation"}
        </button>

        <ul className="mt-6 space-y-2">
          {affirmations.map((entry, i) => (
            <li key={i} className="p-3 border rounded bg-purple-50">
              {entry.text}
            </li>
          ))}
        </ul>
      </div>
    </Layout>
  );
}
