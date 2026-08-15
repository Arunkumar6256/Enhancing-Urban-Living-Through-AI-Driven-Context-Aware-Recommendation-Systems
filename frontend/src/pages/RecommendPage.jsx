// import React, { useState, useEffect } from "react";
// import RecommendForm from "../components/RecommendForm";

// export default function RecommendPage() {
//   const [userCoords, setUserCoords] = useState(null);
//   const [places, setPlaces] = useState([]);
//   const [info, setInfo] = useState(null);

//   // Load stored user location
//   useEffect(() => {
//     const raw = localStorage.getItem("user_coords");
//     if (!raw) return;

//     try {
//       const coords = JSON.parse(raw);
//       if (coords?.lat && coords?.lon) {
//         setUserCoords(coords);
//       }
//     } catch {
//       /* ignore */
//     }
//   }, []);

//   function handleSetUserCoords(coords) {
//     setUserCoords(coords);
//     localStorage.setItem("user_coords", JSON.stringify(coords));
//   }

//   function handleShowPlace(place) {
//     localStorage.setItem("last_shown_place", JSON.stringify(place));
//     setInfo("Place saved. Open Map View to visualize.");
//     setTimeout(() => setInfo(null), 3000);
//   }

//   return (
//     <div className="animate-enter relative">
//       {/* Background glow */}
//       <div className="absolute top-10 left-10 w-64 h-64 bg-primary blur-[150px] opacity-20 -z-10 rounded-full animate-pulse"></div>

//       <div className="mb-6">
//         <h2 className="text-3xl font-bold mb-2">
//           Find Nearby <span className="text-accent">Services</span>
//         </h2>
//         <p className="text-muted">
//           Discover essential city services around your current location.
//         </p>
//       </div>

//       {info && (
//         <div className="mb-4 text-sm text-[var(--primary)] font-semibold">
//           {info}
//         </div>
//       )}

//       <RecommendForm
//         userCoords={userCoords}
//         onResults={(data) =>
//           setPlaces(Array.isArray(data?.results) ? data.results : [])
//         }
//         manualSetUserCoords={handleSetUserCoords}
//         onShowPlace={handleShowPlace}
//       />
//     </div>
//   );
// }

import React, { useState, useEffect, useRef } from "react";
import RecommendForm from "../components/RecommendForm";

