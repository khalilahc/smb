// src/views/BusinessDirectory.tsx
import React, { useEffect, useState } from "react";
import { getFirestore, collection, onSnapshot, query, orderBy, addDoc, serverTimestamp, getDocs } from "firebase/firestore";
import { firebaseApp } from "../firebase";
import Layout from "@/components/Layout";
import { getAuth } from "firebase/auth";

const firestore = getFirestore(firebaseApp);
const auth = getAuth(firebaseApp);

interface Business {
  id?: string;
  name: string;
  category: string;
  description: string;
  website?: string;
  imageUrl?: string;
  createdBy?: string;
}

export default function BusinessDirectory() {
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [filtered, setFiltered] = useState<Business[]>([]);
  const [category, setCategory] = useState("All");
  const [search, setSearch] = useState("");
  const [visibleCount, setVisibleCount] = useState(6);
  const [formData, setFormData] = useState<Business>({ name: "", category: "", description: "", website: "", imageUrl: "" });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const q = query(collection(firestore, "businesses"), orderBy("name"));
    const unsub = onSnapshot(q, (snap) => {
      const data = snap.docs.map((doc) => ({ id: doc.id, ...doc.data() })) as Business[];
      setBusinesses(data);
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    const matchSearch = (biz: Business) => biz.name.toLowerCase().includes(search.toLowerCase());
    const matchCategory = (biz: Business) => category === "All" || biz.category === category;
    setFiltered(businesses.filter(biz => matchSearch(biz) && matchCategory(biz)));
  }, [businesses, search, category]);

  const categories = ["All", ...Array.from(new Set(businesses.map((b) => b.category).filter(Boolean)))];

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const user = auth.currentUser;
    if (!user) return alert("You must be logged in to submit a business.");
    setSubmitting(true);
    try {
      const docs = await getDocs(query(collection(firestore, "businesses")));
      const exists = docs.docs.some(doc => doc.data().name.toLowerCase() === formData.name.toLowerCase());
      if (exists) {
        alert("❌ A business with that name already exists.");
      } else {
        await addDoc(collection(firestore, "businesses"), {
          ...formData,
          createdAt: serverTimestamp(),
          createdBy: user.uid,
        });
        alert("✅ Business profile submitted successfully!");
        setFormData({ name: "", category: "", description: "", website: "", imageUrl: "" });
      }
    } catch (err) {
      console.error("Failed to submit business", err);
      alert("❌ Failed to submit. Try again.");
    }
    setSubmitting(false);
  };

  return (
    <Layout>
      <div className="max-w-6xl mx-auto p-6">
        <h1 className="text-3xl font-bold text-pink-700 mb-4 text-center">🏬 Business Directory</h1>
        <p className="text-pink-500 italic text-center mb-10">Discover businesses submitted by Queens in your community</p>

        <form onSubmit={handleFormSubmit} className="bg-white p-4 border rounded-lg mb-8 space-y-3">
          <h2 className="text-lg font-bold text-pink-600">✨ Submit Your Business</h2>
          <input name="name" required placeholder="Business Name" value={formData.name} onChange={handleFormChange} className="w-full p-2 border rounded" />
          <textarea name="description" required placeholder="Description" value={formData.description} onChange={handleFormChange} className="w-full p-2 border rounded" />
          <input name="category" required placeholder="Category" value={formData.category} onChange={handleFormChange} className="w-full p-2 border rounded" />
          <input name="website" placeholder="Website (optional)" value={formData.website} onChange={handleFormChange} className="w-full p-2 border rounded" />
          <input name="imageUrl" placeholder="Image URL (optional)" value={formData.imageUrl} onChange={handleFormChange} className="w-full p-2 border rounded" />
          <button type="submit" disabled={submitting} className="bg-pink-600 text-white px-4 py-2 rounded">
            {submitting ? "Submitting..." : "Submit Business"}
          </button>
        </form>

        <div className="flex flex-col md:flex-row justify-between gap-4 mb-8">
          <input
            type="text"
            placeholder="Search by name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 p-2 border border-pink-300 rounded"
          />
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="p-2 border border-pink-300 rounded w-full md:w-60"
          >
            {categories.map((cat) => (
              <option key={cat}>{cat}</option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {filtered.slice(0, visibleCount).map((biz) => (
            <div key={biz.id} className="bg-white border border-pink-200 rounded-xl shadow p-4">
              {biz.imageUrl && (
                <img src={biz.imageUrl} alt={biz.name} className="w-full h-40 object-cover rounded mb-3" />
              )}
              <h2 className="text-lg font-bold text-pink-800">{biz.name}</h2>
              <p className="text-sm text-gray-600 italic">{biz.category}</p>
              <p className="mt-2 text-sm text-gray-800">{biz.description}</p>
              {biz.website && (
                <a
                  href={biz.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block mt-2 text-sm text-purple-600 underline"
                >
                  Visit Website ↗
                </a>
              )}
            </div>
          ))}
        </div>

        {visibleCount < filtered.length && (
          <div className="text-center mt-8">
            <button
              onClick={() => setVisibleCount((v) => v + 6)}
              className="px-6 py-2 bg-pink-600 text-white rounded-full shadow hover:bg-pink-700"
            >
              Load More
            </button>
          </div>
        )}
      </div>
    </Layout>
  );
}
