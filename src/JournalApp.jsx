import React from "react";
import BlessedDashboard from "./Capacitor";

export default function JournalApp() {
  const user = { email: "anonymous" }; // replace with actual auth later
  return <BlessedDashboard user={user} />;
}
