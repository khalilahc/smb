// src/views/PrayerRequests.tsx
import React, { useState, useEffect } from "react";
import {
  getFirestore,
  collection,
  addDoc,
  onSnapshot,
  doc,
  updateDoc,
  arrayUnion,
} from "firebase/firestore";
import { firebaseApp } from "../firebase";
import { FaRegSmile, FaRegGrinStars } from "react-icons/fa";
import confetti from "canvas-confetti";
import Layout from "@/components/Layout";

const firestore = getFirestore(firebaseApp);

export default function PrayerRequests() {
  const [request, setRequest] = useState("");
  const [requests, setRequests] = useState<any[]>([]);
  const [comments, setComments] = useState<{ [key: string]: string }>({});
  const [reactions, setReactions] = useState<{ [key: string]: string }>({});

  const submitRequest = async () => {
    if (!request.trim()) return;
    await addDoc(collection(firestore, "prayerRequests"), {
      text: request,
      createdAt: new Date().toISOString(),
      comments: [],
    });
    setRequest("");
    confetti({
      particleCount: 150,
      spread: 100,
      origin: { y: 0.5 },
      shapes: ["circle"],
      colors: ["#ffffff", "#e9d8fd"],
    });
  };

  const submitComment = async (id: string) => {
    const comment = comments[id];
    if (!comment?.trim()) return;

    const docRef = doc(firestore, "prayerRequests", id);
    await updateDoc(docRef, {
      comments: arrayUnion({ text: comment, createdAt: new Date().toISOString() }),
    });
    setComments({ ...comments, [id]: "" });
  };

  useEffect(() => {
    const unsub = onSnapshot(collection(firestore, "prayerRequests"), (snap) => {
      const list = snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setRequests(list);
    });
    return unsub;
  }, []);

  return (
    <Layout>
      <div className="p-4 bg-white rounded shadow animate-fade-in">
        <h2 className="text-xl font-bold mb-4 text-indigo-800">🙏 Submit a Prayer Request</h2>
        <textarea
          value={request}
          onChange={(e) => setRequest(e.target.value)}
          placeholder="What’s on your heart today?"
          className="w-full p-3 border rounded mb-4"
        />
        <button
          onClick={submitRequest}
          className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700"
        >
          Submit Request
        </button>

        <div className="mt-6">
          <h3 className="text-lg font-semibold text-indigo-700 mb-2">🕊️ Community Requests</h3>
          {requests.length === 0 ? (
            <p className="text-gray-500 italic">No requests yet. Be the first to open your heart.</p>
          ) : (
            <ul className="space-y-4">
              {requests.map((r, idx) => (
                <li key={r.id} className="p-4 bg-gray-100 border rounded shadow-sm">
                  <p className="mb-2">{r.text}</p>

                  <div className="flex items-center gap-3 text-xl mb-2">
                    <button onClick={() => setReactions({ ...reactions, [r.id]: "✨" })}>✨</button>
                    <button onClick={() => setReactions({ ...reactions, [r.id]: "❤️" })}>❤️</button>
                    <button onClick={() => setReactions({ ...reactions, [r.id]: "🙏" })}>🙏</button>
                    {reactions[r.id] && <span className="ml-2">{reactions[r.id]}</span>}
                  </div>

                  <input
                    type="text"
                    placeholder="Leave a comment..."
                    value={comments[r.id] || ""}
                    onChange={(e) => setComments({ ...comments, [r.id]: e.target.value })}
                    className="w-full p-2 border rounded mb-2"
                  />
                  <button
                    onClick={() => submitComment(r.id)}
                    className="text-sm text-purple-600 hover:underline"
                  >
                    Post Comment
                  </button>

                  {r.comments?.length > 0 && (
                    <ul className="mt-2 space-y-1 text-sm text-gray-600">
                      {r.comments.map((c: any, i: number) => (
                        <li key={i} className="ml-2">💬 {c.text}</li>
                      ))}
                    </ul>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </Layout>
  );
}
