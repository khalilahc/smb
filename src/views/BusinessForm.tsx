// src/views/BusinessDirectory/BusinessForm.tsx
import React, { useState } from "react";
import { getFirestore, collection, addDoc, serverTimestamp } from "firebase/firestore";
import { firebaseApp } from "@/firebase";
import Layout from "@/components/Layout";

const firestore = getFirestore(firebaseApp);

export default function BusinessForm() {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    category: "",
    website: "",
    email: "",
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await addDoc(collection(firestore, "business-directory"), {
        ...formData,
        createdAt: serverTimestamp(),
      });
      alert("✅ Business profile submitted successfully!");
      setFormData({ name: "", description: "", category: "", website: "", email: "" });
    } catch (error) {
      console.error("Error adding document: ", error);
      alert("❌ Failed to submit. Try again.");
    }
    setLoading(false);
  };

  return (
    <Layout>
      <div className="max-w-xl mx-auto mt-10 bg-white p-6 rounded shadow-md">
        <h2 className="text-2xl font-bold mb-4 text-purple-700">📇 Submit Your Business</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            name="name"
            placeholder="Business Name"
            className="w-full p-2 border rounded"
            value={formData.name}
            onChange={handleChange}
            required
          />
          <textarea
            name="description"
            placeholder="Description"
            className="w-full p-2 border rounded"
            rows={4}
            value={formData.description}
            onChange={handleChange}
            required
          ></textarea>
          <input
            name="category"
            placeholder="Category"
            className="w-full p-2 border rounded"
            value={formData.category}
            onChange={handleChange}
          />
          <input
            name="website"
            placeholder="Website (optional)"
            className="w-full p-2 border rounded"
            value={formData.website}
            onChange={handleChange}
          />
          <input
            name="email"
            type="email"
            placeholder="Contact Email"
            className="w-full p-2 border rounded"
            value={formData.email}
            onChange={handleChange}
          />
          <button
            type="submit"
            className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded"
            disabled={loading}
          >
            {loading ? "Submitting..." : "Submit Business"}
          </button>
        </form>
      </div>
    </Layout>
  );
}
