// src/firebase.ts
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage"; // ✅ this line
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyDXOEO10P0L0UmMSA7hDcU0F5qL-rmQKCk",
  authDomain: "she-means-business.firebaseapp.com",
  projectId: "she-means-business",
  storageBucket: "she-means-business.appspot.com",
  messagingSenderId: "386539232938",
  appId: "1:386539232938:web:afa3949784d1a6db24fad3"
};

export const firebaseApp = initializeApp(firebaseConfig);
export const firestore = getFirestore(firebaseApp);
export const auth = getAuth(firebaseApp);
export const storage = getStorage(firebaseApp); // ✅ add this line
