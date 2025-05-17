import React, { useEffect, useRef, useState } from "react";
import {
  useLocalPeer,
  useLocalAudio,
  useLocalVideo,
  useDataMessage,
} from "@huddle01/react/hooks";

const LocalGridCard: React.FC = () => {
  const { metadata } = useLocalPeer<{
    displayName: string;
    avatarUrl: string;
    isHandRaised: boolean;
  }>();

  const { stream: audioStream } = useLocalAudio();
  const { stream: videoStream } = useLocalVideo();

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  const [emoji, setEmoji] = useState<string | null>(null);

  useDataMessage({
    onMessage: (data) => {
      const msg = data as unknown as { payload: string; label?: string; peerId?: string };

      if (msg?.label === "emoji" && typeof msg.payload === "string") {
        setEmoji(msg.payload);
        setTimeout(() => setEmoji(null), 2000);
      }
    },
  });

  useEffect(() => {
    if (audioRef.current && audioStream) {
      audioRef.current.srcObject = audioStream;
    }
    if (videoRef.current && videoStream) {
      videoRef.current.srcObject = videoStream;
    }
  }, [audioStream, videoStream]);

  return (
    <div className="relative bg-white border-2 border-green-300 rounded-xl p-2 shadow-md transition transform hover:scale-105 w-full max-w-xs">
      {/* Video */}
      <div className="w-full h-48 bg-gray-200 rounded-md overflow-hidden">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="w-full h-full object-cover"
        />
      </div>

      {/* Info */}
      <div className="text-center mt-2">
        <img
          src={metadata?.avatarUrl || "/default-avatar.png"}
          alt="avatar"
          className="w-12 h-12 rounded-full mx-auto -mt-6 border-2 border-white shadow"
        />
        <h4 className="font-bold text-green-700 mt-1">You</h4>
        <p className="text-sm text-gray-500 capitalize">Host</p>
        {metadata?.isHandRaised && (
          <span className="block mt-1 text-yellow-500 animate-bounce">✋ Hand Raised</span>
        )}
      </div>

      {/* Emoji Reaction */}
      {emoji && (
        <div className="absolute top-1 left-1 right-1 flex justify-center z-10 text-4xl animate-bounce">
          {emoji}
        </div>
      )}

      {/* Audio playback */}
      <audio ref={audioRef} autoPlay className="hidden" />
    </div>
  );
};

export default LocalGridCard;
