// scripts/seedBooks.ts
import { initializeApp } from "firebase/app";
import { getFirestore, setDoc, doc, serverTimestamp } from "firebase/firestore";
import { firebaseConfig } from "../firebase"; // adjust this path to your actual firebase config

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const books = [
  {
    id: "she-means-business",
    title: "She Means Business",
    author: "Kay",
    description: "A devotional journey for purpose-driven queens building empires.",
    price: 999, // $9.99
    coverImageUrl: "https://example.com/covers/she-means-business.jpg",
    previewUrl: "https://example.com/previews/she-means-business.pdf",
    purchaseUrl: "https://your-checkout.com/she-means-business",
    category: "Devotional",
    featured: true,
    createdAt: serverTimestamp(),
  },
  {
    id: "warrior-prayers",
    title: "Warrior Prayers",
    author: "Kay",
    description: "Prayers forged in fire for battle-tested believers.",
    price: 1299, // $12.99
    coverImageUrl: "https://example.com/covers/warrior-prayers.jpg",
    previewUrl: "https://example.com/previews/warrior-prayers.pdf",
    purchaseUrl: "https://your-checkout.com/warrior-prayers",
    category: "Prayer",
    featured: false,
    createdAt: serverTimestamp(),
  },
];

async function seedBooks() {
  for (let book of books) {
    const ref = doc(db, "books", book.id);
    await setDoc(ref, book);
    console.log(`🔥 Added book: ${book.title}`);
  }

  console.log("✅ All books seeded. May your readers be forever inspired.");
}

seedBooks().catch((err) => {
  console.error("❌ Seeding failed:", err);
});
