// import React from "react";
// import { useNavigate } from "react-router-dom";

// export default function Intro() {
//   const nav = useNavigate();

//   return (
//     <div className="min-h-screen center bg-gradient-to-br from-sky-50 to-white">
//       <div className="card fade-in-up text-center" style={{ maxWidth: 520 }}>
//         <h1 className="text-2xl font-bold mb-2">
//           Smart City Service Recommender
//         </h1>

//         <p className="text-gray-600 mb-6">
//           Discover nearby hospitals, parks, police stations and more using
//           real-world map data and smart recommendations.
//         </p>

//         <div className="grid gap-3 mb-6">
//           <div className="badge fade-in-up">📍 Real-time user location</div>
//           <div className="badge fade-in-up">🧠 Smart recommendation engine</div>
//           <div className="badge fade-in-up">🧭 Google Maps navigation</div>
//         </div>

//         <button className="btn pulse" onClick={() => nav("/auth-choice")}>
//           Get Started
//         </button>
//       </div>
//     </div>
//   );
// }
import React from "react";
import { useNavigate } from "react-router-dom";

export default function Intro() {
  const nav = useNavigate();

  return (
    <div className="intro-bg">
      {/* Center wrapper */}
      <div className="intro-center">
        <div className="card fade-in-up intro-card">
          <h1 className="intro-title">
            Smart City Service Recommender
          </h1>

          <p className="intro-subtitle">
            Discover nearby hospitals, parks, police stations and more using
            real-world map data and AI-powered recommendations.
          </p>

          {/* Feature list */}
          <div className="intro-features">
            <div className="feature-pill">
              📍 <span>Real-time user location</span>
            </div>

            <div className="feature-pill">
              🧠 <span>Smart recommendation engine</span>
            </div>

            <div className="feature-pill">
              🧭 <span>Google Maps navigation</span>
            </div>
          </div>

          <button
            className="btn pulse intro-btn"
            onClick={() => nav("/auth-choice")}
          >
            Get Started
          </button>
        </div>
      </div>
    </div>
  );
}
