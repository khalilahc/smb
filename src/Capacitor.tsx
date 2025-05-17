import React, { useEffect, useState, Suspense, lazy } from "react";
import { Routes, Route, Navigate } from "react-router-dom";

// Firebase Auth & Firestore
import {
  getAuth,
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
} from "firebase/auth";
import { getFirestore, doc, setDoc } from "firebase/firestore";
import { firebaseApp } from "./firebase";

// Views
import Dashboard from "./views/Dashboard";
import BiblePlan from "./views/BiblePlan";
import BiblePlanTracker from "./views/BiblePlanTracker";
import Affirmations from "./views/Affirmations";
import Badges from "./views/Badges";
import Breakthroughs from "./views/Breakthroughs";
import BusinessDirectory from "./views/BusinessDirectory";
import ChatRoom from "./views/ChatRoom";
import CommunityMessages from "./views/CommunityMessages";
import DailyLog from "./views/DailyLog";
import Events from "./views/Events";
import JournalView from "./views/JournalView";
import MemberDirectory from "./views/MemberDirectory";
import MoodTracker from "./views/MoodTracker";
import PrayerRequests from "./views/PrayerRequests";
import Responses from "./views/Responses";
import Rewards from "./views/Rewards";
import PropheticVault from "./views/PropheticVault";
import Books from "./views/Books";
import DailyAffirmations from "./views/DailyAffirmations";
import LiveAudioRoom from "./views/LiveAudioRoom";
import FeaturedBiblePlans from "./views/FeaturedBiblePlans";

// Lazy-loaded views
const VisionBoard = lazy(() => import("./views/VisionBoard"));
const Shop = lazy(() => import("./views/Shop"));

// Initialize Firebase services & providers
const auth = getAuth(firebaseApp);
const firestore = getFirestore(firebaseApp);
const googleProvider = new GoogleAuthProvider();

function AppRouter() {
  const [user, setUser] = useState<any>(undefined);
  const [emailInput, setEmailInput] = useState<string>("");
  const [passwordInput, setPasswordInput] = useState<string>("");
  const [authError, setAuthError] = useState<string | null>(null);
  const [profileCreated, setProfileCreated] = useState<boolean>(false);

  // Listen for auth changes and upsert user doc once
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);

        // On first login (sign-up), create profile
        if (!profileCreated) {
          const userRef = doc(firestore, "users", firebaseUser.uid);
          await setDoc(
            userRef,
            {
              uid: firebaseUser.uid,
              email: firebaseUser.email,
            },
            { merge: true }
          );
          setProfileCreated(true);
        }
      } else {
        setUser(null);
      }
    });
    return () => unsubscribe();
  }, [profileCreated]);

  // Email/password handlers
  const handleSignUp = async () => {
    try {
      await createUserWithEmailAndPassword(auth, emailInput, passwordInput);
      setAuthError(null);
    } catch (err: any) {
      setAuthError(err.message);
    }
  };

  const handleSignIn = async () => {
    try {
      await signInWithEmailAndPassword(auth, emailInput, passwordInput);
      setAuthError(null);
    } catch (err: any) {
      setAuthError(err.message);
    }
  };

  // Google OAuth handler
  const handleGoogleSignIn = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
      setAuthError(null);
    } catch (err: any) {
      setAuthError(err.message);
    }
  };

  // Loading state
  if (user === undefined) {
    return (
      <div className="min-h-screen flex items-center justify-center text-lg font-medium text-pink-600">
        Checking authentication...
      </div>
    );
  }

  // Sign-in/sign-up screen: email/password + Google
  if (!user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-center bg-gradient-to-br from-yellow-100 to-pink-100 p-4">
        <h1 className="text-3xl font-bold mb-6">Queen’s Journal</h1>
        <div className="w-full max-w-sm bg-white p-6 rounded shadow">
          {/* Google Sign-In */}
          <button
            onClick={handleGoogleSignIn}
            className="w-full bg-red-600 text-white py-2 rounded mb-4 hover:bg-red-700"
          >
            Sign in with Google
          </button>

          {/* Divider */}
          <div className="flex items-center my-4">
            <hr className="flex-grow border-gray-300" />
            <span className="px-2 text-gray-500">or</span>
            <hr className="flex-grow border-gray-300" />
          </div>

          {/* Email/Password Form */}
          <input
            type="email"
            placeholder="Email address"
            value={emailInput}
            onChange={(e) => setEmailInput(e.target.value)}
            className="w-full mb-3 px-4 py-2 border rounded"
          />
          <input
            type="password"
            placeholder="Password"
            value={passwordInput}
            onChange={(e) => setPasswordInput(e.target.value)}
            className="w-full mb-4 px-4 py-2 border rounded"
          />
          <button
            onClick={handleSignIn}
            className="w-full bg-purple-600 text-white py-2 rounded mb-2 hover:bg-purple-700"
          >
            Sign In
          </button>
          <button
            onClick={handleSignUp}
            className="w-full bg-gray-200 text-gray-800 py-2 rounded hover:bg-gray-300"
          >
            Create Account
          </button>
          {authError && <p className="mt-4 text-red-600">{authError}</p>}
        </div>
      </div>
    );
  }

  // Authenticated routes
  return (
    <Suspense fallback={<div className="text-center mt-10 text-pink-500">Loading...</div>}>
      <Routes>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/dashboard/vision-board" element={<VisionBoard />} />
        <Route path="/dashboard/shop" element={<Shop />} />
        <Route path="/bible-plan/:day" element={<BiblePlan />} />
        <Route path="/bible-plan-tracker" element={<BiblePlanTracker user={user} />} />
        <Route path="/featured-bible-plans" element={<FeaturedBiblePlans />} />
        <Route path="/affirmations" element={<Affirmations />} />
        <Route path="/badges" element={<Badges />} />
        <Route path="/breakthroughs" element={<Breakthroughs />} />
        <Route path="/business" element={<BusinessDirectory />} />
        <Route path="/chatroom" element={<ChatRoom />} />
        <Route path="/community" element={<CommunityMessages />} />
        <Route path="/daily-log" element={<DailyLog />} />
        <Route path="/events" element={<Events user={user} />} />
        <Route path="/journal" element={<JournalView />} />
        <Route path="/members" element={<MemberDirectory />} />
        <Route path="/mood" element={<MoodTracker />} />
        <Route path="/prayers" element={<PrayerRequests />} />
        <Route path="/responses" element={<Responses />} />
        <Route path="/rewards" element={<Rewards />} />
        <Route path="/prophetic-vault" element={<PropheticVault user={user} />} />
        <Route path="/books" element={<Books />} />
        <Route path="/daily-affirmations" element={<DailyAffirmations userId={user.uid} />} />
        <Route path="/live-room" element={<LiveAudioRoom />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Suspense>
  );
}

export default AppRouter;
