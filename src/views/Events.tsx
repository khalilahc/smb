// src/views/Events.tsx
import React, { useEffect, useState } from "react";
import {
  collection,
  onSnapshot,
  getFirestore,
  updateDoc,
  doc,
  arrayUnion,
  arrayRemove,
  getDoc,
  addDoc,
  serverTimestamp
} from "firebase/firestore";
import { firebaseApp } from "../firebase";
import { getAuth } from "firebase/auth";
import Layout from "@/components/Layout";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";

const firestore = getFirestore(firebaseApp);
const auth = getAuth(firebaseApp);

export default function Events({ user }: { user: any }) {
  const [events, setEvents] = useState<any[]>([]);
  const [calendarDate, setCalendarDate] = useState<Date | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState<Date | null>(null);
  const [expected, setExpected] = useState<number>(10);
  const [search, setSearch] = useState("");
  const currentUser = auth.currentUser;

  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(firestore, "events"),
      (snapshot) => {
        const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        setEvents(data);
      },
      (error) => {
        console.error("🔥 Firestore listen error:", error.message);
      }
    );

    return () => unsubscribe();
  }, []);

  const handleRSVP = async (eventId: string) => {
    if (!currentUser) return;
    const ref = doc(firestore, "events", eventId);
    await updateDoc(ref, {
      rsvps: arrayUnion(currentUser.uid)
    });
    notifyUser(eventId);
    checkCompletion(eventId);
    downloadICS(eventId);
  };

  const handleCancelRSVP = async (eventId: string) => {
    if (!currentUser) return;
    const ref = doc(firestore, "events", eventId);
    await updateDoc(ref, {
      rsvps: arrayRemove(currentUser.uid)
    });
    alert("Your RSVP has been canceled.");
  };

  const checkCompletion = async (eventId: string) => {
    const ref = doc(firestore, "events", eventId);
    const snap = await getDoc(ref);
    if (!snap.exists()) return;
    const data = snap.data();

    const totalExpected = data?.expected || 0;
    const totalRsvps = data?.rsvps?.length || 0;

    if (totalExpected > 0 && totalRsvps >= totalExpected) {
      alert("🏅 This event has full RSVPs! Badge unlocked.");
    }
  };

  const notifyUser = async (eventId: string) => {
    const event = events.find((e) => e.id === eventId);
    if (!event) return;

    Notification.requestPermission().then((perm) => {
      if (perm === "granted") {
        new Notification("🎟 RSVP Confirmed", {
          body: `You've RSVP'd for ${event.title} on ${new Date(event.date).toLocaleString()}`,
          icon: "/crown.png"
        });

        const delay = new Date(event.date).getTime() - Date.now() - 60 * 60 * 1000;
        if (delay > 0) {
          setTimeout(() => {
            new Notification("⏰ Event Reminder", {
              body: `${event.title} is starting soon! ✨`,
              icon: "/crown.png"
            });
          }, delay);
        }
      }
    });
  };

  const downloadICS = (eventId: string) => {
    const event = events.find((e) => e.id === eventId);
    if (!event) return;
    const start = new Date(event.date).toISOString().replace(/[-:]/g, '').split('.')[0] + "Z";
    const end = new Date(new Date(event.date).getTime() + 60 * 60 * 1000).toISOString().replace(/[-:]/g, '').split('.')[0] + "Z";
    const ics = `BEGIN:VCALENDAR\nVERSION:2.0\nBEGIN:VEVENT\nSUMMARY:${event.title}\nDESCRIPTION:${event.description}\nDTSTART:${start}\nDTEND:${end}\nEND:VEVENT\nEND:VCALENDAR`;
    const blob = new Blob([ics], { type: "text/calendar" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `${event.title.replace(/\s+/g, "_")}.ics`;
    link.click();
  };

  const createEvent = async () => {
    if (!title || !description || !date || !expected) return alert("Fill all fields");
    await addDoc(collection(firestore, "events"), {
      title,
      description,
      date: date.toISOString(),
      expected,
      rsvps: [],
      createdAt: serverTimestamp()
    });
    setTitle("");
    setDescription("");
    setDate(null);
    setExpected(10);
  };

  const filteredEvents = events.filter(e => {
    const eventDate = new Date(e.date);
    const dateMatch = !calendarDate || eventDate.toDateString() === calendarDate.toDateString();
    const searchMatch = e.title.toLowerCase().includes(search.toLowerCase()) || e.description.toLowerCase().includes(search.toLowerCase());
    return dateMatch && searchMatch;
  });

  return (
    <Layout>
      <div className="space-y-4 p-6">
        <h2 className="text-2xl font-bold mb-2">Upcoming Events 🎉</h2>

        {user?.isAdmin && (
          <div className="bg-pink-50 p-4 rounded-xl border space-y-2">
            <h3 className="font-semibold text-pink-800">📝 Create Event</h3>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Title"
              className="w-full p-2 border rounded"
            />
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Description"
              className="w-full p-2 border rounded"
            />
            <input
              type="datetime-local"
              onChange={(e) => setDate(new Date(e.target.value))}
              className="w-full p-2 border rounded"
            />
            <input
              type="number"
              value={expected}
              onChange={(e) => setExpected(Number(e.target.value))}
              className="w-full p-2 border rounded"
              placeholder="Expected attendees"
            />
            <button
              onClick={createEvent}
              className="bg-purple-600 text-white px-4 py-2 rounded"
            >
              Create
            </button>
          </div>
        )}

        <div className="mb-4 grid md:grid-cols-2 gap-4">
          <Calendar
            onChange={(date: any) => setCalendarDate(date)}
            value={calendarDate}
          />
          <input
            type="text"
            placeholder="🔍 Search events by title or description"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full p-3 border rounded shadow-sm"
          />
        </div>

        {filteredEvents.length === 0 ? (
          <p className="text-gray-600">No events found.</p>
        ) : (
          <ul className="space-y-2">
            {filteredEvents.map((event) => {
              const isRsvped = event.rsvps?.includes(currentUser?.uid);
              return (
                <li key={event.id} className="border p-4 rounded shadow-sm bg-white">
                  <h3 className="text-lg font-semibold">{event.title}</h3>
                  <p className="text-sm text-gray-700">{event.description}</p>
                  <p className="text-xs text-gray-500">
                    {new Date(event.date).toLocaleString()}
                  </p>
                  {event.expected && (
                    <p className="text-xs text-gray-500">
                      🎯 Expected Attendees: {event.expected} / {event.rsvps?.length || 0}
                    </p>
                  )}
                  {event.rsvps?.length > 0 && (
                    <p className="text-xs text-purple-600 mt-1">👥 RSVPs: {event.rsvps.join(", ")}</p>
                  )}
                  <div className="mt-2 space-x-2">
                    {!isRsvped ? (
                      <button
                        onClick={() => handleRSVP(event.id)}
                        className="text-sm text-purple-600 underline"
                      >
                        🎟 RSVP ({event.rsvps?.length || 0})
                      </button>
                    ) : (
                      <button
                        onClick={() => handleCancelRSVP(event.id)}
                        className="text-sm text-red-500 underline"
                      >
                        ❌ Cancel RSVP
                      </button>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </Layout>
  );
}
