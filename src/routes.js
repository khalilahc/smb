import React, { Suspense, lazy, useEffect } from "react";
import { Routes, Route, useLocation, Navigate, useParams } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { GiOpenBook } from "react-icons/gi";
import HTMLFlipBook from "react-pageflip";
import "./assets/animations.css";
import { useUser } from "./context/UserContext";

const Dashboard = lazy(() => import("./views/Dashboard"));
const BiblePlan = lazy(() => import("./views/BiblePlan"));
const BiblePlanTracker = lazy(() => import("./views/BiblePlanTracker"));
const BlessedAppWrapper = lazy(() => import("./Capacitor"));
const AdminErrorLogs = lazy(() => import("./views/AdminErrorLogs"));
const Books = lazy(() => import("./views/Books"));
const DailyAffirmations = lazy(() => import("./views/DailyAffirmations"));
const AffirmationsVault = lazy(() => import("./views/AffirmationsVault"));
const LiveAudioRoom = lazy(() => import("./views/LiveAudioRoom"));
const VisionBoard = lazy(() => import("./views/VisionBoard"));
const BusinessDirectory = lazy(() => import("./views/BusinessDirectory"));
const BusinessForm = lazy(() => import("./views/BusinessDirectory/BusinessForm"));

import JournalApp from "./JournalApp";
import DivineChatroom from "./components/DivineChatroom";
import OtherThings from "./components/OtherThings";
import MoodTracker from "./views/MoodTracker";
import ChatRoom from "./views/ChatRoom";
import MemberDirectory from "./views/MemberDirectory";
import AudioAffirmations from "./views/AudioAffirmations";
import Badges from "./views/Badges";
import Breakthroughs from "./views/Breakthroughs";
import CommunityMessages from "./views/CommunityMessages";
import JournalView from "./views/JournalView";
import PrayerRequests from "./views/PrayerRequests";
import Responses from "./views/Responses";
import Rewards from "./views/Rewards";
import Events from "./views/Events";

function FlipbookExperience() {
  return (
    <motion.div className="p-8 text-center bg-purple-50 min-h-screen relative overflow-hidden" initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -40 }} transition={{ duration: 0.8 }}>
      <div className="absolute inset-0 pointer-events-none sparkle-bg z-0"></div>
      <h2 className="text-3xl font-bold mb-6 text-purple-800 z-10 relative animate-glow">
        <GiOpenBook className="inline mr-2 text-pink-500" /> 📖 Your Flipbook Experience
      </h2>
      <HTMLFlipBook
        width={300}
        height={500}
        minWidth={315}
        maxWidth={1000}
        minHeight={400}
        maxHeight={1536}
        showCover={true}
        className="mx-auto border-4 border-yellow-300 shadow-xl rounded-xl z-10 relative"
        startPage={0}
        size="stretch"
        drawShadow={true}
        flippingTime={1000}
        usePortrait={true}
        startZIndex={0}
        autoSize={true}
        style={{ margin: "0 auto" }}
      >
        <div className="p-8 bg-white text-purple-700 font-serif shadow-inner border rounded-xl animate-pageFadeIn">👑 Chapter 1: Awaken the Vision</div>
        <div className="p-8 bg-white text-purple-700 font-serif shadow-inner border rounded-xl animate-pageFadeIn">💡 Chapter 2: Healing Begins</div>
        <div className="p-8 bg-white text-purple-700 font-serif shadow-inner border rounded-xl animate-pageFadeIn">🔥 Chapter 3: Purpose Ignited</div>
        <div className="p-8 bg-white text-purple-700 font-serif shadow-inner border rounded-xl animate-pageFadeIn">✨ Chapter 4: Legacy in Motion</div>
      </HTMLFlipBook>
    </motion.div>
  );
}

function ProtectedRoute({ children }) {
  const isAdmin = localStorage.getItem("isAdmin") === "true";
  return isAdmin ? children : <Navigate to="/" replace />;
}

function usePageTitle(title, description = "") {
  useEffect(() => {
    document.title = title;
    const metaDescription = document.querySelector("meta[name='description']") || document.createElement("meta");
    metaDescription.name = "description";
    metaDescription.content = description;
    if (!metaDescription.parentNode) document.head.appendChild(metaDescription);
    const ogTitle = document.querySelector("meta[property='og:title']") || document.createElement("meta");
    ogTitle.setAttribute("property", "og:title");
    ogTitle.content = title;
    if (!ogTitle.parentNode) document.head.appendChild(ogTitle);
    const ogDesc = document.querySelector("meta[property='og:description']") || document.createElement("meta");
    ogDesc.setAttribute("property", "og:description");
    ogDesc.content = description;
    if (!ogDesc.parentNode) document.head.appendChild(ogDesc);
  }, [title, description]);
}

function SetTitleForBiblePlan() {
  const { day } = useParams();
  usePageTitle(`📖 Day ${day} – Bible Plan`, `Daily Bible reading for Day ${day}`);
  return <BiblePlan />;
}

function TitleWrapper({ title, description, children }) {
  usePageTitle(title, description);
  return children;
}

export default function AppRoutes() {
  const location = useLocation();
  const { user } = useUser();

  usePageTitle("📖 She Means Business Devotional", "Your daily spiritual companion");

  useEffect(() => {
    if (location.pathname === "/shop") {
      window.location.href = "https://khalilahk-beautique.myshopify.com";
    }
  }, [location.pathname]);

  return (
    <Suspense fallback={<div className="text-center mt-10 text-pink-500">Loading...</div>}>
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          <Route path="/" element={<JournalApp />} />
          <Route path="/dashboard/*" element={<BlessedAppWrapper />}>
            <Route path="vision-board" element={<VisionBoard />} />
          </Route>
          <Route path="/chatroom" element={<DivineChatroom />} />
          <Route path="/flipbook" element={<FlipbookExperience />} />
          <Route path="/explore" element={<OtherThings />} />
          <Route path="/mood" element={<MoodTracker />} />
          <Route path="/chat" element={<ChatRoom />} />
          <Route path="/directory" element={<MemberDirectory />} />
          <Route path="/audio" element={<AudioAffirmations />} />
          <Route path="/badges" element={<Badges />} />
          <Route path="/breakthroughs" element={<Breakthroughs />} />
          <Route path="/community" element={<TitleWrapper title="💬 Community Messages" description="Join the conversation in our community chat."><CommunityMessages /></TitleWrapper>} />
          <Route path="/journal" element={<TitleWrapper title="📓 Journal View" description="View and reflect on your journal entries."><JournalView /></TitleWrapper>} />
          <Route path="/prayers" element={<PrayerRequests />} />
          <Route path="/responses" element={<Responses />} />
          <Route path="/rewards" element={<Rewards />} />
          <Route path="/books" element={<Books />} />
          <Route path="/live-room" element={<LiveAudioRoom />} />
          <Route path="/bible-plan/:day" element={<SetTitleForBiblePlan />} />
          <Route path="/bible-plan-tracker" element={<BiblePlanTracker user={user} />} />
          <Route path="/admin/errors" element={<ProtectedRoute><AdminErrorLogs /></ProtectedRoute>} />
          <Route path="/daily-affirmations" element={<DailyAffirmations userId="user123" />}>
            <Route path="affirmations" element={<AffirmationsVault />} />
          </Route>
          <Route path="/business" element={<BusinessDirectory />} />
          <Route path="/business/new" element={<BusinessForm />} />
        </Routes>
      </AnimatePresence>
    </Suspense>
  );
}
