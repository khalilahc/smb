// src/views/MoodTracker.tsx
import React, { useState, useEffect, useRef } from "react";
import { collection, addDoc, onSnapshot, getFirestore, Timestamp } from "firebase/firestore";
import { firebaseApp } from "../firebase";
import confetti from "canvas-confetti";
import Layout from "@/components/Layout";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, LineChart, Line, CartesianGrid, XAxis, YAxis } from "recharts";
import html2canvas from "html2canvas";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const firestore = getFirestore(firebaseApp);

const moodOptions = [
  { emoji: "😊", label: "Happy" },
  { emoji: "😢", label: "Sad" },
  { emoji: "😡", label: "Angry" },
  { emoji: "😴", label: "Tired" },
  { emoji: "😰", label: "Anxious" },
  { emoji: "😍", label: "Grateful" },
];

const moodColors: Record<string, string> = {
  Happy: "#34d399",
  Sad: "#60a5fa",
  Angry: "#f87171",
  Tired: "#a78bfa",
  Anxious: "#fbbf24",
  Grateful: "#f472b6",
};

export default function MoodTracker() {
  const [moodLogs, setMoodLogs] = useState<any[]>([]);
  const [selectedMood, setSelectedMood] = useState<string | null>(null);
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const chartRef = useRef<HTMLDivElement>(null);

  const logMood = async (mood: string) => {
    await addDoc(collection(firestore, "moodLogs"), {
      mood,
      timestamp: Timestamp.now(),
    });
    setSelectedMood(null);
    confetti({ particleCount: 75, spread: 90, origin: { y: 0.6 } });
  };

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(firestore, "moodLogs"), (snapshot) => {
      const list = snapshot.docs.map((doc) => doc.data());
      setMoodLogs(list.sort((a, b) => b.timestamp?.seconds - a.timestamp?.seconds));
    });
    return unsubscribe;
  }, []);

  const today = new Date().toDateString();

  const isInDateRange = (timestamp: Timestamp) => {
    const date = timestamp.toDate();
    if (startDate && date < startDate) return false;
    if (endDate && date > endDate) return false;
    return true;
  };

  const filteredLogs = moodLogs.filter((log) => log.timestamp && isInDateRange(log.timestamp));

  const moodCounts = moodOptions.map(({ label }) => ({
    name: label,
    value: filteredLogs.filter((log) => log.mood === label).length,
  })).filter((entry) => entry.value > 0);

  const weeklyMoodData = filteredLogs.map(log => {
    const date = new Date(log.timestamp?.seconds * 1000);
    return {
      date: `${date.getMonth() + 1}/${date.getDate()}`,
      mood: log.mood
    };
  }).reverse();

  const exportPNG = async () => {
    if (!chartRef.current) return;
    const canvas = await html2canvas(chartRef.current);
    const link = document.createElement("a");
    link.download = "mood-trends.png";
    link.href = canvas.toDataURL();
    link.click();
  };

  return (
    <Layout>
      <div className="p-6 bg-white rounded shadow">
        <h2 className="text-xl font-bold mb-4">🎭 Mood Tracker</h2>
        <p className="mb-4 text-gray-700">How are you feeling today?</p>

        <div className="flex flex-wrap gap-4 mb-6">
          {moodOptions.map(({ emoji, label }) => (
            <button
              key={label}
              onClick={() => logMood(label)}
              className="text-3xl p-3 border rounded hover:bg-purple-100"
              title={label}
            >
              {emoji}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap gap-4 items-center mb-4">
          <label className="text-sm font-medium">From:</label>
          <DatePicker selected={startDate} onChange={(date) => setStartDate(date)} className="border px-2 py-1 rounded" />
          <label className="text-sm font-medium">To:</label>
          <DatePicker selected={endDate} onChange={(date) => setEndDate(date)} className="border px-2 py-1 rounded" />
        </div>

        <div className="flex justify-between items-center mb-2">
          <h3 className="font-semibold text-purple-800">Mood Distribution</h3>
          <button onClick={exportPNG} className="text-sm px-3 py-1 bg-pink-200 hover:bg-pink-300 rounded">📸 Export PNG</button>
        </div>

        <div ref={chartRef} className="w-full h-64 mb-6">
          <ResponsiveContainer>
            <PieChart>
              <Pie
                data={moodCounts}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={80}
                label
              >
                {moodCounts.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={moodColors[entry.name] || "#ddd"} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <h3 className="font-semibold text-purple-800 mb-2">📈 Weekly Mood Trend</h3>
        <div className="w-full h-64 mb-6">
          <ResponsiveContainer>
            <LineChart data={weeklyMoodData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="mood" stroke="#8884d8" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <h3 className="font-semibold text-purple-800 mb-2">Mood History</h3>
        <ul className="space-y-2 text-sm">
          {filteredLogs.map((log, idx) => {
            const logDate = log.timestamp?.toDate?.();
            const isToday = logDate?.toDateString() === today;
            return (
              <li
                key={idx}
                className={`p-2 border rounded ${isToday ? "bg-yellow-100 border-yellow-400" : "bg-purple-50"}`}
              >
                <strong>{log.mood}</strong> – {logDate?.toLocaleString() || "Unknown date"}
              </li>
            );
          })}
        </ul>
      </div>
    </Layout>
  );
}
