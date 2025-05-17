// src/views/FeaturedBiblePlans.tsx
import React, { useEffect, useState } from "react";
import { collection, getDocs, getFirestore } from "firebase/firestore";
import { firebaseApp } from "../firebase";
import { Link } from "react-router-dom";
import Layout from "@/components/Layout";

const firestore = getFirestore(firebaseApp);

interface Plan {
  id: string;
  title: string;
  description: string;
  image?: string;
  startingDay: number;
}

export default function FeaturedBiblePlans() {
  const [plans, setPlans] = useState<Plan[]>([]);

  useEffect(() => {
    const fetchPlans = async () => {
      const snapshot = await getDocs(collection(firestore, "featuredBiblePlans"));
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Plan));
      setPlans(data);
    };
    fetchPlans();
  }, []);

  return (
    <Layout>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {plans.map((plan) => (
          <Link
            key={plan.id}
            to={`/bible-plan/${plan.startingDay}`}
            className="block bg-white shadow-md rounded-xl overflow-hidden border-2 border-pink-200 hover:border-pink-500 transition duration-300"
          >
            {plan.image && (
              <img
                src={plan.image}
                alt={plan.title}
                className="w-full h-40 object-cover"
              />
            )}
            <div className="p-4">
              <h3 className="text-lg font-bold text-pink-700 mb-1">{plan.title}</h3>
              <p className="text-sm text-gray-600 line-clamp-3">{plan.description}</p>
            </div>
          </Link>
        ))}
      </div>
    </Layout>
  );
}
