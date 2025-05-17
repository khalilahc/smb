// src/views/CreateRoom.tsx

import { getFirestore, collection, addDoc } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { firebaseApp } from "@/firebase";
import { generateTags } from "@/utils/generateTags";

const db = getFirestore(firebaseApp);
const auth = getAuth();

const createRoom = async () => {
  const title = "Prayer & Worship Circle";

  await addDoc(collection(db, "audioRooms"), {
    title,
    hostId: auth.currentUser?.uid || "anon",
    isLive: true,
    createdAt: new Date().toISOString(),
    tags: generateTags(title, "host"),
  });
};
