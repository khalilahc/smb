// src/components/RemoteGridCard.tsx
import React, { useState, useEffect, useRef } from "react";
import { useRemotePeer, useRemoteVideo, useDataMessage } from "@huddle01/react/hooks";
import {
  FaUserSlash,
  FaVolumeUp,
  FaUserShield,
  FaCircle,
  FaMicrophone,
  FaMicrophoneSlash,
  FaBroadcastTower,
  FaThumbtack,
  FaDesktop,
  FaEyeSlash,
  FaStar,
  FaVideo,
  FaVideoSlash,
  FaCheck,
} from "react-icons/fa";

interface RemoteGridCardProps {
  peerId: string;
  isSpeaker?: boolean;
  onKick?: () => void;
  currentUserRole?: string;
  onPin?: (id: string) => void;
  isPinned?: boolean;
  onApproveSpeaker?: (peerId: string) => void;
  onWhisper?: (peerId: string) => void;
}

const RemoteGridCard: React.FC<RemoteGridCardProps> = ({
  peerId,
  isSpeaker = false,
  onKick,
  currentUserRole,
  onPin,
  isPinned = false,
  onApproveSpeaker,
  onWhisper,
}) => {
  const { metadata, role } = useRemotePeer<{
    displayName: string;
    avatarUrl: string;
    isHandRaised: boolean;
    isSharing?: boolean;
  }>({ peerId });

  const { stream: videoStream } = useRemoteVideo({ peerId });
  const videoRef = useRef<HTMLVideoElement | null>(null);

  const isHost = currentUserRole === "host";
  const [muted, setMuted] = useState(false);
  const [videoOff, setVideoOff] = useState(false);
  const [reaction, setReaction] = useState<string | null>(null);
  const [speakingLevel, setSpeakingLevel] = useState(0);

  const toggleMute = () => setMuted(!muted);
  const toggleVideo = () => setVideoOff(!videoOff);

  useDataMessage({
    onMessage: (payload, from, label) => {
      if (from === peerId && label === "emoji") {
        setReaction(payload);
        setTimeout(() => setReaction(null), 3000);
      }
    },
  });

  useEffect(() => {
    if (isSpeaker) {
      const interval = setInterval(() => {
        setSpeakingLevel(Math.floor(Math.random() * 4));
      }, 300);
      return () => clearInterval(interval);
    } else {
      setSpeakingLevel(0);
    }
  }, [isSpeaker]);

  useEffect(() => {
    if (videoRef.current && videoStream && !videoOff) {
      videoRef.current.srcObject = videoStream;
    }
  }, [videoStream, videoOff]);

  return (
    <div
      className={`relative p-4 bg-white rounded-lg shadow-md text-center border-2 ${
        isPinned ? "border-yellow-500" : "border-purple-200"
      } ${isPinned ? "scale-105 z-10" : ""}`}
    >
      <div className="absolute top-2 left-2 text-xs">
        <FaCircle
          className={`text-${muted ? "gray" : "green"}-400`}
          title={muted ? "Offline" : "Online"}
        />
      </div>

      {isSpeaker && (
        <div className="absolute top-2 right-2 text-green-500 text-lg animate-pulse">
          <FaBroadcastTower title="Speaking" />
        </div>
      )}

      {onPin && (
        <button
          className="absolute top-2 right-2 text-yellow-600 hover:text-yellow-800"
          title="Pin user"
          onClick={() => onPin(peerId)}
        >
          <FaThumbtack className={isPinned ? "rotate-45" : "opacity-40"} />
        </button>
      )}

      {metadata?.isSharing ? (
        <div className="w-full h-40 bg-black rounded-lg mb-2 flex items-center justify-center text-white">
          <FaDesktop className="text-3xl" />
          <span className="ml-2">Sharing Screen</span>
        </div>
      ) : (
        <video
          ref={videoRef}
          autoPlay
          muted
          playsInline
          className={`w-full h-40 object-cover rounded-lg mb-2 bg-black ${videoOff ? "hidden" : ""}`}
        />
      )}

      <img
        src={
          metadata?.avatarUrl ||
          "https://api.dicebear.com/6.x/adventurer/svg?seed=" + peerId
        }
        alt="Avatar"
        className="w-16 h-16 rounded-full mx-auto mb-2"
      />
      <h4 className="text-purple-700 font-semibold">
        {metadata?.displayName || peerId.slice(0, 6)}
      </h4>
      <p className="text-xs text-gray-500 italic flex justify-center items-center gap-1">
        {role}
        {role === "host" && <FaUserShield title="Host" className="text-indigo-500 animate-glow" />}
      </p>

      {metadata?.isHandRaised && (
        <div className="mt-2 text-yellow-600 animate-bounce">
          👋 Hand Raised
          {isHost && (
            <button
              onClick={() => onApproveSpeaker?.(peerId)}
              className="ml-2 px-2 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700"
            >
              <FaCheck className="inline mr-1" /> Approve
            </button>
          )}
        </div>
      )}

      <div className="flex justify-center gap-2 mt-2">
        <button
          onClick={toggleMute}
          className="px-2 py-1 text-xs border rounded hover:bg-gray-100 text-gray-600"
        >
          {muted ? (
            <FaMicrophoneSlash className="inline mr-1" />
          ) : (
            <FaMicrophone className="inline mr-1" />
          )}
          {muted ? "Unmute" : "Mute"}
        </button>

        <button
          onClick={toggleVideo}
          className="px-2 py-1 text-xs border rounded hover:bg-gray-100 text-gray-600"
        >
          {videoOff ? <FaVideoSlash className="inline mr-1" /> : <FaVideo className="inline mr-1" />}
          {videoOff ? "Start Video" : "Stop Video"}
        </button>
      </div>

      {speakingLevel > 0 && (
        <div className="mt-2 flex justify-center gap-1">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className={`w-1 rounded bg-purple-400 ${
                speakingLevel > i ? `h-${(i + 1) * 2}` : "h-1"
              } transition-all`}
            ></div>
          ))}
        </div>
      )}

      {reaction && <div className="mt-2 text-lg animate-bounce">{reaction}</div>}

      {isHost && onKick && (
        <button
          onClick={onKick}
          className="mt-2 px-2 py-1 text-xs text-red-600 border border-red-300 rounded hover:bg-red-100 block mx-auto"
        >
          <FaUserSlash className="inline mr-1" /> Remove
        </button>
      )}

      {isHost && onWhisper && (
        <button
          onClick={() => onWhisper(peerId)}
          className="mt-2 px-2 py-1 text-xs text-blue-600 border border-blue-300 rounded hover:bg-blue-100 block mx-auto"
        >
          💬 Whisper
        </button>
      )}
    </div>
  );
};

export default RemoteGridCard;
