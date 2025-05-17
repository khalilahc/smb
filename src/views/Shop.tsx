// src/views/Shop.tsx
import React, { useState, useEffect } from "react";
import { getFirestore, collection, onSnapshot, addDoc } from "firebase/firestore";
import { firebaseApp } from "../firebase";
import confetti from "canvas-confetti";
import Layout from "@/components/Layout";

const firestore = getFirestore(firebaseApp);

const itemsForSale = [
  { id: "1", name: "Golden Pen", price: 50 },
  { id: "2", name: "Heavenly Candle", price: 75 },
  { id: "3", name: "Virtue Crown", price: 100 },
];

export default function Shop() {
  const [inventory, setInventory] = useState<any[]>([]);
  const [balance, setBalance] = useState<number>(0);

  useEffect(() => {
    const unsub = onSnapshot(collection(firestore, "rewards"), (snap) => {
      const rewardPoints = snap.docs.length * 25; // simple logic: each reward = 25 pts
      setBalance(rewardPoints);
    });

    const invUnsub = onSnapshot(collection(firestore, "inventory"), (snap) => {
      const items = snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setInventory(items);
    });

    return () => {
      unsub();
      invUnsub();
    };
  }, []);

  const purchase = async (item: any) => {
    if (balance < item.price) {
      alert("Not enough holy coins. Go pray and earn more!");
      return;
    }

    await addDoc(collection(firestore, "inventory"), item);
    confetti({
      particleCount: 200,
      spread: 120,
      origin: { y: 0.6 },
      colors: ["#b794f4", "#f6e05e", "#faf089", "#9f7aea"],
    });

    const trumpet = new Audio("https://www.soundjay.com/misc/sounds/trumpet-fanfare-01.mp3");
    trumpet.play().catch(() => console.log("Trumpet failed to play like a shy angel."));

    alert(`You have purchased ${item.name}! You glorious shopper of light.`);
  };

  return (
    <div className="p-4 bg-white rounded shadow animate-fade-in relative">
      <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-full h-20 bg-gradient-to-r from-red-600 to-pink-500 animate-pulse z-0"></div>
      <div className="relative z-10">
        <h2 className="text-2xl font-bold mb-4 text-indigo-800">🛍️ Divine Boutique</h2>
        <p className="mb-4 text-pink-600 font-medium">Balance: {balance} ✨</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {itemsForSale.map((item) => (
            <div
              key={item.id}
              className="border-2 border-indigo-300 p-4 rounded-xl bg-gradient-to-r from-purple-100 to-indigo-100 shadow-md hover:shadow-lg transition duration-200"
            >
              <h3 className="font-semibold text-indigo-900 text-lg">{item.name}</h3>
              <p className="text-sm text-gray-700">Price: {item.price} ✨</p>
              <button
                onClick={() => purchase(item)}
                className="mt-3 px-4 py-2 bg-pink-500 text-white font-bold rounded-lg hover:bg-pink-600 shadow"
              >
                Buy Now 💸
              </button>
            </div>
          ))}
        </div>

        <div className="mt-10">
          <h3 className="text-xl font-bold mb-2 text-indigo-800">🎒 Your Inventory</h3>
          {inventory.length === 0 ? (
            <p className="text-gray-500 italic">You own nothing. Just like a minimalist nun.</p>
          ) : (
            <ul className="list-disc pl-6 text-gray-800">
              {inventory.map((item) => (
                <li key={item.id} className="py-1">{item.name}</li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
