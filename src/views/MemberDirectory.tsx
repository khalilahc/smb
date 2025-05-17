import React, { useEffect, useState } from "react";
import Layout from "@/components/Layout";
import {
  getFirestore,
  collection,
  setDoc,
  doc,
  onSnapshot
} from "firebase/firestore";
import { firebaseApp } from "../firebase";
import {
  getAuth,
  onAuthStateChanged,
  User
} from "firebase/auth";
import {
  getStorage,
  ref as storageRef,
  uploadBytes,
  getDownloadURL
} from "firebase/storage";

const firestore = getFirestore(firebaseApp);
const auth = getAuth(firebaseApp);
const storage = getStorage(firebaseApp);

interface MemberProfile {
  id: string;
  name: string;
  bio?: string;
  avatar?: string;
  interest?: string;
  location?: string;
}

export default function MemberDirectory() {
  // Auth
  const [currentUser, setCurrentUser] = useState<User | null | undefined>(undefined);
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, user => setCurrentUser(user));
    return () => unsub();
  }, []);

  // Members
  const [members, setMembers] = useState<MemberProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters & form
  const [search, setSearch] = useState("");
  const [filterLocation, setFilterLocation] = useState("");
  const [formData, setFormData] = useState({ name: "", interest: "", location: "", bio: "", avatar: "" });

  // Subscribe to Firestore 'members' collection
  useEffect(() => {
    const membersCol = collection(firestore, "members");
    const unsub = onSnapshot(
      membersCol,
      snap => {
        const docs = snap.docs.map(d => ({ id: d.id, ...(d.data() as any) } as MemberProfile));
        setMembers(docs);
        setLoading(false);
        // Prefill form for current user
        if (currentUser) {
          const me = docs.find(m => m.id === currentUser.uid);
          if (me) setFormData({
            name: me.name || "",
            interest: me.interest || "",
            location: me.location || "",
            bio: me.bio || "",
            avatar: me.avatar || ""
          });
        }
      },
      err => {
        setError(err.message);
        setLoading(false);
      }
    );
    return () => unsub();
  }, [currentUser]);

  // Upload avatar file
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!currentUser) return;
    const file = e.target.files?.[0];
    if (!file) return;
    const ref = storageRef(storage, `avatars/${currentUser.uid}/${file.name}`);
    await uploadBytes(ref, file);
    const url = await getDownloadURL(ref);
    setFormData(prev => ({ ...prev, avatar: url }));
  };

  // Submit profile
  const handleSubmit = async () => {
    if (!currentUser || !formData.name.trim()) return;
    try {
      await setDoc(doc(firestore, "members", currentUser.uid), formData, { merge: true });
      alert("Profile saved!");
    } catch (e: any) {
      alert("Error saving: " + e.message);
    }
  };

  // Filtering
  const filtered = members.filter(m =>
    m.name.toLowerCase().includes(search.toLowerCase()) &&
    (!filterLocation || m.location?.toLowerCase() === filterLocation.toLowerCase())
  );

  // Loading / auth / error
  if (currentUser === undefined || loading) {
    return <Layout><p className="p-6">Loading…</p></Layout>;
  }
  if (!currentUser) {
    return <Layout><p className="p-6">Please sign in to view the directory.</p></Layout>;
  }
  if (error) {
    return <Layout><p className="p-6 text-red-600">Error: {error}</p></Layout>;
  }

  return (
    <Layout>
      <div className="p-6">
        <h1 className="text-2xl font-bold text-pink-700 mb-2">🌐 The Queen’s Collective</h1>
        <p className="text-pink-600 mb-4">Get to know your sisters on the journey.</p>

        {/* Filters */}
        <div className="flex gap-4 mb-6">
          <input
            type="text"
            placeholder="Search by name or interest…"
            className="border px-3 py-2 rounded flex-1"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          <input
            type="text"
            placeholder="Filter by location…"
            className="border px-3 py-2 rounded flex-1"
            value={filterLocation}
            onChange={e => setFilterLocation(e.target.value)}
          />
        </div>

        {/* Profile form */}
        <div className="bg-pink-50 p-4 rounded-xl mb-8">
          <h2 className="text-lg font-semibold text-purple-700 mb-2">✍️ Update Your Profile</h2>
          <div className="grid gap-3 sm:grid-cols-2 mb-3">
            <input
              name="name"
              placeholder="Name"
              value={formData.name}
              onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
              className="border p-2 rounded"
            />
            <input
              name="interest"
              placeholder="Interest"
              value={formData.interest}
              onChange={e => setFormData(prev => ({ ...prev, interest: e.target.value }))}
              className="border p-2 rounded"
            />
            <input
              name="location"
              placeholder="Location"
              value={formData.location}
              onChange={e => setFormData(prev => ({ ...prev, location: e.target.value }))}
              className="border p-2 rounded"
            />
            <div>
              <label className="block mb-1">Avatar</label>
              <input type="file" accept="image/*" onChange={handleFileChange} />
            </div>
          </div>
          <textarea
            name="bio"
            placeholder="Short bio…"
            value={formData.bio}
            onChange={e => setFormData(prev => ({ ...prev, bio: e.target.value }))}
            className="border p-2 rounded w-full mb-3"
            rows={3}
          />
          <button
            onClick={handleSubmit}
            className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700"
          >
            💾 Save Profile
          </button>
        </div>

        {/* Directory table */}
        <table className="min-w-full bg-white border rounded-lg overflow-hidden">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-4 py-2 text-left">Name</th>
              <th className="px-4 py-2 text-left">Interest</th>
              <th className="px-4 py-2 text-left">Location</th>
              <th className="px-4 py-2 text-left">Bio</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(member => (
              <tr key={member.id} className="border-t hover:bg-gray-50">
                <td className="px-4 py-3 flex items-center space-x-3">
                  <img
                    src={member.avatar || "/avatar-placeholder.png"}
                    alt={member.name}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                  <div>
                    <span className="font-medium">{member.name}</span>
                    {member.id === currentUser.uid && (
                      <span className="text-xs text-green-500 ml-2">(You)</span>
                    )}
                  </div>
                </td>
                <td className="px-4 py-3">{member.interest || "—"}</td>
                <td className="px-4 py-3">{member.location || "—"}</td>
                <td className="px-4 py-3 text-sm text-gray-700">{member.bio || "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Layout>
  );
}
