import React, { useEffect, useState } from "react";
import { useParams, useLocation, Link } from "react-router-dom";
import {
  getFirestore,
  collection,
  addDoc,
  serverTimestamp,
  doc,
  updateDoc,
  increment,
  getDoc,
  setDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  deleteDoc,
  updateDoc as updateReflectionDoc
} from "firebase/firestore";
import { firebaseApp } from "../firebase";
import Layout from "@/components/Layout";

const firestore = getFirestore(firebaseApp);
const currentUser = "queen@example.com"; // Replace with actual auth logic

export default function BiblePlan() {
  const { day } = useParams();
  const location = useLocation();
  const [verse, setVerse] = useState("");
  const [reflection, setReflection] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [reflections, setReflections] = useState<any[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState("");

  useEffect(() => {
    const fetchVerse = async () => {
      const docRef = doc(firestore, "biblePlans", day!);
      const snap = await getDoc(docRef);
      if (snap.exists()) {
        setVerse(snap.data().verse || "No verse for today.");
      } else {
        setVerse("Verse not found.");
      }
    };
    fetchVerse();
  }, [day]);

  useEffect(() => {
    const q = query(
      collection(firestore, "reflections"),
      where("day", "==", Number(day)),
      orderBy("createdAt", "desc")
    );
    const unsub = onSnapshot(q, (snap) => {
      const list = snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setReflections(list);
    });
    return unsub;
  }, [day]);

  const handleSubmit = async () => {
    if (!reflection.trim()) return;

    await addDoc(collection(firestore, "reflections"), {
      day: Number(day),
      text: reflection,
      createdAt: serverTimestamp(),
      user: currentUser,
    });

    const userStatsRef = doc(firestore, "userStats", "globalCourage");
    await updateDoc(userStatsRef, {
      couragePoints: increment(1),
    });

    await setDoc(doc(firestore, "devotionalProgress", `day-${day}`), {
      day: Number(day),
      timestamp: serverTimestamp(),
    });

    setReflection("");
    setSubmitted(true);
  };

  const handleDelete = async (id: string) => {
    const confirmed = window.confirm("Are you sure you want to delete this reflection?");
    if (confirmed) {
      await deleteDoc(doc(firestore, "reflections", id));
    }
  };

  const handleEdit = async (id: string, text: string) => {
    setEditingId(id);
    setEditText(text);
  };

  const handleSaveEdit = async (id: string) => {
    if (!editText.trim()) return;
    await updateReflectionDoc(doc(firestore, "reflections", id), { text: editText });
    setEditingId(null);
    setEditText("");
  };

  return (
    <Layout>
      {location.pathname !== "/dashboard" && (
        <div className="mb-4 p-4">
          <Link
            to="/dashboard"
            className="inline-block text-sm text-pink-600 underline hover:text-pink-800"
          >
            ← Back to Dashboard
          </Link>
        </div>
      )}
      <div className="max-w-3xl mx-auto p-6 bg-white rounded-xl shadow-md">
        <h1 className="text-2xl font-bold text-pink-700 mb-4">📖 Devotional</h1>
        <p className="text-pink-600 italic mb-6">{verse}</p>

        {submitted ? (
          <div className="text-green-600 font-semibold">✅ Reflection submitted! Keep shining.</div>
        ) : (
          <>
            <textarea
              value={reflection}
              onChange={(e) => setReflection(e.target.value)}
              placeholder="Write your thoughts, Queen..."
              className="w-full p-3 border-2 border-pink-300 rounded-lg mb-2 bg-pink-50"
              rows={5}
            />
            <button
              onClick={handleSubmit}
              className="bg-pink-600 text-white px-6 py-2 font-semibold rounded-lg shadow hover:bg-pink-700"
            >
              💌 Submit Reflection
            </button>
          </>
        )}

        <div className="mt-10">
          <h2 className="text-lg font-bold text-pink-700 mb-3">📝 Reflections</h2>
          {reflections.length === 0 ? (
            <p className="text-gray-500 italic">No reflections shared yet.</p>
          ) : (
            <ul className="space-y-3">
              {reflections.map((r) => (
                <li
                  key={r.id}
                  className={`p-3 rounded shadow border-l-4 space-y-1 ${
                    r.user === currentUser
                      ? "bg-yellow-50 border-yellow-400"
                      : "bg-pink-50 border-pink-300"
                  }`}
                >
                  <div className="text-xs text-gray-500 italic">
                    {r.user === currentUser ? "👑 You" : r.user || "Anonymous"}
                  </div>
                  {editingId === r.id ? (
                    <>
                      <textarea
                        value={editText}
                        onChange={(e) => setEditText(e.target.value)}
                        className="w-full border border-pink-300 p-2 rounded"
                      />
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleSaveEdit(r.id)}
                          className="text-sm bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700"
                        >
                          Save
                        </button>
                        <button
                          onClick={() => setEditingId(null)}
                          className="text-sm bg-gray-300 px-3 py-1 rounded hover:bg-gray-400"
                        >
                          Cancel
                        </button>
                      </div>
                    </>
                  ) : (
                    <>
                      <p className="text-sm text-gray-800">{r.text}</p>
                      {r.user === currentUser && (
                        <div className="flex gap-2 mt-1">
                          <button
                            onClick={() => handleEdit(r.id, r.text)}
                            className="text-xs text-blue-600 underline"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(r.id)}
                            className="text-xs text-red-500 underline"
                          >
                            Delete
                          </button>
                        </div>
                      )}
                    </>
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
