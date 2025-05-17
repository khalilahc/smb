import React from "react";
import { usePeerIds } from "@huddle01/react/hooks";
import { Role } from "@huddle01/server-sdk/auth";
import RemoteGridCard from "../components/RemoteGridCard"; // 🔮 adjust path as needed

export default function SpeakersView() {
  const { peerIds } = usePeerIds({ roles: [Role.SPEAKER] });

  return (
    <div className="grid grid-cols-2 gap-4 p-4">
      {peerIds.map((peerId) => (
        <RemoteGridCard key={`grid-${peerId}`} peerId={peerId} />
      ))}
    </div>
  );
}
