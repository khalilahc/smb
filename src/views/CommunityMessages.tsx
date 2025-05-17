// src/views/CommunityMessages.tsx
import React, { useState, useEffect } from "react";
import {
  getFirestore,
  collection,
  addDoc,
  onSnapshot,
  serverTimestamp,
  query,
  orderBy,
  updateDoc,
  doc,
  arrayUnion,
  arrayRemove
} from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { firebaseApp } from "../firebase";
import Layout from "@/components/Layout";

const firestore = getFirestore(firebaseApp);
const auth = getAuth(firebaseApp);

interface Comment {
  userName: string;
  avatar: string;
  text: string;
  createdAt: string;
  uid: string;
}

export default function CommunityMessages() {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<any[]>([]);
  const [commentText, setCommentText] = useState<Record<string, string>>({});
  const user = auth.currentUser;

  useEffect(() => {
    const q = query(collection(firestore, "communityMessages"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (snap) => {
      const list = snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setMessages(list);
    });
    return unsubscribe;
  }, []);

  const handleSubmit = async () => {
    if (!message.trim() || !user) return;

    await addDoc(collection(firestore, "communityMessages"), {
      text: message,
      createdAt: serverTimestamp(),
      userName: user.displayName || "Anonymous",
      avatar: user.photoURL || "https://ui-avatars.com/api/?name=Queen",
      uid: user.uid,
      reactions: {},
      comments: []
    });
    setMessage("");
  };

  const handleReaction = async (msgId: string, emoji: string) => {
    const messageRef = doc(firestore, "communityMessages", msgId);
    const msg = messages.find((m) => m.id === msgId);
    const newCount = (msg.reactions?.[emoji] || 0) + 1;
    await updateDoc(messageRef, {
      [`reactions.${emoji}`]: newCount
    });
  };

  const handleComment = async (msgId: string) => {
    if (!user || !commentText[msgId]?.trim()) return;

    const newComment: Comment = {
      userName: user.displayName || "Anonymous",
      avatar: user.photoURL || "https://ui-avatars.com/api/?name=Queen",
      text: commentText[msgId],
      createdAt: new Date().toISOString(),
      uid: user.uid
    };

    const msgRef = doc(firestore, "communityMessages", msgId);
    await updateDoc(msgRef, {
      comments: arrayUnion(newComment)
    });

    setCommentText((prev) => ({ ...prev, [msgId]: "" }));
  };

  const handleDeleteComment = async (msgId: string, comment: Comment) => {
    const msgRef = doc(firestore, "communityMessages", msgId);
    await updateDoc(msgRef, {
      comments: arrayRemove(comment)
    });
  };

  const shareMessage = (msg: any) => {
    const text = encodeURIComponent(`From ${msg.userName}: ${msg.text}`);
    const url = encodeURIComponent(window.location.href);
    const shareUrl = `https://twitter.com/intent/tweet?text=${text}&url=${url}`;
    window.open(shareUrl, "_blank");
  };

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-purple-100 via-pink-100 to-yellow-100 py-10 px-4">
        <div className="max-w-3xl mx-auto p-6 bg-white rounded-3xl shadow-lg border-2 border-purple-200">
          <h2 className="text-3xl font-extrabold text-purple-700 text-center mb-6">💬 Community Messages</h2>
          <p className="text-center text-purple-500 italic mb-4">
            Share encouragement, inspiration, or just sprinkle some glitter.
          </p>

          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Drop a message for your sisters..."
            className="w-full p-4 border-2 border-purple-300 rounded-lg bg-purple-50 text-lg mb-4"
          />

          <div className="flex justify-center">
            <button
              onClick={handleSubmit}
              className="bg-purple-600 text-white font-bold px-6 py-2 rounded-full hover:bg-purple-700 transition-all"
            >
              ✨ Send Message
            </button>
          </div>

          <div className="mt-8">
            <h3 className="text-xl font-semibold text-purple-700 mb-4">🌟 Message Board</h3>
            <ul className="space-y-4">
              {messages.map((msg) => (
                <li key={msg.id} className="p-4 bg-purple-50 rounded-xl border-l-4 border-purple-400 shadow">
                  <div className="flex items-center gap-3 mb-2">
                    <img src={msg.avatar} alt="avatar" className="w-8 h-8 rounded-full" />
                    <span className="font-semibold text-purple-800">{msg.userName}</span>
                  </div>
                  <p className="text-purple-800 text-base mb-2">{msg.text}</p>

                  <div className="flex gap-2 text-xl mb-2">
                    {["❤️", "🙌", "🔥", "👏", "💎"].map((emoji) => (
                      <button key={emoji} onClick={() => handleReaction(msg.id, emoji)}>
                        {emoji} {msg.reactions?.[emoji] || 0}
                      </button>
                    ))}
                    <button onClick={() => shareMessage(msg)} className="text-sm text-blue-500 underline ml-4">
                      🔗 Share
                    </button>
                  </div>

                  <div className="mt-3 space-y-2">
                    <input
                      value={commentText[msg.id] || ""}
                      onChange={(e) => setCommentText({ ...commentText, [msg.id]: e.target.value })}
                      placeholder="Write a reply..."
                      className="w-full p-2 border rounded"
                    />
                    <button
                      onClick={() => handleComment(msg.id)}
                      className="bg-pink-500 text-white px-3 py-1 rounded"
                    >
                      💬 Reply
                    </button>
                    {msg.comments?.length > 0 && (
                      <div className="mt-3 text-sm text-gray-700 space-y-2">
                        {msg.comments.map((c: Comment, idx: number) => (
                          <div key={idx} className="bg-pink-50 p-2 rounded">
                            <div className="flex items-center gap-2 mb-1">
                              <img src={c.avatar} alt="avatar" className="w-6 h-6 rounded-full" />
                              <strong>{c.userName}</strong>
                              <span className="text-xs text-gray-400 ml-2">{new Date(c.createdAt).toLocaleString()}</span>
                              {user?.uid === c.uid && (
                                <button
                                  onClick={() => handleDeleteComment(msg.id, c)}
                                  className="ml-auto text-xs text-red-500 hover:underline"
                                >
                                  Delete
                                </button>
                              )}
                            </div>
                            <div>{c.text}</div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </Layout>
  );
}
