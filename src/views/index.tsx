// src/views/BusinessDirectory/index.tsx
import React, { useEffect, useState } from "react";
import { getFirestore, collection, getDocs } from "firebase/firestore";
import { firebaseApp } from "@/firebase";
import Layout from "@/components/Layout";
import { Link } from "react-router-dom";

const firestore = getFirestore(firebaseApp);

interface Business {
  id: string;
  name: string;
  description: string;
  category: string;
  website?: string;
  email?: string;
}

export default function BusinessDirectory() {
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [search, setSearch] = useState("all");

  useEffect(() => {
    const fetchBusinesses = async () => {
      const snapshot = await getDocs(collection(firestore, "business-directory"));
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Business));
      setBusinesses(data);
    };
    fetchBusinesses();
  }, []);

  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-4 py-10">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-pink-700">🏢 Business Directory</h1>
          <Link to="/business/new" className="text-sm text-purple-600 underline hover:text-purple-800">
            + Submit Your Business
          </Link>
        </div>
        <p className="mb-6 text-pink-500 italic">Discover businesses submitted by Queens in your community</p>

        <div className="flex gap-3 mb-6">
          <input
            type="text"
            placeholder="Search by name..."
            onChange={(e) => setSearch(e.target.value)}
            className="border border-pink-300 rounded px-3 py-1 w-full"
          />
        </div>

        {businesses.length === 0 ? (
          <p className="text-gray-500">No businesses found yet. Be the first to add one!</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {businesses
              .filter((biz) => search === "all" || biz.name.toLowerCase().includes(search.toLowerCase()))
              .map((biz) => (
                <div
                  key={biz.id}
                  className="border border-pink-200 p-4 rounded shadow hover:shadow-lg transition"
                >
                  <h3 className="text-xl font-semibold text-purple-800 mb-2">{biz.name}</h3>
                  <p className="text-sm text-gray-600 mb-2">{biz.description}</p>
                  <p className="text-sm text-pink-600 italic">Category: {biz.category}</p>
                  {biz.website && (
                    <a
                      href={biz.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-500 underline block mt-2"
                    >
                      Visit Website
                    </a>
                  )}
                </div>
              ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
