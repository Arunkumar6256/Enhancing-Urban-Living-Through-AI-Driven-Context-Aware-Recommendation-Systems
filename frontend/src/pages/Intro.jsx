// import React from "react";
// import { useNavigate } from "react-router-dom";

// export default function Intro() {
//   const nav = useNavigate();

//   return (
//     <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-slate-100 dark:from-gray-900 dark:to-gray-800 transition">

//       <div className="max-w-6xl w-full grid md:grid-cols-2 bg-white dark:bg-gray-900 shadow-xl rounded-2xl overflow-hidden">

//         {/* LEFT SIDE - WELCOME PANEL */}
//         <div className="hidden md:flex flex-col justify-center items-center bg-indigo-900 text-white p-12 relative">

//           <div className="absolute top-6 left-6 text-yellow-400 text-2xl">
//             👑
//           </div>

//           <div className="text-left max-w-sm">
//             <h2 className="text-4xl font-light">Hello!</h2>
//             <h1 className="text-5xl font-bold mt-3 leading-tight">
//               Welcome to <br /> Smart City
//             </h1>

//             <p className="mt-6 text-gray-300">
//               Discover healthcare, safety and civic services near you using
//               our intelligent location-based recommendation system.
//             </p>
//           </div>
//         </div>

//         {/* RIGHT SIDE - MAIN CONTENT */}
//         <div className="flex flex-col justify-center p-10 md:p-16">

//           <h1 className="text-4xl font-extrabold text-indigo-700 dark:text-indigo-400 mb-6">
//             Smart City Portal
//           </h1>

//           <p className="text-gray-600 dark:text-gray-300 mb-10 leading-relaxed">
//             A centralized platform to discover essential urban services
//             around you. Our AI-powered recommendation system helps citizens
//             quickly locate nearby healthcare, safety and civic facilities.
//           </p>

//           {/* CTA BUTTON */}
//           <button
//             className="w-full md:w-auto bg-indigo-700 hover:bg-indigo-800 text-white font-semibold px-8 py-4 rounded-lg shadow-md transition"
//             onClick={() => nav("/auth-choice")}
//           >
//             Access Services Dashboard
//           </button>

//           {/* FEATURES */}
//           <div className="grid md:grid-cols-3 gap-6 mt-12">

//             <div className="p-5 border rounded-lg hover:shadow-md transition">
//               <h3 className="font-bold mb-2 text-blue-600">📍 Location Aware</h3>
//               <p className="text-sm text-gray-600 dark:text-gray-400">
//                 Uses GPS and map intelligence to recommend nearby services
//                 based on your current location.
//               </p>
//             </div>

//             <div className="p-5 border rounded-lg hover:shadow-md transition">
//               <h3 className="font-bold mb-2 text-yellow-600">🤖 AI Ranking</h3>
//               <p className="text-sm text-gray-600 dark:text-gray-400">
//                 Intelligent filtering and ranking using distance, relevance
//                 and user intent.
//               </p>
//             </div>

//             <div className="p-5 border rounded-lg hover:shadow-md transition">
//               <h3 className="font-bold mb-2 text-green-600">🔐 Secure</h3>
//               <p className="text-sm text-gray-600 dark:text-gray-400">
//                 Transparent recommendation logic with secure user data
//                 handling.
//               </p>
//             </div>

//           </div>

//         </div>
//       </div>

//     </div>
//   );
// }

import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