const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:ital,wght@0,300;0,400;0,500;1,300&display=swap');

  :root {
    --bg: #0b0f1a;
    --bg-card: #111827;
    --bg-card2: #151d2e;
    --border: rgba(99,179,237,0.13);
    --border-hover: rgba(99,179,237,0.45);
    --primary: #38bdf8;
    --primary-dim: rgba(56,189,248,0.10);
    --primary-glow: rgba(56,189,248,0.35);
    --accent: #f472b6;
    --accent-dim: rgba(244,114,182,0.10);
    --text: #e2e8f0;
    --text-muted: #64748b;
    --text-mid: #94a3b8;
    --success: #34d399;
    --success-dim: rgba(52,211,153,0.12);
    --grid-line: rgba(99,179,237,0.04);
    --font-display: 'Syne', sans-serif;
    --font-body: 'DM Sans', sans-serif;
  }
  [data-theme="light"] {
    --bg: #f0f4fc;
    --bg-card: #ffffff;
    --bg-card2: #f8faff;
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
    --success: #059669;
    --success-dim: rgba(5,150,105,0.08);
    --grid-line: rgba(56,130,210,0.06);
  }

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  .rp-root {
    font-family: var(--font-body);
    background: var(--bg); color: var(--text);
    min-height: 100vh;
    padding: 2rem 1.5rem 5rem;
    position: relative; overflow-x: hidden;
    transition: background 0.4s, color 0.4s;
  }
  .rp-root::before {
    content: '';
    position: fixed; inset: 0;
    background-image:
      linear-gradient(var(--grid-line) 1px, transparent 1px),
      linear-gradient(90deg, var(--grid-line) 1px, transparent 1px);
    background-size: 44px 44px;
    pointer-events: none; z-index: 0;
  }

  .rp-orb {
    position: fixed; border-radius: 50%;
    filter: blur(100px); pointer-events: none; z-index: 0; opacity: 0.1;
  }
  .rp-orb-1 { width: 480px; height: 480px; background: var(--primary); top: -140px; right: -100px; animation: orb-drift 17s ease-in-out infinite alternate; }
  .rp-orb-2 { width: 340px; height: 340px; background: var(--accent); bottom: 5%; left: -80px; animation: orb-drift 22s 6s ease-in-out infinite alternate; }
  [data-theme="light"] .rp-orb { opacity: 0.05; }
  @keyframes orb-drift {
    from { transform: translate(0,0) scale(1); }
    to   { transform: translate(35px,45px) scale(1.1); }
  }

  /* Theme toggle */
  .rp-toggle {
    position: fixed; top: 1.25rem; right: 1.5rem; z-index: 100;
    width: 48px; height: 26px;
    background: var(--bg-card); border: 1px solid var(--border);
    border-radius: 999px; cursor: pointer;
    display: flex; align-items: center; padding: 3px;
    box-shadow: 0 2px 12px rgba(0,0,0,0.2);
    transition: border-color 0.3s, box-shadow 0.3s;
  }
  .rp-toggle:hover { border-color: var(--border-hover); box-shadow: 0 0 0 3px var(--primary-dim); }
  .rp-toggle-knob {
    width: 18px; height: 18px; border-radius: 50%;
    background: var(--primary);
    transition: transform 0.35s cubic-bezier(.34,1.56,.64,1);
    display: flex; align-items: center; justify-content: center; font-size: 10px;
  }
  [data-theme="light"] .rp-toggle-knob { transform: translateX(22px); }

  /* ── Inner ── */
  .rp-inner { position: relative; z-index: 1; max-width: 900px; margin: 0 auto; }

  /* ── Header ── */
  .rp-header {
    margin-bottom: 2.25rem;
    animation: fadeDown 0.55s 0.05s ease both;
  }
  .rp-eyebrow {
    display: inline-flex; align-items: center; gap: 6px;
    font-size: 0.68rem; font-weight: 600; letter-spacing: 0.12em; text-transform: uppercase;
    color: var(--primary); background: var(--primary-dim);
    border: 1px solid var(--border-hover); border-radius: 999px;
    padding: 4px 12px; margin-bottom: 0.75rem;
  }
  .rp-eyebrow-dot {
    width: 5px; height: 5px; border-radius: 50%;
    background: var(--primary); box-shadow: 0 0 5px var(--primary);
    animation: pulse-dot 2s ease infinite;
  }
  @keyframes pulse-dot {
    0%,100% { opacity:1; transform:scale(1); }
    50%      { opacity:0.4; transform:scale(0.6); }
  }

  .rp-title {
    font-family: var(--font-display);
    font-size: clamp(1.8rem, 4vw, 2.8rem);
    font-weight: 800; letter-spacing: -0.03em; line-height: 1.1;
  }
  .rp-title-plain { color: var(--text); }
  .rp-title-accent {
    background: linear-gradient(90deg, var(--primary), var(--accent));
    -webkit-background-clip: text; -webkit-text-fill-color: transparent;
    background-clip: text;
  }
  .rp-subtitle {
    margin-top: 0.65rem;
    font-size: 0.97rem; line-height: 1.7; color: var(--text-muted);
  }

  /* ── Stats row ── */
  .rp-stats {
    display: flex; gap: 10px; flex-wrap: wrap;
    margin-top: 1.25rem;
    animation: fadeDown 0.5s 0.15s ease both;
  }
  .rp-stat {
    display: inline-flex; align-items: center; gap: 7px;
    font-size: 0.77rem; font-weight: 600; letter-spacing: 0.04em;
    padding: 5px 12px; border-radius: 999px;
    background: var(--bg-card2); border: 1px solid var(--border);
    color: var(--text-muted);
    transition: border-color 0.2s, color 0.2s;
  }
  .rp-stat:hover { border-color: var(--border-hover); color: var(--primary); }
  .rp-stat.lit { border-color: var(--success); color: var(--success); background: var(--success-dim); }
  .rp-stat-dot { width: 5px; height: 5px; border-radius: 50%; background: currentColor; }
  .rp-stat.lit .rp-stat-dot { animation: pulse-dot 2s ease infinite; box-shadow: 0 0 4px currentColor; }

  /* ── Toast notification ── */
  .rp-toast {
    display: flex; align-items: center; gap: 10px;
    background: var(--success-dim);
    border: 1px solid var(--success);
    border-radius: 14px; padding: 0.75rem 1.1rem;
    margin-bottom: 1.5rem;
    font-size: 0.86rem; font-weight: 600; color: var(--success);
    animation: toast-in 0.35s cubic-bezier(.22,1,.36,1) both;
  }
  .rp-toast-icon { font-size: 1rem; flex-shrink: 0; }
  @keyframes toast-in {
    from { opacity:0; transform: translateY(-10px) scale(0.97); }
    to   { opacity:1; transform: translateY(0) scale(1); }
  }

  /* ── Form card ── */
  .rp-form-card {
    background: var(--bg-card);
    border: 1px solid var(--border);
    border-radius: 24px;
    overflow: hidden;
    box-shadow: 0 12px 48px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.04);
    transition: border-color 0.3s;
    animation: fadeUp 0.6s 0.2s ease both;
  }
  .rp-form-card:hover { border-color: var(--border-hover); }

  .rp-form-toolbar {
    display: flex; align-items: center; gap: 10px;
    padding: 0.9rem 1.4rem;
    border-bottom: 1px solid var(--border);
    background: var(--bg-card2);
  }
  .rp-form-toolbar-title {
    font-family: var(--font-display);
    font-size: 0.78rem; font-weight: 700;
    letter-spacing: 0.07em; text-transform: uppercase;
    color: var(--text-muted);
  }
  .rp-toolbar-sep { width: 1px; height: 16px; background: var(--border); }

  .rp-coords-badge {
    display: flex; align-items: center; gap: 6px;
    font-size: 0.74rem;
    color: var(--text-muted);
    background: var(--bg-card); border: 1px solid var(--border);
    border-radius: 8px; padding: 3px 10px;
  }
  .rp-coords-val { color: var(--text-mid); font-weight: 500; }

  .rp-form-body { padding: 1.75rem; }

  /* ── Results count badge ── */
  .rp-results-banner {
    display: flex; align-items: center; gap: 10px;
    padding: 0.7rem 1.4rem;
    background: var(--primary-dim);
    border-bottom: 1px solid var(--border-hover);
    font-size: 0.82rem; color: var(--primary);
    animation: slideDown 0.3s ease both;
  }
  .rp-results-count {
    font-family: var(--font-display);
    font-weight: 800; font-size: 1rem;
  }
  @keyframes slideDown {
    from { opacity:0; transform: translateY(-8px); }
    to   { opacity:1; transform: translateY(0); }
  }

  @keyframes fadeDown {
    from { opacity:0; transform: translateY(-14px); }
    to   { opacity:1; transform: translateY(0); }
  }
  @keyframes fadeUp {
    from { opacity:0; transform: translateY(16px); }
    to   { opacity:1; transform: translateY(0); }
  }
