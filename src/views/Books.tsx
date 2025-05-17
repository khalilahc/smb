import React, { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { getFirestore, collection, onSnapshot, updateDoc, doc } from "firebase/firestore";
import { firebaseApp } from "../firebase";
import { motion } from "framer-motion";
import Layout from "@/components/Layout";
import { Dialog } from "@headlessui/react";

const firestore = getFirestore(firebaseApp);
const currentUser = "queen@example.com"; // mock auth user

interface Book {
  id: string;
  title: string;
  author: string;
  description: string;
  genre: string;
  coverUrl: string;
  readUrl?: string;
  audioUrl?: string;
  favorites?: string[];
}

export default function BooksRoom() {
  const [books, setBooks] = useState<Book[]>([]);
  const [previewBook, setPreviewBook] = useState<Book | null>(null);
  const [searchParams, setSearchParams] = useSearchParams();

  const genreFilter = searchParams.get("genre") || "All";
  const viewMode = (searchParams.get("view") as "grid" | "list") || "grid";
  const favoritesOnly = searchParams.get("favs") === "1";

  const updateFilter = (key: string, value: string) => {
    const newParams = new URLSearchParams(searchParams);
    newParams.set(key, value);
    setSearchParams(newParams);
  };

  useEffect(() => {
    const unsub = onSnapshot(collection(firestore, "books"), (snap) => {
      const data = snap.docs.map((doc) => ({ id: doc.id, ...doc.data() })) as Book[];
      setBooks(data);
    });
    return () => unsub();
  }, []);

  const genres = ["All", ...Array.from(new Set(books.map((b) => b.genre).filter(Boolean)))];
  let filtered = genreFilter === "All" ? books : books.filter((b) => b.genre === genreFilter);
  if (favoritesOnly) filtered = filtered.filter((b) => b.favorites?.includes(currentUser));

  const toggleFavorite = async (book: Book) => {
    const ref = doc(firestore, "books", book.id);
    const favs = book.favorites || [];
    const updated = favs.includes(currentUser)
      ? favs.filter((u) => u !== currentUser)
      : [...favs, currentUser];
    await updateDoc(ref, { favorites: updated });
  };

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-pink-100 p-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
            <h1 className="text-4xl font-bold text-pink-700">📚 Royal Reading Room</h1>
            <div className="flex flex-wrap gap-2 items-center">
              <select
                className="border border-pink-300 rounded-full px-3 py-1 text-sm"
                value={genreFilter}
                onChange={(e) => updateFilter("genre", e.target.value)}
              >
                {genres.map((g) => (
                  <option key={g}>{g}</option>
                ))}
              </select>
              <button
                onClick={() => updateFilter("favs", favoritesOnly ? "0" : "1")}
                className={`px-3 py-1 rounded-full text-sm ${favoritesOnly ? "bg-pink-600 text-white" : "bg-white border border-pink-300"}`}
              >
                {favoritesOnly ? "★ Showing Favorites" : "☆ Favorites Only"}
              </button>
              <button
                className={`px-3 py-1 rounded-full text-sm ${viewMode === "grid" ? "bg-pink-600 text-white" : "bg-white border border-pink-300"}`}
                onClick={() => updateFilter("view", "grid")}
              >
                Grid View
              </button>
              <button
                className={`px-3 py-1 rounded-full text-sm ${viewMode === "list" ? "bg-pink-600 text-white" : "bg-white border border-pink-300"}`}
                onClick={() => updateFilter("view", "list")}
              >
                List View
              </button>
              <Link
                to="/books?favs=1"
                className="ml-2 text-sm text-pink-600 underline hover:text-pink-800"
              >
                My Favorites
              </Link>
            </div>
          </div>

          {/* Content remains unchanged */}
        </div>
      </div>
    </Layout>
  );
}
