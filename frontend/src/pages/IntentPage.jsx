import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function IntentPage() {
  const [q, setQ] = useState("");
  const nav = useNavigate();

  function proceed() {
    nav(`/results?query=${q}`);
  }

  return (
    <div className="min-h-screen center">
      <div className="card fade-in-up text-center">
        <h2 className="text-xl font-bold mb-2">
          What are you looking for today?
        </h2>

        <input
          placeholder="e.g. hospital, park"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />

        <p className="text-gray-600 mt-2">
          Thank you for choosing <b>{q || "..."}</b>
        </p>

        <button className="btn mt-3" onClick={proceed}>
          Continue
        </button>
      </div>
    </div>
  );
}
