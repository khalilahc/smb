// src/views/Responses.tsx
import React, { useEffect, useState } from "react";
import {
  getFirestore,
  collection,
  onSnapshot,
  updateDoc,
  deleteDoc,
  doc,
} from "firebase/firestore";
import { firebaseApp } from "../firebase";
import Layout from "@/components/Layout";

const firestore = getFirestore(firebaseApp);

export default function Responses() {
  const [responses, setResponses] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [filterAnswered, setFilterAnswered] = useState("all");

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(firestore, "prayerResponses"), (snapshot) => {
      const list = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setResponses(list);
    });

    return unsubscribe;
  }, []);

  const toggleAnswered = async (id: string, current: boolean) => {
    await updateDoc(doc(firestore, "prayerResponses", id), { answered: !current });
  };

  const deleteResponse = async (id: string) => {
    const confirm = window.confirm("Are you sure you want to delete this response?");
    if (confirm) await deleteDoc(doc(firestore, "prayerResponses", id));
  };

  const filtered = responses.filter((r) => {
    const matchSearch = r.message.toLowerCase().includes(search.toLowerCase());
    const matchStatus =
      filterAnswered === "all" ||
      (filterAnswered === "answered" && r.answered) ||
      (filterAnswered === "unanswered" && !r.answered);
    return matchSearch && matchStatus;
  });

  return (
    <Layout>
      <div className="p-4 bg-white rounded shadow space-y-4">
        <h2 className="text-xl font-bold">📬 Prayer Responses</h2>

        <div className="flex flex-col md:flex-row md:items-center md:space-x-4 space-y-2 md:space-y-0">
          <input
            type="text"
            placeholder="Search responses..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="border p-2 rounded w-full md:w-1/2"
          />
          <select
            value={filterAnswered}
            onChange={(e) => setFilterAnswered(e.target.value)}
            className="border p-2 rounded w-full md:w-1/4"
          >
            <option value="all">All</option>
            <option value="answered">Answered</option>
            <option value="unanswered">Unanswered</option>
          </select>
        </div>

        {filtered.length === 0 ? (
          <p className="text-gray-600">No responses match your filter.</p>
        ) : (
          <ul className="space-y-3">
            {filtered.map((response) => (
              <li
                key={response.id}
                className={`border p-3 rounded shadow-sm ${
                  response.answered ? "bg-green-100 border-green-300" : "bg-yellow-50 border-yellow-200"
                }`}
              >
                <div className="flex justify-between items-center">
                  <strong className="text-green-800">
                    ✨ {response.title || "Answered Prayer"}
                  </strong>
                  {response.userName && (
                    <span className="text-xs text-gray-500">By {response.userName}</span>
                  )}
                </div>
                <p className="text-sm text-gray-700 mt-1">{response.message}</p>
                <p className="text-xs text-gray-400 mt-1 italic">
                  {response.createdAt && new Date(response.createdAt).toLocaleString()}
                </p>
                <div className="mt-2 flex gap-4">
                  <button
                    onClick={() => toggleAnswered(response.id, response.answered)}
                    className="text-sm text-blue-600 underline hover:text-blue-800"
                  >
                    {response.answered ? "Mark as Unanswered" : "Mark as Answered"}
                  </button>
                  <button
                    onClick={() => deleteResponse(response.id)}
                    className="text-sm text-red-600 underline hover:text-red-800"
                  >
                    Delete
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </Layout>
  );
}
