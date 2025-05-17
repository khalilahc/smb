// src/views/PropheticVault.tsx
import React, { useEffect, useState } from "react";
import { getFirestore, collection, addDoc, query, where, onSnapshot, doc, updateDoc, deleteDoc } from "firebase/firestore";
import { firebaseApp } from "../firebase";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import Layout from "@/components/Layout";

const firestore = getFirestore(firebaseApp);

interface PropheticVaultProps {
  user: any;
}

interface Entry {
  id: string;
  message: string;
  tag?: string;
  createdAt: string;
  emoji?: string;
  isPublic?: boolean;
  comments?: Comment[];
}

interface Comment {
  user: string;
  text: string;
  createdAt: string;
}

export default function PropheticVault({ user }: PropheticVaultProps) {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [newEntry, setNewEntry] = useState("");
  const [tag, setTag] = useState("dream");
  const [isPublic, setIsPublic] = useState(false);
  const [filterTag, setFilterTag] = useState("all");
  const [filterVisibility, setFilterVisibility] = useState<"all" | "public" | "private">("all");
  const [searchKeyword, setSearchKeyword] = useState("");
  const [sortOrder, setSortOrder] = useState("newest");

  useEffect(() => {
    if (!user?.email) return;
    const q = query(collection(firestore, "propheticVault"), where("user", "==", user.email));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const list = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Entry));
      setEntries(list);
    });
    return unsubscribe;
  }, [user]);

  const handleSubmit = async () => {
    if (!newEntry.trim()) return;
    await addDoc(collection(firestore, "propheticVault"), {
      user: user.email,
      message: newEntry,
      tag,
      isPublic,
      createdAt: new Date().toISOString(),
      comments: []
    });
    setNewEntry("");
    setIsPublic(false);
  };

  const addReaction = async (id: string, emoji: string) => {
    await updateDoc(doc(firestore, "propheticVault", id), {
      emoji,
    });
  };

  const addComment = async (id: string, comment: string) => {
    const entryRef = doc(firestore, "propheticVault", id);
    const newComment: Comment = {
      user: user.displayName || user.email,
      text: comment,
      createdAt: new Date().toISOString()
    };
    const entry = entries.find(e => e.id === id);
    const updatedComments = [...(entry?.comments || []), newComment];
    await updateDoc(entryRef, { comments: updatedComments });

    // 🔔 Notify user via email (optional future hook or integration)
    // sendEmailNotification(entry.user, newComment)
  };

  const removeEntry = async (id: string) => {
    await deleteDoc(doc(firestore, "propheticVault", id));
  };

  const filteredEntries = entries
    .filter((e) => filterTag === "all" || e.tag === filterTag)
    .filter((e) => filterVisibility === "all" || (filterVisibility === "public" ? e.isPublic : !e.isPublic))
    .filter((e) => e.message.toLowerCase().includes(searchKeyword.toLowerCase()))
    .sort((a, b) => {
      const aTime = new Date(a.createdAt).getTime();
      const bTime = new Date(b.createdAt).getTime();
      return sortOrder === "newest" ? bTime - aTime : aTime - bTime;
    });

  return (
    <Layout>
      <div className="bg-white p-6 rounded shadow space-y-6">
        <h2 className="text-2xl font-bold text-purple-800">🔥 Prophetic Vault</h2>

        <form onSubmit={(e) => { e.preventDefault(); handleSubmit(); }} className="space-y-4">
          <textarea
            value={newEntry}
            onChange={(e) => setNewEntry(e.target.value)}
            placeholder="Enter your prophetic word..."
            className="w-full p-3 border border-pink-300 rounded"
          />
          <div className="flex items-center gap-3">
            <label className="text-sm">
              <input
                type="checkbox"
                checked={isPublic}
                onChange={() => setIsPublic(!isPublic)}
                className="mr-2"
              />
              Make public
            </label>
            <button type="submit" className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700">
              Submit Entry
            </button>
          </div>
        </form>

        <div className="flex gap-3 items-center mb-4">
          <select value={filterTag} onChange={(e) => setFilterTag(e.target.value)} className="p-2 border rounded">
            <option value="all">All Tags</option>
            <option value="dream">Dream</option>
            <option value="vision">Vision</option>
            <option value="word">Word</option>
          </select>
          <select value={filterVisibility} onChange={(e) => setFilterVisibility(e.target.value as any)} className="p-2 border rounded">
            <option value="all">All</option>
            <option value="public">Public Only</option>
            <option value="private">Private Only</option>
          </select>
        </div>

        <div className="space-y-4">
          {filteredEntries.map((entry) => (
            <div key={entry.id} className="p-4 bg-purple-50 border rounded shadow relative">
              <div className="text-sm text-gray-500 italic">
                {new Date(entry.createdAt).toLocaleString()} — {entry.tag} {entry.isPublic && <span className="ml-2 text-green-500">🌍 Public</span>}
              </div>
              <div className="text-gray-800 mt-1 whitespace-pre-line">{entry.message}</div>
              {entry.emoji && <div className="text-2xl absolute top-2 right-4">{entry.emoji}</div>}

              <div className="mt-2 space-x-2">
                {["🙏", "🔥", "❤️", "👑"].map((emo) => (
                  <button
                    key={emo}
                    onClick={() => addReaction(entry.id, emo)}
                    className="text-lg hover:scale-110 transition-transform"
                  >
                    {emo}
                  </button>
                ))}
                <button
                  onClick={() => removeEntry(entry.id)}
                  className="text-red-500 text-sm underline ml-4"
                >
                  Delete
                </button>
              </div>

              <div className="mt-4">
                <strong className="text-sm">Comments:</strong>
                <ul className="text-sm text-gray-700 space-y-1 mt-1">
                  {entry.comments?.map((c, i) => (
                    <li key={i}>
                      <span className="font-semibold">{c.user}</span>: {c.text}
                    </li>
                  ))}
                </ul>
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    const input = (e.currentTarget.elements.namedItem("comment") as HTMLInputElement).value;
                    if (input.trim()) addComment(entry.id, input);
                    e.currentTarget.reset();
                  }}
                  className="mt-2 flex gap-2"
                >
                  <input
                    name="comment"
                    type="text"
                    placeholder="Add a comment..."
                    className="flex-1 border border-gray-300 rounded px-2 py-1"
                  />
                  <button type="submit" className="text-sm bg-pink-500 text-white px-3 py-1 rounded">
                    Post
                  </button>
                </form>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Layout>
  );
}