`;

export default function RecommendPage() {
  const [userCoords, setUserCoords] = useState(null);
  const [places, setPlaces] = useState([]);
  const [info, setInfo] = useState(null);
  const [theme, setTheme] = useState("dark");
  const rootRef = useRef(null);

  useEffect(() => {
    if (rootRef.current) rootRef.current.setAttribute("data-theme", theme);
  }, [theme]);

  useEffect(() => {
    const raw = localStorage.getItem("user_coords");
    if (!raw) return;
    try {
      const coords = JSON.parse(raw);
      if (coords?.lat && coords?.lon) setUserCoords(coords);
    } catch { /* ignore */ }
  }, []);

  function handleSetUserCoords(coords) {
    setUserCoords(coords);
    localStorage.setItem("user_coords", JSON.stringify(coords));
  }

  function handleShowPlace(place) {
    localStorage.setItem("last_shown_place", JSON.stringify(place));
    setInfo("Place saved — open Map View to visualize it.");
    setTimeout(() => setInfo(null), 3000);
  }

  const coordsLabel = userCoords
    ? `${userCoords.lat.toFixed(4)}, ${userCoords.lon.toFixed(4)}`
    : "Not set";

  return (
    <>
      <style>{STYLES}</style>
      <div className="rp-root" ref={rootRef} data-theme={theme}>
        <div className="rp-orb rp-orb-1" />
        <div className="rp-orb rp-orb-2" />

        {/* Theme toggle */}
        <button className="rp-toggle" onClick={() => setTheme(t => t === "dark" ? "light" : "dark")} aria-label="Toggle theme">
          <div className="rp-toggle-knob">{theme === "dark" ? "🌙" : "☀️"}</div>
        </button>

        <div className="rp-inner">
          {/* Header */}
          <div className="rp-header">
            <div className="rp-eyebrow">
              <div className="rp-eyebrow-dot" />
              AI-Powered Discovery
            </div>
            <h2 className="rp-title">
              <span className="rp-title-plain">Find Nearby </span>
              <span className="rp-title-accent">Services</span>
            </h2>
            <p className="rp-subtitle">
              Discover essential city services around your current location,<br />
              ranked by distance and relevance.
            </p>

            {/* Stat pills */}
            <div className="rp-stats">
              <div className={`rp-stat${userCoords ? " lit" : ""}`}>
                <div className="rp-stat-dot" />
                {userCoords ? "Location Active" : "No Location Set"}
              </div>
              {places.length > 0 && (
                <div className="rp-stat lit">
                  <div className="rp-stat-dot" />
                  {places.length} result{places.length !== 1 ? "s" : ""} found
                </div>
              )}
              <div className="rp-stat">
                <span>🤖</span> AI Ranking
              </div>
              <div className="rp-stat">
                <span>📡</span> Real-time
              </div>
            </div>
          </div>

          {/* Toast */}
          {info && (
            <div className="rp-toast" key={info}>
              <span className="rp-toast-icon">✅</span>
              {info}
            </div>
          )}

          {/* Form card */}
          <div className="rp-form-card">
            {/* Toolbar */}
            <div className="rp-form-toolbar">
              <span style={{ fontSize: "1rem" }}>🔍</span>
              <span className="rp-form-toolbar-title">Service Finder</span>
              <div className="rp-toolbar-sep" />
              <div className="rp-coords-badge">
                <span>📍</span>
                <span className="rp-coords-val">{coordsLabel}</span>
              </div>
            </div>

            {/* Results banner */}
            {places.length > 0 && (
              <div className="rp-results-banner" key={places.length}>
                <span>🎯</span>
                <span><span className="rp-results-count">{places.length}</span> service{places.length !== 1 ? "s" : ""} matched near you</span>
              </div>
            )}

            {/* Form body */}
            <div className="rp-form-body">
              <RecommendForm
                userCoords={userCoords}
                onResults={(data) =>
                  setPlaces(Array.isArray(data?.results) ? data.results : [])
                }
                manualSetUserCoords={handleSetUserCoords}
                onShowPlace={handleShowPlace}
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}