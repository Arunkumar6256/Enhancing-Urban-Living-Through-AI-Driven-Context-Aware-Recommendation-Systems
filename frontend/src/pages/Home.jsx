// import React, { useState, useEffect } from "react";
// import { useNavigate } from "react-router-dom";
// import ServiceRecommendations from "../components/ServiceRecommendations";
// import ChatBot from "../components/ChatBot";

// export default function Home() {
//   const [lat, setLat] = useState(17.3850);
//   const [lon, setLon] = useState(78.4867);
//   const [manualLocation, setManualLocation] = useState("");
//   const [msg, setMsg] = useState(null);

//   const navigate = useNavigate();

//   useEffect(() => {
//     if (msg) {
//       const t = setTimeout(() => setMsg(null), 3000);
//       return () => clearTimeout(t);
//     }
//   }, [msg]);

//   function resolveLocation() {
//     if (!manualLocation.trim()) {
//       setMsg("Please enter a location.");
//       return;
//     }

//     fetch(
//       `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
//         manualLocation
//       )}`
//     )
//       .then((r) => r.json())
//       .then((data) => {
//         if (data && data.length > 0) {
//           setLat(Number(data[0].lat));
//           setLon(Number(data[0].lon));
//           setMsg(`Location set to: ${data[0].display_name.split(",")[0]}`);
//         } else {
//           setMsg("Location not found.");
//         }
//       })
//       .catch(() => setMsg("Error resolving location."));
//   }

//   function useMyLocation() {
//     if (!navigator.geolocation) {
//       setMsg("Geolocation not supported.");
//       return;
//     }

//     navigator.geolocation.getCurrentPosition(
//       (pos) => {
//         setLat(pos.coords.latitude);
//         setLon(pos.coords.longitude);
//         setMsg("Current location acquired.");
//       },
//       () => setMsg("Permission denied.")
//     );
//   }

//   function handleSearch(category) {
//     const params = new URLSearchParams({
//       query: category.toLowerCase(), // 🔧 FIX
//       lat: lat.toString(),
//       lon: lon.toString(),
//     });
//     navigate(`/results?${params.toString()}`);
//   }

//   const userCoords = { lat, lon };

//   return (
//     <div className="space-y-8 animate-enter">
//       <section className="text-center py-10">
//         <h1 className="text-4xl font-bold mb-4 font-heading text-[var(--primary)]">
//           Welcome to Smart City
//         </h1>
//         <p className="text-lg text-[var(--text-muted)] max-w-2xl mx-auto">
//           Find the best services near you, from hospitals to transport, tailored
//           to your context.
//         </p>
//       </section>

//       <div className="card p-6 max-w-3xl mx-auto">
//         <div className="flex flex-col md:flex-row gap-4 items-end">
//           <div className="flex-1 w-full">
//             <label className="block text-sm font-semibold mb-1">
//               Set Your Location
//             </label>
//             <div className="flex gap-2">
//               <input
//                 className="input-field"
//                 placeholder="Enter city or area..."
//                 value={manualLocation}
//                 onChange={(e) => setManualLocation(e.target.value)}
//               />
//               <button className="btn" onClick={resolveLocation}>
//                 Update
//               </button>
//             </div>
//           </div>

//           <div className="text-sm font-bold text-[var(--text-muted)] py-2">
//             OR
//           </div>

//           <button
//             className="btn"
//             style={{
//               background: "transparent",
//               border: "1px solid var(--border)",
//               color: "var(--text-main)",
//             }}
//             onClick={useMyLocation}
//           >
//             Use My GPS
//           </button>
//         </div>

//         <div className="mt-4 flex justify-between items-center text-sm text-[var(--text-muted)] bg-[var(--bg-primary)] p-2 rounded">
//           <span>
//             Current: <b>{lat.toFixed(5)}, {lon.toFixed(5)}</b>
//           </span>
//           {msg && (
//             <span className="text-[var(--primary)] font-bold">{msg}</span>
//           )}
//         </div>
//       </div>