// ─── Styles ──────────────────────────────────────────────────────────────────
const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:ital,wght@0,300;0,400;0,500;1,300&display=swap');

  :root {
    --bg: #0b0f1a;
    --bg-card: #111827;
    --bg-card2: #151d2e;
    --bg-panel: #0d1424;
    --border: rgba(99,179,237,0.13);
    --border-hover: rgba(99,179,237,0.45);
    --primary: #38bdf8;
    --primary-dim: rgba(56,189,248,0.10);
    --primary-glow: rgba(56,189,248,0.35);
    --accent: #f472b6;
    --accent-dim: rgba(244,114,182,0.12);
    --text: #e2e8f0;
    --text-muted: #64748b;
    --text-mid: #94a3b8;
    --grid-line: rgba(99,179,237,0.04);
    --font-display: 'Syne', sans-serif;
    --font-body: 'DM Sans', sans-serif;
  }

  [data-theme="light"] {
    --bg: #f0f4fc;
    --bg-card: #ffffff;
    --bg-card2: #f8faff;
    --bg-panel: #e8eefa;
    --border: rgba(56,130,210,0.15);
    --border-hover: rgba(56,130,210,0.5);
    --primary: #0284c7;
    --primary-dim: rgba(2,132,199,0.08);
    --primary-glow: rgba(2,132,199,0.25);
    --accent: #db2777;
    --accent-dim: rgba(219,39,119,0.08);
    --text: #0f172a;
    --text-muted: #64748b;
    --text-mid: #475569;
    --grid-line: rgba(56,130,210,0.06);
  }

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  .intro-root {
    font-family: var(--font-body);
    background: var(--bg);
    color: var(--text);
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 2rem 1.5rem;
    position: relative;
    overflow: hidden;
    transition: background 0.4s, color 0.4s;
  }

  /* Grid background */
  .intro-root::before {
    content: '';
    position: fixed;
    inset: 0;
    background-image:
      linear-gradient(var(--grid-line) 1px, transparent 1px),
      linear-gradient(90deg, var(--grid-line) 1px, transparent 1px);
    background-size: 44px 44px;
    pointer-events: none;
    z-index: 0;
  }

  /* Ambient orbs */
  .intro-orb {
    position: fixed;
    border-radius: 50%;
    filter: blur(90px);
    pointer-events: none;
    z-index: 0;
    opacity: 0.13;
  }
  .intro-orb-1 {
    width: 500px; height: 500px;
    background: var(--primary);
    top: -160px; right: -120px;
    animation: orb-drift 16s ease-in-out infinite alternate;
  }
  .intro-orb-2 {
    width: 360px; height: 360px;
    background: var(--accent);
    bottom: -80px; left: -80px;
    animation: orb-drift 20s 5s ease-in-out infinite alternate;
  }
  [data-theme="light"] .intro-orb { opacity: 0.06; }
  @keyframes orb-drift {
    from { transform: translate(0,0) scale(1); }
    to   { transform: translate(40px,50px) scale(1.12); }
  }

  /* Theme toggle */
  .intro-theme-toggle {
    position: fixed;
    top: 1.25rem; right: 1.5rem;
    z-index: 100;
    width: 48px; height: 26px;
    background: var(--bg-card);
    border: 1px solid var(--border);
    border-radius: 999px;
    cursor: pointer;
    display: flex;
    align-items: center;
    padding: 3px;
    transition: border-color 0.3s, box-shadow 0.3s;
    box-shadow: 0 2px 12px rgba(0,0,0,0.2);
  }
  .intro-theme-toggle:hover { border-color: var(--border-hover); box-shadow: 0 0 0 3px var(--primary-dim); }
  .toggle-knob {
    width: 18px; height: 18px;
    border-radius: 50%;
    background: var(--primary);
    transition: transform 0.35s cubic-bezier(.34,1.56,.64,1);
    display: flex; align-items: center; justify-content: center;
    font-size: 10px;
  }
  [data-theme="light"] .toggle-knob { transform: translateX(22px); }

  /* ── Main card ── */
  .intro-card {
    position: relative;
    z-index: 1;
    max-width: 1100px;
    width: 100%;
    display: grid;
    grid-template-columns: 1fr;
    background: var(--bg-card);
    border: 1px solid var(--border);
    border-radius: 28px;
    overflow: hidden;
    box-shadow: 0 24px 80px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.04);
    animation: card-enter 0.7s cubic-bezier(.22,1,.36,1) both;
  }
  @media(min-width: 800px) { .intro-card { grid-template-columns: 420px 1fr; } }
  @keyframes card-enter {
    from { opacity:0; transform: translateY(30px) scale(0.97); }
    to   { opacity:1; transform: translateY(0) scale(1); }
  }

  /* ── LEFT PANEL ── */
  .intro-left {
    display: none;
    flex-direction: column;
    justify-content: space-between;
    padding: 3rem 2.75rem;
    background: var(--bg-panel);
    border-right: 1px solid var(--border);
    position: relative;
    overflow: hidden;
  }
  @media(min-width: 800px) { .intro-left { display: flex; } }

  /* Left panel grid lines (denser) */
  .intro-left::before {
    content:'';
    position: absolute; inset: 0;
    background-image:
      linear-gradient(rgba(99,179,237,0.07) 1px, transparent 1px),
      linear-gradient(90deg, rgba(99,179,237,0.07) 1px, transparent 1px);
    background-size: 28px 28px;
    pointer-events: none;
  }

  /* Glowing corner accent */
  .intro-left::after {
    content: '';
    position: absolute;
    bottom: -60px; left: -60px;
    width: 260px; height: 260px;
    background: radial-gradient(circle, var(--primary-glow), transparent 70%);
    pointer-events: none;
    animation: orb-drift 12s ease-in-out infinite alternate;
  }

  .left-badge {
    position: relative;
    display: inline-flex;
    align-items: center;
    gap: 7px;
    font-size: 0.7rem;
    font-weight: 600;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: var(--primary);
    background: var(--primary-dim);
    border: 1px solid var(--border-hover);
    border-radius: 999px;
    padding: 5px 14px;
    width: fit-content;
    animation: fadeSlideDown 0.5s 0.2s ease both;
  }
  .badge-dot {
    width: 6px; height: 6px;
    background: var(--primary);
    border-radius: 50%;
    animation: pulse-dot 2s ease infinite;
    box-shadow: 0 0 6px var(--primary);
  }
  @keyframes pulse-dot {
    0%,100% { opacity:1; transform:scale(1); }
    50%      { opacity:0.4; transform:scale(0.6); }
  }

  .left-greeting {
    margin-top: 2.5rem;
    position: relative;
    animation: fadeSlideDown 0.6s 0.25s ease both;
  }
  .left-greeting-hello {
    font-family: var(--font-display);
    font-size: 1rem;
    font-weight: 400;
    color: var(--text-muted);
    letter-spacing: 0.08em;
    text-transform: uppercase;
  }
  .left-title {
    font-family: var(--font-display);
    font-size: clamp(2.4rem, 3.5vw, 3.2rem);
    font-weight: 800;
    line-height: 1.08;
    letter-spacing: -0.03em;
    margin-top: 0.5rem;
    background: linear-gradient(135deg, var(--text) 0%, var(--primary) 60%, var(--accent) 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }
  .left-desc {
    margin-top: 1.2rem;
    font-size: 0.95rem;
    line-height: 1.75;
    color: var(--text-muted);
  }

  /* Stat chips on left */
  .left-stats {
    display: flex;
    flex-direction: column;
    gap: 10px;
    margin-top: auto;
    padding-top: 3rem;
    position: relative;
    animation: fadeSlideUp 0.6s 0.5s ease both;
  }
  .stat-chip {
    display: flex;
    align-items: center;
    gap: 10px;
    background: var(--bg-card2);
    border: 1px solid var(--border);
    border-radius: 12px;
    padding: 0.65rem 1rem;
    font-size: 0.82rem;
    color: var(--text-mid);
    transition: border-color 0.25s, transform 0.25s;
  }
  .stat-chip:hover { border-color: var(--border-hover); transform: translateX(4px); }
  .stat-chip-icon { font-size: 1rem; }
  .stat-chip-label { flex: 1; }
  .stat-chip-val {
    font-family: var(--font-display);
    font-weight: 700;
    color: var(--primary);
    font-size: 0.85rem;
  }

  /* ── RIGHT PANEL ── */
  .intro-right {
    display: flex;
    flex-direction: column;
    justify-content: center;
    padding: 3rem 2.5rem;
    position: relative;
  }

  .right-eyebrow {
    font-size: 0.7rem;
    font-weight: 600;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    color: var(--text-muted);
    animation: fadeSlideDown 0.5s 0.1s ease both;
    margin-bottom: 0.6rem;
  }

  .right-title {
    font-family: var(--font-display);
    font-size: clamp(1.6rem, 3vw, 2.4rem);
    font-weight: 800;
    letter-spacing: -0.025em;
    line-height: 1.15;
    color: var(--text);
    animation: fadeSlideDown 0.5s 0.15s ease both;
  }
  .right-title span {
    background: linear-gradient(90deg, var(--primary), var(--accent));
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  .right-desc {
    margin-top: 1rem;
    font-size: 0.97rem;
    line-height: 1.75;
    color: var(--text-muted);
    animation: fadeSlideDown 0.5s 0.2s ease both;
  }

  /* CTA button */
  .intro-cta {
    margin-top: 2rem;
    font-family: var(--font-display);
    font-size: 0.95rem;
    font-weight: 700;
    letter-spacing: 0.03em;
    padding: 0.9rem 2rem;
    border-radius: 14px;
    cursor: pointer;
    border: none;
    background: var(--primary);
    color: #fff;
    box-shadow: 0 4px 20px var(--primary-glow);
    display: inline-flex;
    align-items: center;
    gap: 10px;
    width: fit-content;
    transition: transform 0.2s, box-shadow 0.2s, background 0.2s;
    animation: fadeSlideUp 0.55s 0.3s ease both;
    position: relative;
    overflow: hidden;
  }
  .intro-cta:hover {
    transform: translateY(-3px);
    box-shadow: 0 10px 32px var(--primary-glow);
  }
  .intro-cta:active { transform: scale(0.97); }

  /* Arrow animate on hover */
  .cta-arrow {
    display: inline-block;
    transition: transform 0.25s cubic-bezier(.34,1.56,.64,1);
  }
  .intro-cta:hover .cta-arrow { transform: translateX(5px); }

  /* Shimmer sweep */
  .intro-cta::after {
    content:'';
    position:absolute;
    top:0; left:-75%;
    width:50%; height:100%;
    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.18), transparent);
    transform: skewX(-20deg);
    animation: shimmer 3s 1s ease infinite;
  }
  @keyframes shimmer {
    0%   { left: -75%; }
    60%,100% { left: 125%; }
  }

  /* Divider */
  .intro-divider {
    display: flex;
    align-items: center;
    gap: 12px;
    margin: 2rem 0;
    animation: fadeSlideUp 0.5s 0.4s ease both;
  }
  .intro-divider::before, .intro-divider::after {
    content:'';
    flex:1;
    height:1px;
    background: var(--border);
  }
  .intro-divider span {
    font-size: 0.7rem;
    font-weight: 600;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: var(--text-muted);
  }

  /* Feature cards */
  .features-grid {
    display: grid;
    grid-template-columns: 1fr;
    gap: 12px;
    animation: fadeSlideUp 0.6s 0.45s ease both;
  }
  @media(min-width: 500px) { .features-grid { grid-template-columns: repeat(3,1fr); } }

  .feature-card {
    background: var(--bg-card2);
    border: 1px solid var(--border);
    border-radius: 16px;
    padding: 1.1rem 1rem 1rem;
    cursor: default;
    transition: border-color 0.25s, transform 0.25s, box-shadow 0.25s;
    position: relative;
    overflow: hidden;
  }
  .feature-card:hover {
    border-color: var(--border-hover);
    transform: translateY(-4px);
    box-shadow: 0 10px 28px rgba(0,0,0,0.15);
  }
  .feature-card::before {
    content:'';
    position:absolute;
    top:0; left:0; right:0;
    height:2px;
    border-radius:2px 2px 0 0;
    opacity:0;
    transition: opacity 0.3s;
  }
  .feature-card:hover::before { opacity:1; }
  .fc-blue::before  { background: linear-gradient(90deg, var(--primary), transparent); }
  .fc-yellow::before{ background: linear-gradient(90deg, #fbbf24, transparent); }
  .fc-green::before { background: linear-gradient(90deg, #34d399, transparent); }

  .feature-icon {
    font-size: 1.5rem;
    display: block;
    margin-bottom: 0.55rem;
    transition: transform 0.3s cubic-bezier(.34,1.56,.64,1);
  }
  .feature-card:hover .feature-icon { transform: scale(1.2) rotate(-5deg); }

  .feature-title {
    font-family: var(--font-display);
    font-size: 0.82rem;
    font-weight: 700;
    letter-spacing: 0.04em;
    text-transform: uppercase;
    margin-bottom: 0.45rem;
  }
  .fc-blue  .feature-title { color: var(--primary); }
  .fc-yellow .feature-title { color: #fbbf24; }
  .fc-green  .feature-title { color: #34d399; }

  .feature-text {
    font-size: 0.8rem;
    line-height: 1.6;
    color: var(--text-muted);
  }

  @keyframes fadeSlideDown {
    from { opacity:0; transform: translateY(-16px); }
    to   { opacity:1; transform: translateY(0); }
  }
  @keyframes fadeSlideUp {
    from { opacity:0; transform: translateY(18px); }
    to   { opacity:1; transform: translateY(0); }
  }
`;

const FEATURES = [
  {
    cls: "fc-blue",
    icon: "📍",
    title: "Location Aware",
    text: "Uses GPS and map intelligence to surface nearby services based on where you are.",
  },
  {
    cls: "fc-yellow",
    icon: "🤖",
    title: "AI Ranking",
    text: "Smart filtering by distance, relevance, and intent — results that actually matter.",
  },
  {
    cls: "fc-green",
    icon: "🔐",
    title: "Secure",
    text: "Transparent recommendation logic with private, secure handling of your data.",
  },
];

const STATS = [
  { icon: "🏥", label: "Service Categories", val: "6+" },
  { icon: "🌐", label: "Real-time Location", val: "GPS" },
  { icon: "⚡", label: "AI-Powered", val: "Live" },
];

export default function Intro() {
  const nav = useNavigate();
  const [theme, setTheme] = useState("dark");
  const rootRef = useRef(null);

  useEffect(() => {
    if (rootRef.current) rootRef.current.setAttribute("data-theme", theme);
  }, [theme]);

  return (
    <>
      <style>{STYLES}</style>
      <div className="intro-root" ref={rootRef} data-theme={theme}>
        {/* Orbs */}
        <div className="intro-orb intro-orb-1" />
        <div className="intro-orb intro-orb-2" />

        {/* Theme Toggle */}
        <button
          className="intro-theme-toggle"
          onClick={() => setTheme(t => t === "dark" ? "light" : "dark")}
          aria-label="Toggle theme"
        >
          <div className="toggle-knob">{theme === "dark" ? "🌙" : "☀️"}</div>
        </button>

        {/* Card */}
        <div className="intro-card">

          {/* ── LEFT ── */}
          <div className="intro-left">
            <div>
              <div className="left-badge">
                <div className="badge-dot" />
                Smart City Platform
              </div>
              <div className="left-greeting">
                <div className="left-greeting-hello">Hello there 👋</div>
                <h1 className="left-title">Welcome to<br />Smart City</h1>
                <p className="left-desc">
                  Discover healthcare, safety and civic services near you using
                  our intelligent location-based recommendation system.
                </p>
              </div>
            </div>
            <div className="left-stats">
              {STATS.map(s => (
                <div className="stat-chip" key={s.label}>
                  <span className="stat-chip-icon">{s.icon}</span>
                  <span className="stat-chip-label">{s.label}</span>
                  <span className="stat-chip-val">{s.val}</span>
                </div>
              ))}
            </div>
          </div>

          {/* ── RIGHT ── */}
          <div className="intro-right">
            <div className="right-eyebrow">— City Intelligence Portal</div>
            <h2 className="right-title">
              Urban services,<br />
              <span>reimagined.</span>
            </h2>
            <p className="right-desc">
              A centralized platform to discover essential urban services around you.
              Our AI-powered system helps citizens quickly locate nearby healthcare,
              safety, and civic facilities in real time.
            </p>

            <button className="intro-cta" onClick={() => nav("/auth-choice")}>
              Access Services Dashboard
              <span className="cta-arrow">→</span>
            </button>

            <div className="intro-divider"><span>Platform Features</span></div>

            <div className="features-grid">
              {FEATURES.map(f => (
                <div className={`feature-card ${f.cls}`} key={f.title}>
                  <span className="feature-icon">{f.icon}</span>
                  <div className="feature-title">{f.title}</div>
                  <p className="feature-text">{f.text}</p>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </>
  );
}