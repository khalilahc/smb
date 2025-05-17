// src/views/ChatRoom.tsx
import React, { useState, useEffect } from "react";
import {
  collection,
  addDoc,
  onSnapshot,
  getFirestore,
  Timestamp,
  query,
  orderBy,
} from "firebase/firestore";
import { firebaseApp } from "../firebase";
import { getAuth } from "firebase/auth";
import confetti from "canvas-confetti";
import Layout from "@/components/Layout";

const firestore = getFirestore(firebaseApp);
const auth = getAuth(firebaseApp);

export default function ChatRoom() {
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState("");

  const sendMessage = async () => {
    const user = auth.currentUser;
    if (!input.trim() || !user) return;

    await addDoc(collection(firestore, "chatMessages"), {
      text: input,
      timestamp: Timestamp.now(),
      displayName: user.displayName,
      uid: user.uid,
    });

    setInput("");

    confetti({ particleCount: 40, spread: 60, origin: { y: 0.6 } });
  };

  useEffect(() => {
    const q = query(collection(firestore, "chatMessages"), orderBy("timestamp", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const list = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setMessages(list);
    });
    return unsubscribe;
  }, []);

  return (
    <Layout>
      <div className="max-w-2xl mx-auto p-6 bg-white rounded shadow">
        <h2 className="text-xl font-bold mb-4">💬 Royal Chat Room</h2>
        <div className="mb-4 space-y-2 max-h-64 overflow-y-auto">
          {messages.map((msg) => (
            <div key={msg.id} className="bg-purple-100 p-2 rounded">
              <strong>{msg.displayName || "Anonymous"}:</strong> {msg.text}
            </div>
          ))}
        </div>
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Type your message..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="flex-grow p-2 border rounded"
          />
          <button
            onClick={sendMessage}
            className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700"
          >
            Send
          </button>
        </div>
      </div>
    </Layout>
  );
}
