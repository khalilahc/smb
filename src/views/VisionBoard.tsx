// Full VisionBoard wrapped in Layout with tab memory and Dashboard link
import React, { useState, useEffect } from "react";
import {
  getFirestore,
  collection,
  addDoc,
  onSnapshot,
  serverTimestamp,
  deleteDoc,
  doc,
  updateDoc,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  getDocs,
  arrayUnion,
  arrayRemove,
  getDoc
} from "firebase/firestore";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { firebaseApp } from "../firebase";
import Layout from "@/components/Layout";
import { Link } from "react-router-dom";

interface VisionComment {
  text: string;
  user: string;
  createdAt: string;
  replies?: VisionComment[];
  likes?: string[];
}

interface VisionItem {
  id: string;
  imageUrl: string;
  caption: string;
  createdAt: any;
  user: string;
  userName?: string;
  favorites?: string[];
  isPublic: boolean;
  comments?: VisionComment[];
}

const firestore = getFirestore(firebaseApp);
const storage = getStorage(firebaseApp);
const currentUser = "queen@example.com";

const VisionBoard = () => {
  const [items, setItems] = useState<VisionItem[]>([]);
  const [caption, setCaption] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [tab, setTab] = useState<"all" | "mine">(() => (localStorage.getItem("visionTab") as "all" | "mine") || "all");

  useEffect(() => {
    const q = query(collection(firestore, "visionBoard"), orderBy("createdAt", "desc"));
    const unsub = onSnapshot(q, (snap) => {
      const data = snap.docs.map((doc) => ({ id: doc.id, ...doc.data() } as VisionItem));
      setItems(data);
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    localStorage.setItem("visionTab", tab);
  }, [tab]);

  const toggleFavorite = async (item: VisionItem) => {
    const ref = doc(firestore, "visionBoard", item.id);
    const isFav = item.favorites?.includes(currentUser);
    await updateDoc(ref, {
      favorites: isFav ? arrayRemove(currentUser) : arrayUnion(currentUser)
    });
    if (!isFav && item.user !== currentUser) {
      try {
        const userDoc = await getDoc(doc(firestore, "users", item.user));
        const userData = userDoc.exists() ? userDoc.data() : null;
        const name = userData?.name || item.userName || "A Queen";
        new Notification("💖 New Like on Your Vision", {
          body: `${name}, someone just liked your vision board!`,
          icon: "/crown.png"
        });
      } catch (err) {
        console.error("Notification error:", err);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !caption.trim()) return;
    try {
      const fileRef = ref(storage, `vision/${Date.now()}_${file.name}`);
      const snap = await uploadBytes(fileRef, file);
      const url = await getDownloadURL(snap.ref);
      await addDoc(collection(firestore, "visionBoard"), {
        imageUrl: url,
        caption,
        createdAt: serverTimestamp(),
        user: currentUser,
        userName: "Queen",
        isPublic: true,
        favorites: [],
        comments: []
      });
      setFile(null);
      setCaption("");
    } catch (err) {
      console.error("Upload failed", err);
    }
  };

  const filteredItems = tab === "mine" ? items.filter(i => i.user === currentUser) : items;

  const mostLiked = [...items]
    .filter(i => i.isPublic && (i.favorites?.length || 0) > 0)
    .sort((a, b) => (b.favorites?.length || 0) - (a.favorites?.length || 0))
    .slice(0, 6);

  return (
    <Layout>
      <div className="p-6">
        <div className="text-center mb-6">
          <Link to="/dashboard" className="text-sm text-pink-600 underline hover:text-pink-800">
            ← Back to Dashboard
          </Link>
        </div>

        <div className="mb-8">
         
        </div>

        <h1 className="text-2xl font-bold text-center mb-4">🖼️ Vision Board</h1>
        <p className="text-center text-sm text-pink-500 mb-4">Explore and share your divine visions</p>

        <div className="sticky top-0 z-10 bg-white mb-6 shadow-sm border-b pb-2 flex justify-center gap-4">
          <button
            className={`px-4 py-1 rounded-full text-sm ${tab === "all" ? "bg-pink-600 text-white" : "bg-pink-100 text-pink-700"}`}
            onClick={() => setTab("all")}
          >
            All Visions
          </button>
          <button
            className={`px-4 py-1 rounded-full text-sm ${tab === "mine" ? "bg-pink-600 text-white" : "bg-pink-100 text-pink-700"}`}
            onClick={() => setTab("mine")}
          >
            My Visions
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mb-10 max-w-xl mx-auto bg-white p-4 rounded-xl shadow space-y-4">
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
            className="w-full border border-pink-200 rounded p-2"
          />
          <input
            type="text"
            placeholder="Caption your vision..."
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            className="w-full border border-pink-200 rounded p-2"
          />
          <button type="submit" className="w-full bg-pink-600 text-white py-2 rounded hover:bg-pink-700">
            ✨ Add to Vision Board
          </button>
        </form>

        {tab === "all" && mostLiked.length > 0 && (
          <div className="mb-10">
            <h2 className="text-lg font-semibold text-pink-600 mb-2 text-center">💖 Most Liked</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {mostLiked.map((vision) => (
                <div key={vision.id} className="bg-white rounded-xl shadow p-4">
                  <img src={vision.imageUrl} alt="vision" className="w-full h-40 object-cover rounded mb-2" />
                  <p className="text-sm text-gray-700">{vision.caption}</p>
                  <p className="text-xs text-pink-500 mt-1">Likes: {vision.favorites?.length || 0}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {filteredItems.map((item) => (
            <div key={item.id} className="bg-white rounded-xl shadow p-4">
              <img src={item.imageUrl} alt="vision" className="w-full h-40 object-cover rounded mb-2" />
              <p className="text-sm font-medium text-gray-800">{item.caption}</p>
              <p className="text-xs text-gray-500">{item.userName || item.user}</p>
              <button
                onClick={() => toggleFavorite(item)}
                className="mt-2 text-xs text-pink-600 hover:text-pink-800"
              >
                {item.favorites?.includes(currentUser) ? "💖" : "🤍"} {item.favorites?.length || 0} Like
              </button>
            </div>
          ))}
        </div>
      </div>
    </Layout>
  );
};

export default VisionBoard;
