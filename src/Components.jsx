import { initializeApp } from "firebase/app";
import React, { useEffect, useState, useRef } from "react";
import {
  addDoc,
  query,
  collection,
  onSnapshot,
  getFirestore
} from "firebase/firestore";
import {
  getAuth,
  onAuthStateChanged,
  signInWithPopup,
  GoogleAuthProvider
} from "firebase/auth";
import html2pdf from "html2pdf.js";
import confetti from "canvas-confetti";
import HTMLFlipBook from "react-pageflip";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import crownImg from './assets/crown.png';
import castleBg from './assets/castle.jpg';

const firebaseConfig = {
  apiKey: "YAIzaSyDXOEO10P0L0UmMSA7hDcU0F5qL-rmQKCk",
  authDomain: "she-means-business.firebaseapp.com",
  projectId: "she-means-business",
  storageBucket: "she-means-business.firebasestorage.app",
  messagingSenderId: "386539232938",
  appId: "1:386539232938:web:afa3949784d1a6db24fad3"
};

const app = initializeApp(firebaseConfig);
const firestore = getFirestore(app);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

function DivineChatroom() {
  return <div className="p-8 text-purple-700 text-center bg-cover" style={{ backgroundImage: `url(${castleBg})` }}>
    <h2 className="text-2xl font-bold">🌸 Divine Chatroom</h2>
    <p className="mt-2">Vision, Identity, Purpose, Healing, Legacy rooms coming soon.</p>
    <img src={crownImg} alt="crown" className="mx-auto mt-4 w-20 animate-bounce" />
  </div>;
}

function MoodDashboard() {
  return <div className="p-8 text-purple-800 text-center">
    <h2 className="text-2xl font-bold">💖 Mood Dashboard</h2>
    <p>Select how you feel today and receive an affirmation.</p>
    <div className="flex justify-center gap-4 mt-6">
      {['😊', '😢', '😠', '🥰', '😌'].map((mood, i) => <button key={i} className="text-4xl hover:scale-110">{mood}</button>)}
    </div>
  </div>;
}

function MemberDirectory() {
  return <div className="p-8 text-purple-700 text-center">
    <h2 className="text-2xl font-bold">👑 Queen’s Court Directory</h2>
    <p className="mt-2">Browse other radiant queens and their glow-up progress.</p>
    <div className="mt-4">[Directory feature coming soon]</div>
  </div>;
}

function AudioAffirmations() {
  return <div className="p-8 text-purple-700 text-center">
    <h2 className="text-2xl font-bold">🔊 Audio Affirmations</h2>
    <audio controls className="mt-4 mx-auto">
      <source src="/affirmations/queen-glow.mp3" type="audio/mpeg" />
      Your browser does not support the audio element.
    </audio>
  </div>;
}

function Dashboard({ user }) {
  const [journalEntries, setJournalEntries] = useState([]);
  const trumpetRef = useRef(null);

  useEffect(() => {
    const q = query(collection(firestore, "journal_entries"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const entries = snapshot.docs.map(doc => doc.data()).filter(entry => entry.user === user.email);
      setJournalEntries(entries);
    });
    return unsubscribe;
  }, [user]);

  const exportPDF = () => {
    const container = document.getElementById("journal-export");
    if (!container) return alert("Nothing to export");
    html2pdf().from(container).save("Queens-Journal.pdf");
  };

  return (
    <div className="p-6 space-y-6 text-purple-900 bg-gradient-to-br from-pink-100 to-purple-100 min-h-screen">
      <audio ref={trumpetRef} src="/sounds/trumpet.mp3" preload="auto" />
      <div className="bg-white p-4 rounded shadow flex justify-between items-center">
        <h2 className="text-xl font-bold mb-2">Welcome, Queen {user.displayName?.split(" ")[0] || ""} 💫</h2>
        <img src={crownImg} alt="Crown" className="w-10" />
      </div>

      <div className="flex flex-wrap gap-4">
        <Link to="/flipbook" className="bg-indigo-500 text-white px-4 py-2 rounded shadow">📖 Flipbook Experience</Link>
        <Link to="/chatroom" className="bg-pink-600 text-white px-4 py-2 rounded shadow">💬 Divine Chatroom</Link>
        <Link to="/moods" className="bg-yellow-400 text-white px-4 py-2 rounded shadow">💖 Mood Dashboard</Link>
        <Link to="/directory" className="bg-green-400 text-white px-4 py-2 rounded shadow">👑 Queen Directory</Link>
        <Link to="/audio" className="bg-purple-500 text-white px-4 py-2 rounded shadow">🔊 Affirmations</Link>
        <button onClick={exportPDF} className="bg-green-500 text-white px-4 py-2 rounded shadow">📄 Export to PDF</button>
      </div>

      <div id="journal-export" className="bg-white p-4 rounded shadow">
        <h2 className="text-xl font-semibold mb-2">📝 Your Journal Entries</h2>
        <ul className="list-disc ml-6">
          {journalEntries.map((entry, i) => (
            <li key={i}><strong>{entry.title}</strong>: {entry.content}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default function BlessedDashboardWrapper() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
    });
    return unsubscribe;
  }, []);

  const login = async () => {
    try {
      await signInWithPopup(auth, provider);
    } catch (error) {
      alert("Login failed: " + error.message);
    }
  };

  if (!user) {
    return (
      <div className="p-8 text-center bg-gradient-to-br from-yellow-100 to-purple-200 min-h-screen">
        <h1 className="text-3xl font-bold mb-4">Welcome to Queen’s Journal 👑</h1>
        <button onClick={login} className="bg-purple-600 text-white px-6 py-2 rounded shadow">Sign In with Google</button>
      </div>
    );
  }

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Dashboard user={user} />} />
        <Route path="/chatroom" element={<DivineChatroom />} />
        <Route path="/flipbook" element={<FlipbookExperience />} />
        <Route path="/moods" element={<MoodDashboard />} />
        <Route path="/directory" element={<MemberDirectory />} />
        <Route path="/audio" element={<AudioAffirmations />} />
      </Routes>
    </Router>
  );
}