//       <section>
//         <h3 className="text-2xl font-bold mb-6 font-heading">Services</h3>
//         <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
//           {[
//             "hospital",
//             "police",
//             "pharmacy",
//             "transport",
//             "government",
//             "education",
//           ].map((cat) => (
//             <button
//               key={cat}
//               onClick={() => handleSearch(cat)}
//               className="card hover:border-[var(--primary)] text-left group text-[var(--text-main)]"
//             >
//               <span className="font-semibold group-hover:text-[var(--primary)] block py-2 capitalize">
//                 {cat}
//               </span>
//             </button>
//           ))}
//         </div>
//       </section>

//       <section>
//         <h3 className="text-2xl font-bold mb-6 font-heading">
//           Recommended
//         </h3>
//         <ServiceRecommendations />
//       </section>

//       {/* 🔧 FIX: pass GPS to chatbot */}
//       <section className="mt-12">
//         <ChatBot userCoords={userCoords} />
//       </section>
//     </div>
//   );
// }


import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import ServiceRecommendations from "../components/ServiceRecommendations";
import ChatBot from "../components/ChatBot";

// ─── Inline styles & keyframes ───────────────────────────────────────────────
const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:ital,wght@0,300;0,400;0,500;1,300&display=swap');

  :root {
    --bg: #0b0f1a;
    --bg-card: #111827;
    --bg-card2: #151d2e;
    --border: rgba(99,179,237,0.13);
    --border-hover: rgba(99,179,237,0.45);
    --primary: #38bdf8;
    --primary-dim: rgba(56,189,248,0.12);
    --primary-glow: rgba(56,189,248,0.35);
    --accent: #f472b6;
    --accent-dim: rgba(244,114,182,0.12);
    --text: #e2e8f0;
    --text-muted: #64748b;
    --text-mid: #94a3b8;
    --success: #34d399;
    --grid-line: rgba(99,179,237,0.04);
    --noise: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E");
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
    --grid-line: rgba(56,130,210,0.06);
  }

  * { box-sizing: border-box; margin: 0; padding: 0; }

  .sc-root {
    font-family: var(--font-body);
    background: var(--bg);
    color: var(--text);
    min-height: 100vh;
    padding: 0 1.5rem 5rem;
    position: relative;
    overflow-x: hidden;
  }

  /* ── Grid background ── */
  .sc-root::before {
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

  .sc-root > * { position: relative; z-index: 1; }

  /* ── Theme toggle ── */
  .theme-toggle {
    position: fixed;
    top: 1.25rem;
    right: 1.5rem;
    z-index: 100;
    width: 48px;
    height: 26px;
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
  .theme-toggle:hover { border-color: var(--border-hover); box-shadow: 0 0 0 3px var(--primary-dim); }
  .theme-toggle-knob {
    width: 18px; height: 18px;
    border-radius: 50%;
    background: var(--primary);
    transition: transform 0.35s cubic-bezier(.34,1.56,.64,1), background 0.3s;
    display: flex; align-items: center; justify-content: center;
    font-size: 10px;
  }
  [data-theme="light"] .theme-toggle-knob { transform: translateX(22px); }

  /* ── Header / Hero ── */
  .sc-hero {
    text-align: center;
    padding: 6rem 1rem 4rem;
    max-width: 720px;
    margin: 0 auto;
  }

  .sc-eyebrow {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    font-size: 0.72rem;
    font-weight: 600;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: var(--primary);
    background: var(--primary-dim);
    border: 1px solid var(--border-hover);
    border-radius: 999px;
    padding: 5px 14px;
    margin-bottom: 1.5rem;
    animation: fadeSlideDown 0.6s ease both;
  }
  .sc-eyebrow-dot {
    width: 6px; height: 6px;
    background: var(--primary);
    border-radius: 50%;
    animation: pulse-dot 2s ease infinite;
  }

  @keyframes pulse-dot {
    0%,100% { opacity:1; transform: scale(1); }
    50% { opacity:0.5; transform: scale(0.7); }
  }

  .sc-title {
    font-family: var(--font-display);
    font-size: clamp(2.4rem, 6vw, 4.2rem);
    font-weight: 800;
    line-height: 1.08;
    letter-spacing: -0.03em;
    animation: fadeSlideDown 0.7s 0.1s ease both;
    background: linear-gradient(135deg, var(--text) 0%, var(--primary) 60%, var(--accent) 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  .sc-subtitle {
    margin-top: 1.1rem;
    font-size: 1.05rem;
    line-height: 1.7;
    color: var(--text-muted);
    animation: fadeSlideDown 0.7s 0.2s ease both;
  }

  @keyframes fadeSlideDown {
    from { opacity:0; transform: translateY(-18px); }
    to   { opacity:1; transform: translateY(0); }
  }

  /* ── Location card ── */
  .sc-loc-card {
    max-width: 680px;
    margin: 0 auto;
    background: var(--bg-card);
    border: 1px solid var(--border);
    border-radius: 20px;
    padding: 1.75rem 2rem;
    box-shadow: 0 8px 40px rgba(0,0,0,0.18), inset 0 1px 0 rgba(255,255,255,0.04);
    animation: fadeSlideUp 0.65s 0.3s ease both;
    transition: border-color 0.3s, box-shadow 0.3s;
  }
  .sc-loc-card:hover {
    border-color: var(--border-hover);
    box-shadow: 0 8px 40px rgba(0,0,0,0.22), 0 0 0 1px var(--primary-dim);
  }

  .sc-loc-label {
    font-size: 0.78rem;
    font-weight: 600;
    letter-spacing: 0.09em;
    text-transform: uppercase;
    color: var(--text-muted);
    margin-bottom: 0.85rem;
  }

  .sc-loc-row {
    display: flex;
    gap: 10px;
    align-items: stretch;
  }

  .sc-input {
    flex: 1;
    background: var(--bg-card2);
    border: 1px solid var(--border);
    border-radius: 12px;
    padding: 0.7rem 1rem;
    font-family: var(--font-body);
    font-size: 0.95rem;
    color: var(--text);
    outline: none;
    transition: border-color 0.25s, box-shadow 0.25s;
    min-width: 0;
  }
  .sc-input::placeholder { color: var(--text-muted); }
  .sc-input:focus {
    border-color: var(--primary);
    box-shadow: 0 0 0 3px var(--primary-dim);
  }

  .sc-btn {
    font-family: var(--font-display);
    font-size: 0.88rem;
    font-weight: 700;
    letter-spacing: 0.03em;
    padding: 0.7rem 1.3rem;
    border-radius: 12px;
    cursor: pointer;
    border: none;
    transition: transform 0.18s, box-shadow 0.18s, background 0.2s, opacity 0.2s;
    white-space: nowrap;
    display: inline-flex;
    align-items: center;
    gap: 6px;
  }
  .sc-btn:active { transform: scale(0.96); }

  .sc-btn-primary {
    background: var(--primary);
    color: #fff;
    box-shadow: 0 4px 16px var(--primary-glow);
  }
  .sc-btn-primary:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 24px var(--primary-glow);
  }

  .sc-btn-ghost {
    background: var(--primary-dim);
    color: var(--primary);
    border: 1px solid var(--border-hover);
  }
  .sc-btn-ghost:hover {
    transform: translateY(-2px);
    background: var(--primary-glow);
    box-shadow: 0 4px 16px var(--primary-dim);
  }

  .sc-divider {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 0 4px;
  }
  .sc-divider::before, .sc-divider::after {
    content:'';
    flex:1;
    height:1px;
    background: var(--border);
  }
  .sc-divider span {
    font-size: 0.7rem;
    font-weight: 700;
    letter-spacing: 0.1em;
    color: var(--text-muted);
  }

  .sc-loc-meta {
    margin-top: 1rem;
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex-wrap: wrap;
    gap: 8px;
    background: var(--bg-card2);
    border: 1px solid var(--border);
    border-radius: 10px;
    padding: 0.6rem 1rem;
    font-size: 0.82rem;
    color: var(--text-muted);
  }
  .sc-loc-coords {
    display: flex;
    align-items: center;
    gap: 6px;
  }
  .sc-loc-coords b { color: var(--text-mid); font-weight: 500; }

  .sc-msg {
    display: flex;
    align-items: center;
    gap: 6px;
    color: var(--primary);
    font-weight: 600;
    font-size: 0.82rem;
    animation: msgIn 0.3s ease;
  }
  @keyframes msgIn {
    from { opacity:0; transform: translateX(8px); }
    to   { opacity:1; transform: translateX(0); }
  }

  /* ── Section heading ── */
  .sc-section { margin-top: 3.5rem; }
  .sc-section-header {
    display: flex;
    align-items: baseline;
    gap: 12px;
    margin-bottom: 1.5rem;
  }
  .sc-section-title {
    font-family: var(--font-display);
    font-size: 1.6rem;
    font-weight: 700;
    letter-spacing: -0.02em;
  }
  .sc-section-line {
    flex: 1;
    height: 1px;
    background: linear-gradient(to right, var(--border), transparent);
  }
  .sc-section-count {
    font-size: 0.72rem;
    font-weight: 600;
    letter-spacing: 0.1em;
    color: var(--text-muted);
    text-transform: uppercase;
  }

  /* ── Service grid ── */
  .sc-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 14px;
  }
  @media(min-width: 640px) { .sc-grid { grid-template-columns: repeat(3, 1fr); } }
  @media(min-width: 900px) { .sc-grid { grid-template-columns: repeat(6, 1fr); } }

  .sc-service-btn {
    position: relative;
    background: var(--bg-card);
    border: 1px solid var(--border);
    border-radius: 16px;
    padding: 1.3rem 0.9rem 1.1rem;
    cursor: pointer;
    text-align: center;
    transition: border-color 0.25s, transform 0.25s, box-shadow 0.25s, background 0.25s;
    color: var(--text);
    font-family: var(--font-body);
    overflow: hidden;
    animation: fadeSlideUp 0.5s ease both;
  }
  .sc-service-btn:nth-child(1) { animation-delay: 0.05s; }
  .sc-service-btn:nth-child(2) { animation-delay: 0.10s; }
  .sc-service-btn:nth-child(3) { animation-delay: 0.15s; }
  .sc-service-btn:nth-child(4) { animation-delay: 0.20s; }
  .sc-service-btn:nth-child(5) { animation-delay: 0.25s; }
  .sc-service-btn:nth-child(6) { animation-delay: 0.30s; }

  .sc-service-btn::before {
    content: '';
    position: absolute;
    inset: 0;
    opacity: 0;
    transition: opacity 0.3s;
    border-radius: inherit;
  }

  .sc-service-btn:hover {
    border-color: var(--border-hover);
    transform: translateY(-4px) scale(1.02);
    box-shadow: 0 12px 32px rgba(0,0,0,0.2), 0 0 0 1px var(--primary-dim);
  }
  .sc-service-btn:hover::before { opacity: 1; }
  .sc-service-btn:active { transform: scale(0.97); }

  .sc-service-icon {
    font-size: 1.9rem;
    margin-bottom: 0.6rem;
    display: block;
    transition: transform 0.3s cubic-bezier(.34,1.56,.64,1);
    filter: drop-shadow(0 0 8px transparent);
    transition: transform 0.3s cubic-bezier(.34,1.56,.64,1), filter 0.3s;
  }
  .sc-service-btn:hover .sc-service-icon {
    transform: scale(1.22) rotate(-6deg);
    filter: drop-shadow(0 0 10px var(--primary-glow));
  }

  .sc-service-name {
    font-family: var(--font-display);
    font-size: 0.82rem;
    font-weight: 700;
    letter-spacing: 0.04em;
    text-transform: uppercase;
    color: var(--text-mid);
    transition: color 0.2s;
  }
  .sc-service-btn:hover .sc-service-name { color: var(--primary); }

  .sc-service-ripple {
    position: absolute;
    border-radius: 50%;
    background: var(--primary-dim);
    transform: scale(0);
    animation: ripple 0.6s linear;
    pointer-events: none;
  }
  @keyframes ripple {
    to { transform: scale(4); opacity: 0; }
  }

  /* ── Recommended section ── */
  .sc-recommended {
    background: var(--bg-card);
    border: 1px solid var(--border);
    border-radius: 20px;
    padding: 2rem;
    box-shadow: 0 4px 24px rgba(0,0,0,0.12);
  }

  /* ── Chatbot section ── */
  .sc-chat-wrapper {
    background: var(--bg-card);
    border: 1px solid var(--border);
    border-radius: 24px;
    overflow: hidden;
    box-shadow: 0 8px 40px rgba(0,0,0,0.18);
  }
  .sc-chat-header {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 1.1rem 1.5rem;
    border-bottom: 1px solid var(--border);
    background: var(--bg-card2);
  }
  .sc-chat-dot {
    width: 8px; height: 8px;
    border-radius: 50%;
    background: var(--success);
    box-shadow: 0 0 6px var(--success);
    animation: pulse-dot 2.5s ease infinite;
  }
  .sc-chat-title {
    font-family: var(--font-display);
    font-size: 0.88rem;
    font-weight: 700;
    letter-spacing: 0.04em;
    text-transform: uppercase;
    color: var(--text-mid);
  }

  @keyframes fadeSlideUp {
    from { opacity:0; transform: translateY(20px); }
    to   { opacity:1; transform: translateY(0); }
  }

  /* ── GPS pin icon ── */
  .gps-icon { animation: bounce-pin 2.5s ease infinite; display: inline-block; }
  @keyframes bounce-pin {
    0%,100% { transform: translateY(0); }
    50% { transform: translateY(-4px); }
  }

  /* ── Floating orb accents ── */
  .orb {
    position: fixed;
    border-radius: 50%;
    filter: blur(80px);
    pointer-events: none;
    z-index: 0;
    opacity: 0.12;
  }
  .orb-1 {
    width: 420px; height: 420px;
    background: var(--primary);
    top: -100px; right: -80px;
    animation: orb-drift 14s ease-in-out infinite alternate;
  }
  .orb-2 {
    width: 320px; height: 320px;
    background: var(--accent);
    bottom: 10%; left: -60px;
    animation: orb-drift 18s 4s ease-in-out infinite alternate;
  }
  @keyframes orb-drift {
    from { transform: translate(0,0) scale(1); }
    to   { transform: translate(30px,40px) scale(1.1); }
  }
  [data-theme="light"] .orb { opacity: 0.07; }
`;

// ─── Service config ──────────────────────────────────────────────────────────
const SERVICES = [
  { id: "hospital",   emoji: "🏥", label: "Hospital",   color: "#f87171" },
  { id: "police",     emoji: "🚔", label: "Police",     color: "#60a5fa" },
  { id: "pharmacy",   emoji: "💊", label: "Pharmacy",   color: "#34d399" },
  { id: "transport",  emoji: "🚌", label: "Transport",  color: "#fbbf24" },
  { id: "government", emoji: "🏛️", label: "Govt",       color: "#a78bfa" },
  { id: "education",  emoji: "🎓", label: "Education",  color: "#f472b6" },
];

// ─── Component ───────────────────────────────────────────────────────────────
export default function Home() {
  const [lat, setLat] = useState(17.385);
  const [lon, setLon] = useState(78.4867);
  const [manualLocation, setManualLocation] = useState("");
  const [msg, setMsg] = useState(null);
  const [theme, setTheme] = useState("dark");
  const navigate = useNavigate();
  const rootRef = useRef(null);

  // Auto-clear messages
  useEffect(() => {
    if (!msg) return;
    const t = setTimeout(() => setMsg(null), 3000);
    return () => clearTimeout(t);
  }, [msg]);

  // Apply theme
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    if (rootRef.current) rootRef.current.setAttribute("data-theme", theme);
  }, [theme]);

  function resolveLocation() {
    if (!manualLocation.trim()) { setMsg("Please enter a location."); return; }
    fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(manualLocation)}`)
      .then(r => r.json())
      .then(data => {
        if (data?.length > 0) {
          setLat(Number(data[0].lat));
          setLon(Number(data[0].lon));
          setMsg(`📍 ${data[0].display_name.split(",")[0]}`);
        } else setMsg("Location not found.");
      })
      .catch(() => setMsg("Error resolving location."));
  }

  function useMyLocation() {
    if (!navigator.geolocation) { setMsg("Geolocation not supported."); return; }
    navigator.geolocation.getCurrentPosition(
      pos => { setLat(pos.coords.latitude); setLon(pos.coords.longitude); setMsg("✅ Location acquired!"); },
      () => setMsg("Permission denied.")
    );
  }

  function handleSearch(cat) {
    const params = new URLSearchParams({ query: cat.toLowerCase(), lat: lat.toString(), lon: lon.toString() });
    navigate(`/results?${params.toString()}`);
  }

  // Ripple effect on service buttons
  function addRipple(e) {
    const btn = e.currentTarget;
    const circle = document.createElement("span");
    const rect = btn.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    circle.style.cssText = `width:${size}px;height:${size}px;left:${e.clientX - rect.left - size/2}px;top:${e.clientY - rect.top - size/2}px;`;
    circle.classList.add("sc-service-ripple");
    btn.appendChild(circle);
    setTimeout(() => circle.remove(), 700);
  }

  const userCoords = { lat, lon };

  return (
    <>
      <style>{STYLES}</style>
      <div className="sc-root" ref={rootRef} data-theme={theme}>
        {/* Ambient orbs */}
        <div className="orb orb-1" />
        <div className="orb orb-2" />

        {/* Theme toggle */}
        <button className="theme-toggle" onClick={() => setTheme(t => t === "dark" ? "light" : "dark")} aria-label="Toggle theme">
          <div className="theme-toggle-knob">{theme === "dark" ? "🌙" : "☀️"}</div>
        </button>

        {/* Hero */}
        <section className="sc-hero">
          <div className="sc-eyebrow">
            <div className="sc-eyebrow-dot" />
            Smart City Platform
          </div>
          <h1 className="sc-title">City Services,<br />At Your Fingertips</h1>
          <p className="sc-subtitle">
            Discover hospitals, transit, and government services near you —
            powered by real-time location intelligence.
          </p>
        </section>

        {/* Location card */}
        <div className="sc-loc-card" style={{ animation: "fadeSlideUp 0.65s 0.3s ease both" }}>
          <div className="sc-loc-label">📍 Set Your Location</div>
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            <div className="sc-loc-row">
              <input
                className="sc-input"
                placeholder="Enter city or neighbourhood…"
                value={manualLocation}
                onChange={e => setManualLocation(e.target.value)}
                onKeyDown={e => e.key === "Enter" && resolveLocation()}
              />
              <button className="sc-btn sc-btn-primary" onClick={resolveLocation}>
                Search
              </button>
            </div>
            <div className="sc-divider"><span>or</span></div>
            <button className="sc-btn sc-btn-ghost" style={{ width: "100%", justifyContent: "center" }} onClick={useMyLocation}>
              <span className="gps-icon">📡</span> Use My GPS Location
            </button>
          </div>
          <div className="sc-loc-meta">
            <div className="sc-loc-coords">
              <span>🌐</span>
              <span>Coords: <b>{lat.toFixed(5)}, {lon.toFixed(5)}</b></span>
            </div>
            {msg && (
              <div className="sc-msg">
                <span>{msg}</span>
              </div>
            )}
          </div>
        </div>

        {/* Services */}
        <section className="sc-section">
          <div className="sc-section-header">
            <h3 className="sc-section-title">Services</h3>
            <div className="sc-section-line" />
            <span className="sc-section-count">{SERVICES.length} categories</span>
          </div>
          <div className="sc-grid">
            {SERVICES.map(({ id, emoji, label, color }) => (
              <button
                key={id}
                className="sc-service-btn"
                onClick={e => { addRipple(e); handleSearch(id); }}
                style={{ "--svc-color": color }}
              >
                <span className="sc-service-icon">{emoji}</span>
                <span className="sc-service-name">{label}</span>
              </button>
            ))}
          </div>
        </section>

        {/* Recommended */}
        <section className="sc-section">
          <div className="sc-section-header">
            <h3 className="sc-section-title">Recommended</h3>
            <div className="sc-section-line" />
          </div>
          <div className="sc-recommended">
            <ServiceRecommendations />
          </div>
        </section>

        {/* ChatBot */}
        <section className="sc-section">
          <div className="sc-section-header">
            <h3 className="sc-section-title">City Assistant</h3>
            <div className="sc-section-line" />
          </div>
          <div className="sc-chat-wrapper">
            <div className="sc-chat-header">
              <div className="sc-chat-dot" />
              <span className="sc-chat-title">AI Assistant — Online</span>
            </div>
            <ChatBot userCoords={userCoords} />
          </div>
        </section>
      </div>
    </>
  );
}