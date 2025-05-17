// src/views/DailyLog.tsx
import React, { useEffect, useState } from "react";
import { getFirestore, collection, addDoc, onSnapshot } from "firebase/firestore";
import { firebaseApp } from "../firebase";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import confetti from "canvas-confetti";
import jsPDF from "jspdf";
import Layout from "@/components/Layout";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

const firestore = getFirestore(firebaseApp);

export default function DailyLog() {
  const [logDate, setLogDate] = useState<Date | null>(new Date());
  const [entryText, setEntryText] = useState("");
  const [mood, setMood] = useState("😊");
  const [emoji, setEmoji] = useState("✨");
  const [logs, setLogs] = useState<any[]>([]);
  const [filterMood, setFilterMood] = useState("");
  const [filterDate, setFilterDate] = useState<Date | null>(null);

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(firestore, "daily_logs"), (snapshot) => {
      const entries: any[] = [];
      snapshot.forEach(doc => entries.push(doc.data()));
      setLogs(entries);
    });
    return unsubscribe;
  }, []);

  const submitLog = async () => {
    if (!entryText || !logDate) return alert("Please enter your thoughts and pick a date!");
    await addDoc(collection(firestore, "daily_logs"), {
      date: logDate.toISOString(),
      text: entryText,
      mood,
      emoji,
      createdAt: new Date().toISOString(),
    });
    setEntryText("");
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
    });
    alert(`${emoji} Your log has been recorded with mood: ${mood}`);
  };

  const exportLogsToPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text("My Daily Logs", 20, 20);
    let y = 30;
    filteredLogs.forEach(log => {
      doc.setFontSize(12);
      doc.text(`${new Date(log.date).toLocaleDateString()} - ${log.mood} ${log.emoji}`, 20, y);
      y += 6;
      doc.text(log.text, 25, y);
      y += 10;
      if (y > 280) {
        doc.addPage();
        y = 20;
      }
    });
    doc.save("daily-log-journal.pdf");
  };

  const exportLogsToCSV = () => {
    const header = "Date,Mood,Emoji,Text\n";
    const body = filteredLogs
      .map(log => `${new Date(log.date).toLocaleDateString()},${log.mood},${log.emoji},"${log.text.replace(/"/g, '""')}"`)
      .join("\n");
    const blob = new Blob([header + body], { type: "text/csv" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "daily-log.csv";
    link.click();
  };

  const groupByMonth = (logs: any[]) => {
    const grouped: { [month: string]: any[] } = {};
    logs.forEach((log) => {
      const month = new Date(log.date).toLocaleString("default", { month: "long", year: "numeric" });
      if (!grouped[month]) grouped[month] = [];
      grouped[month].push(log);
    });
    return grouped;
  };

  const countMoodTrends = () => {
    const moodMap: Record<string, number> = {};
    logs.forEach(log => {
      const label = new Date(log.date).toLocaleDateString();
      moodMap[label] = (moodMap[label] || 0) + 1;
    });
    return Object.entries(moodMap).map(([date, count]) => ({ date, count }));
  };

  const filteredLogs = logs.filter((log) => {
    const matchMood = filterMood ? log.mood === filterMood : true;
    const matchDate = filterDate ? new Date(log.date).toDateString() === filterDate.toDateString() : true;
    return matchMood && matchDate;
  });

  const groupedLogs = groupByMonth(filteredLogs);
  const moodTrendData = countMoodTrends();

  return (
    <Layout>
      <div className="p-6 space-y-6">
        <h2 className="text-2xl font-bold">📓 Daily Log</h2>

        <div className="bg-white p-4 rounded shadow space-y-4">
          <label className="block text-sm font-medium">Select Date:</label>
          <DatePicker selected={logDate} onChange={(date) => setLogDate(date)} className="border px-2 py-1" />

          <label className="block text-sm font-medium mt-2">How are you feeling today?</label>
          <select value={mood} onChange={(e) => setMood(e.target.value)} className="border px-2 py-1 rounded">
            <option value="😊">😊 Happy</option>
            <option value="😢">😢 Sad</option>
            <option value="😡">😡 Angry</option>
            <option value="😌">😌 Peaceful</option>
            <option value="😴">😴 Tired</option>
          </select>

          <label className="block text-sm font-medium mt-2">Choose your sparkle emoji:</label>
          <select value={emoji} onChange={(e) => setEmoji(e.target.value)} className="border px-2 py-1 rounded">
            <option value="✨">✨</option>
            <option value="🌟">🌟</option>
            <option value="💫">💫</option>
            <option value="👑">👑</option>
          </select>

          <textarea
            className="w-full p-2 border rounded mt-2"
            rows={4}
            placeholder="Type today’s thoughts, reflections, or to-dos..."
            value={entryText}
            onChange={(e) => setEntryText(e.target.value)}
          />

          <button onClick={submitLog} className="bg-purple-600 text-white px-4 py-2 rounded">{emoji} Submit Log</button>
        </div>

        <div className="bg-white p-4 rounded shadow">
          <div className="flex gap-4 flex-wrap mb-4">
            <select value={filterMood} onChange={(e) => setFilterMood(e.target.value)} className="border px-2 py-1 rounded">
              <option value="">All Moods</option>
              <option value="😊">😊 Happy</option>
              <option value="😢">😢 Sad</option>
              <option value="😡">😡 Angry</option>
              <option value="😌">😌 Peaceful</option>
              <option value="😴">😴 Tired</option>
            </select>

            <DatePicker selected={filterDate} onChange={(date) => setFilterDate(date)} className="border px-2 py-1" placeholderText="Filter by date" />

            <button onClick={exportLogsToPDF} className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
              📄 Download Journal PDF
            </button>
            <button onClick={exportLogsToCSV} className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600">
              📁 Export CSV
            </button>
          </div>

          <div className="mb-8">
            <h3 className="text-lg font-semibold mb-2">📊 Mood Trends</h3>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={moodTrendData}>
                <XAxis dataKey="date" hide />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="count" fill="#c084fc" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <h3 className="text-lg font-semibold mb-2">📜 Your Entries</h3>
          {Object.keys(groupedLogs).length === 0 ? (
            <p className="text-sm italic text-gray-500">No logs yet. Start your story today!</p>
          ) : (
            Object.entries(groupedLogs).map(([month, monthLogs]) => (
              <div key={month} className="mb-6">
                <h4 className="text-pink-700 font-bold mb-2">{month}</h4>
                <ul className="space-y-2">
                  {monthLogs.map((log, i) => (
                    <li key={i} className="p-2 border rounded">
                      <div className="text-sm text-gray-600">{new Date(log.date).toLocaleDateString()}</div>
                      <div className="text-lg">{log.emoji} {log.text}</div>
                      <div className="text-sm">Mood: {log.mood}</div>
                    </li>
                  ))}
                </ul>
              </div>
            ))
          )}
        </div>
      </div>
    </Layout>
  );
}
