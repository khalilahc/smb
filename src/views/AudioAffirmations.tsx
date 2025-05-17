// src/views/AudioAffirmations.tsx
import React, { useState, useEffect } from "react";
import {
  collection,
  addDoc,
  onSnapshot,
  getFirestore
} from "firebase/firestore";
import { firebaseApp } from "../firebase";
import Layout from "../components/Layout";

const firestore = getFirestore(firebaseApp);

export default function AudioAffirmations() {
  const [affirmations, setAffirmations] = useState<any[]>([]);
  const [inputText, setInputText] = useState("");
  const [inputAudioUrl, setInputAudioUrl] = useState("");

  const addAffirmation = async () => {
    if (!inputText.trim() || !inputAudioUrl.trim()) return;

    await addDoc(collection(firestore, "audioAffirmations"), {
      text: inputText,
      audioUrl: inputAudioUrl,
      createdAt: new Date().toISOString()
    });

    setInputText("");
    setInputAudioUrl("");
  };

  useEffect(() => {
    const unsub = onSnapshot(collection(firestore, "audioAffirmations"), (snapshot) => {
      const list = snapshot.docs.map((doc) => doc.data());
      setAffirmations(list);
    });
    return unsub;
  }, []);

  return (
    <Layout>
      <div className="p-6 max-w-2xl mx-auto bg-white rounded shadow">
        <h2 className="text-2xl font-bold mb-4">🔊 Audio Affirmations</h2>

        <div className="space-y-4 mb-6">
          <input
            type="text"
            placeholder="Affirmation text"
            className="w-full p-2 border rounded"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
          />
          <input
            type="url"
            placeholder="Audio file URL (e.g. mp3 link)"
            className="w-full p-2 border rounded"
            value={inputAudioUrl}
            onChange={(e) => setInputAudioUrl(e.target.value)}
          />
          <button
            onClick={addAffirmation}
            className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700"
          >
            Add Affirmation
          </button>
        </div>

        <ul className="space-y-4">
          {affirmations.map((a, i) => (
            <li key={i} className="border p-3 rounded bg-purple-50">
              <p className="mb-2 font-medium">💬 {a.text}</p>
              <audio controls src={a.audioUrl} className="w-full" />
            </li>
          ))}
        </ul>
      </div>
    </Layout>
  );
}
