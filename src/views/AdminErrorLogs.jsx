// src/views/AdminErrorLogs.jsx
import React, { useEffect, useState } from "react";
import {
  getFirestore,
  collection,
  query,
  orderBy,
  onSnapshot,
} from "firebase/firestore";
import { firebaseApp } from "../firebase";

const firestore = getFirestore(firebaseApp);

export default function AdminErrorLogs() {
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    const q = query(collection(firestore, "errorLogs"), orderBy("timestamp", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const errors = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setLogs(errors);
    });
    return unsubscribe;
  }, []);

  return (
    <div className="max-w-4xl mx-auto p-6 text-left">
      <h1 className="text-2xl font-bold text-pink-700 mb-4">🚨 Error Logs (Admin Only)</h1>
      {logs.length === 0 ? (
        <p className="text-gray-500">No errors logged.</p>
      ) : (
        <ul className="space-y-4">
          {logs.map((log) => (
            <li key={log.id} className="bg-red-50 border border-red-200 p-4 rounded shadow text-sm">
              <p><strong>Error:</strong> {log.error}</p>
              <p><strong>Info:</strong> {log.info}</p>
              <p className="text-xs text-gray-400 mt-1">Logged at: {log.timestamp?.toDate().toLocaleString()}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
