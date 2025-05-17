import React, { useState, useEffect, useRef } from "react";
import {
  useRoom,
  useLocalPeer,
  useDataMessage,
  usePeerIds,
  useLocalAudio,
} from "@huddle01/react/hooks";
import { motion } from "framer-motion";
import {
  FaHandPaper,
  FaVolumeMute,
  FaCrown,
  FaSmile,
} from "react-icons/fa";
import Layout from "@/components/Layout";
import RemoteGridCard from "../components/RemoteGridCard";
import { storage } from "@/firebase"; // ✅ Firebase Storage

const BACKEND_URL = "https://api.shemeansbusiness.app";

const LiveAudioRoom: React.FC = () => {
  const { muteEveryone, joinRoom } = useRoom();
  const { updateMetadata, metadata, peerId } = useLocalPeer<{
    displayName: string;
    avatarUrl: string;
    isHandRaised: boolean;
  }>();
  const { sendData } = useDataMessage();
  const { peerIds } = usePeerIds();
  const { stream: localAudioStream } = useLocalAudio();

  const [isHandRaised, setHandRaised] = useState(false);

  // Create room using your backend
  async function createRoom(): Promise<string> {
    try {
      const res = await fetch(`${BACKEND_URL}/create-room`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: "Queen’s Lounge" }),
      });

      const data = await res.json();
      return data.data.roomId;
    } catch (error) {
      console.error("Error creating room:", error);
      throw error;
    }
  }

  // Join room on mount
  useEffect(() => {
    async function startAndJoinRoom() {
      try {
        const roomId = await createRoom();
        const token = "your-real-token"; // Replace this with a valid token
        joinRoom({ roomId, token });
      } catch (error) {
        console.error("Failed to start and join room:", error);
      }
    }

    startAndJoinRoom();
  }, [joinRoom]);

  const raiseHand = () => {
    updateMetadata({
      displayName: metadata?.displayName || "Anonymous",
      avatarUrl: metadata?.avatarUrl || "",
      isHandRaised: true,
    });
    setHandRaised(true);
  };

  const sendReaction = (emoji: string) => {
    sendData({ to: "*", payload: emoji, label: "emoji" });
  };

  const sendSpeakerRequest = () => {
    if (peerId) {
      sendData({ to: peerIds, payload: peerId, label: "speakerRequest" });
    }
  };

  return (
    <Layout>
      <motion.div
        className="min-h-screen p-6 bg-gradient-to-b from-pink-50 to-purple-100 text-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <h2 className="text-3xl font-bold text-purple-800 mb-6 flex justify-center items-center gap-2">
          <FaCrown className="text-pink-500" />
          Queen’s Audio Lounge
        </h2>

        <div className="space-x-4 mb-8">
          <button
            onClick={raiseHand}
            className="px-4 py-2 bg-yellow-500 text-white rounded shadow hover:bg-yellow-600"
          >
            <FaHandPaper className="inline mr-2" />
            {isHandRaised ? "Hand Raised" : "Raise Hand"}
          </button>

          <button
            onClick={() => muteEveryone()}
            className="px-4 py-2 bg-purple-600 text-white rounded shadow hover:bg-purple-700"
          >
            <FaVolumeMute className="inline mr-2" />
            Mute All
          </button>

          <button
            onClick={() => sendReaction("💖")}
            className="px-4 py-2 bg-pink-500 text-white rounded shadow hover:bg-pink-600"
          >
            <FaSmile className="inline mr-2" />
            Send 💖
          </button>

          <button
            onClick={sendSpeakerRequest}
            className="px-4 py-2 bg-indigo-500 text-white rounded shadow hover:bg-indigo-600"
          >
            🙋‍♀️ Ask to Speak
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6 mt-6">
          {/* Show your own tile if audio stream exists */}
          {localAudioStream && (
            <div className="bg-white border-2 border-green-400 rounded-xl p-4 shadow-md text-center">
              <p className="text-green-700 font-semibold mb-2">You (Local)</p>
              <audio
                autoPlay
                ref={(ref) => {
                  if (ref) ref.srcObject = localAudioStream;
                }}
              />
            </div>
          )}

          {peerIds.map((id) => (
            <RemoteGridCard key={id} peerId={id} />
          ))}
        </div>
      </motion.div>
    </Layout>
  );
};

export default LiveAudioRoom;
