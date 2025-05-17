import React, { useEffect, useState } from "react";
import {
  getFirestore,
  collection,
  addDoc,
  query,
  where,
  getDocs,
  deleteDoc,
  doc,
  setDoc
} from "firebase/firestore";
import confetti from "canvas-confetti";
import { firebaseApp } from "../firebase";
import { useNavigate } from "react-router-dom";
import Layout from "@/components/Layout";

const db = getFirestore(firebaseApp);

const biblePlans = [
  {
    id: 1,
    title: "📖 Kingdom Driven Journey",
    description: "Walk boldly through your royal identity for 21 days.",
    length: 21
  },
  {
    id: 30,
    title: "🔥 Through the Fire of Fear and doubt",
    description: "God’s power in the wilderness. A 10-day Exodus experience.",
    length: 10
  },
  {
    id: 90,
    title: "🎵 Praise To Victory",
    description: "A 7-day journey of Psalms to lift your spirit daily.",
    length: 7
  }
];

export default function BiblePlanTracker({ user }: { user: any }) {
  const [completed, setCompleted] = useState<number[]>([]);
  const [docMap, setDocMap] = useState<Record<number, string>>({});
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCompletedDays = async () => {
      if (!user?.email) return;
      try {
        const q = query(collection(db, "bible_progress"), where("user", "==", user.email));
        const snapshot = await getDocs(q);
        const dayMap: Record<number, string> = {};
        const completedDays = snapshot.docs.map(docSnap => {
          const day = docSnap.data().day;
          dayMap[day] = docSnap.id;
          return day;
        });
        setCompleted(completedDays);
        setDocMap(dayMap);
      } catch (err) {
        console.error("Error fetching completed days:", err);
      }
    };
    fetchCompletedDays();
  }, [user]);

  const markDay = async (day: number) => {
    if (!user?.email || completed.includes(day)) return;
    try {
      const docRef = await addDoc(collection(db, "bible_progress"), {
        user: user.email,
        day,
        completedAt: new Date().toISOString()
      });
      setCompleted(prev => [...prev, day]);
      setDocMap(prev => ({ ...prev, [day]: docRef.id }));
      confetti();
    } catch (err) {
      console.error("Error marking day:", err);
    }
  };

  const unmarkDay = async (day: number) => {
    if (!user?.email || !completed.includes(day) || !docMap[day]) return;
    try {
      await deleteDoc(doc(db, "bible_progress", docMap[day]));
      setCompleted(prev => prev.filter(d => d !== day));
      setDocMap(prev => {
        const updated = { ...prev };
        delete updated[day];
        return updated;
      });
    } catch (err) {
      console.error("Error unmarking day:", err);
    }
  };

  const awardBadge = async (planId: number, title: string) => {
    if (!user?.uid) return;
    try {
      const badgeRef = doc(db, "badges", `${user.uid}_${planId}`);
      await setDoc(badgeRef, {
        userId: user.uid,
        planId,
        title,
        awardedAt: new Date().toISOString()
      });
      confetti({ particleCount: 180, spread: 100, origin: { y: 0.6 } });
      alert(`🎉 Badge awarded for completing: ${title}`);
    } catch (err) {
      console.error("Error awarding badge:", err);
    }
  };

  const getPlanProgress = (planStart: number, length: number): [string, boolean] => {
    const planDays = Array.from({ length }, (_, i) => planStart + i);
    const done = planDays.filter(d => completed.includes(d)).length;
    return [`${done}/${length} days completed`, done === length];
  };

  if (!user?.email) {
    return <div className="text-red-600 p-4">🔒 Please sign in to access your devotionals.</div>;
  }

  return (
    <Layout>
      <div className="space-y-8">
        <div className="bg-white rounded shadow p-4">
          <h2 className="text-xl font-bold mb-2">📖 Devotionals</h2>
          <div className="text-gray-500 text-sm italic">One-year plan hidden for now</div>
        </div>

        <div className="bg-yellow-50 rounded shadow p-4">
          <h3 className="text-lg font-semibold mb-3 text-purple-800">🔥 Featured Bible Plans</h3>
          <div className="grid gap-4">
            {biblePlans.map((plan) => {
              const [progressText, isComplete] = getPlanProgress(plan.id, plan.length);
              return (
                <div key={plan.id} className="bg-purple-100 hover:bg-purple-200 p-4 rounded text-purple-800">
                  <div className="font-semibold text-lg flex items-center gap-2">
                    {plan.title}
                    {isComplete && (
                      <>
                        <span className="text-green-600 text-sm bg-green-100 px-2 py-0.5 rounded-full">✅ Completed</span>
                        <button
                          className="ml-2 text-xs bg-green-200 text-green-800 px-2 py-0.5 rounded hover:bg-green-300"
                          onClick={() => awardBadge(plan.id, plan.title)}
                        >
                          🎖 Claim Badge
                        </button>
                      </>
                    )}
                  </div>
                  <div className="text-sm italic mb-2">{plan.description}</div>
                  <div className="text-xs text-gray-700 mb-2">{progressText}</div>
                  <button
                    onClick={() => navigate(`/bible-plan/${plan.id}`)}
                    className="px-3 py-1 bg-purple-700 text-white text-sm rounded hover:bg-purple-800"
                  >
                    Start Plan →
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </Layout>
  );
}
