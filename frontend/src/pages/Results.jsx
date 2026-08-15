// import React, { useEffect, useState } from "react";
// import { useSearchParams, useNavigate } from "react-router-dom";
// import { postRecommend } from "../api";

// export default function Results() {
//   const [searchParams] = useSearchParams();
//   const navigate = useNavigate();

//   const [loading, setLoading] = useState(true);
//   const [results, setResults] = useState([]);
//   const [count, setCount] = useState(0);
//   const [error, setError] = useState(null);
//   const [userCoords, setUserCoords] = useState(null);

//   const q = (searchParams.get("query") || "").toLowerCase();
//   const latParam = parseFloat(searchParams.get("lat") || "0");
//   const lonParam = parseFloat(searchParams.get("lon") || "0");
//   const k = parseInt(searchParams.get("k") || "10", 10);
//   const max_radius_km = parseFloat(
//     searchParams.get("max_radius_km") || "20"
//   );

//   // Load stored GPS if URL params are missing
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

//   const lat = Number.isFinite(latParam) && latParam !== 0
//     ? latParam
//     : userCoords?.lat;

//   const lon = Number.isFinite(lonParam) && lonParam !== 0
//     ? lonParam
//     : userCoords?.lon;

//   useEffect(() => {
//     if (!q) {
//       setError("No query provided");
//       setLoading(false);
//       return;
//     }

//     if (!lat || !lon) {
//       setError("Location not available");
//       setLoading(false);
//       return;
//     }

//     setLoading(true);
//     setError(null);

//     postRecommend({
//       query: q,
//       lat,
//       lon,
//       k,
//       max_radius_km,
//     })
//       .then((data) => {
//         setResults(Array.isArray(data?.results) ? data.results : []);
//         setCount(
//           data?.count ??
//             (Array.isArray(data?.results) ? data.results.length : 0)
//         );
//       })
//       .catch((err) => {
//         setError(err?.message || "Service retrieval failed");
//       })
//       .finally(() => setLoading(false));
//   }, [q, lat, lon, k, max_radius_km]);

//   function openGoogleMaps(r) {
//     if (!r?.latitude || !r?.longitude) return;

//     const url = lat && lon
//       ? `https://www.google.com/maps/dir/?api=1&origin=${lat},${lon}&destination=${r.latitude},${r.longitude}&travelmode=driving`
//       : `https://www.google.com/maps/dir/?api=1&destination=${r.latitude},${r.longitude}`;

//     window.open(url, "_blank");
//   }

//   return (
//     <div className="space-y-6">
//       <div className="flex flex-col md:flex-row justify-between items-center bg-white border border-gray-200 p-6 rounded-lg shadow-sm">
//         <div>
//           <h2 className="text-2xl font-bold">
//             Search Results:{" "}
//             <span className="text-blue-700">“{q}”</span>
//           </h2>
//           <div className="text-sm text-gray-500 mt-1">
//             Found <b>{count}</b> entries within{" "}
//             <b>{max_radius_km} km</b>
//           </div>
//         </div>

//         <div className="flex gap-2 mt-4 md:mt-0">
//           <button
//             className="btn-gov-outline text-sm"
//             onClick={() => navigate("/home")}
//           >
//             &larr; New Search
//           </button>
//         </div>
//       </div>

//       {loading && (
//         <div className="p-12 text-center">
//           <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
//           <div className="text-gray-500 font-medium">
//             Accessing Database...
//           </div>
//         </div>
//       )}

//       {error && (
//         <div className="bg-red-50 border-l-4 border-red-600 p-4 text-red-700">
//           <b>System Error:</b> {error}
//         </div>
//       )}

//       {!loading && !error && (
//         <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
//           {results.length === 0 ? (
//             <div className="p-8 text-center text-gray-500">
//               No records found matching your criteria.
//             </div>
//           ) : (
//             <div className="divide-y divide-gray-100">
//               <div className="hidden md:grid grid-cols-12 gap-4 p-4 bg-gray-50 font-bold text-xs uppercase text-gray-500">
//                 <div className="col-span-5">Entity Name</div>
//                 <div className="col-span-3">Category</div>
//                 <div className="col-span-2">Distance</div>
//                 <div className="col-span-2 text-right">Actions</div>
//               </div>

//               {results.map((r) => (
//                 <div
//                   key={r.business_id || `${r.latitude}-${r.longitude}`}
//                   className="p-4 md:grid md:grid-cols-12 md:gap-4 md:items-center hover:bg-blue-50/50 transition-colors"
//                 >
//                   <div className="col-span-5 mb-2 md:mb-0">
//                     <div className="font-bold text-gray-900">
//                       {r.display_name || r.name}
//                     </div>
//                     <div className="text-xs text-gray-400 md:hidden mt-1">
//                       {r.categories_display || r.categories}
//                     </div>
//                   </div>

//                   <div className="col-span-3 hidden md:block text-sm text-gray-600">
//                     {r.categories_display || r.categories}
//                   </div>

//                   <div className="col-span-2 text-sm text-gray-600">
//                     📏 Approx.{" "}
//                     {Number.isFinite(r.distance_km)
//                       ? r.distance_km
//                       : "?"}{" "}
//                     km
//                   </div>

//                   <div className="col-span-2 text-right flex gap-2 justify-end mt-2 md:mt-0">
//                     <button
//                       className="btn-gov text-xs py-1 px-3"
//                       onClick={() => {
//                         localStorage.setItem(
//                           "last_shown_place",
//                           JSON.stringify(r)
//                         );
//                         navigate("/map");
//                       }}
//                     >
//                       Map
//                     </button>

//                     <button
//                       className="btn-gov-outline text-xs py-1 px-3"
//                       onClick={() => openGoogleMaps(r)}
//                     >
//                       Navigate
//                     </button>
//                   </div>
//                 </div>
//               ))}
//             </div>
//           )}
//         </div>
//       )}
//     </div>
//   );
// }


import React, { useEffect, useState, useRef } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { postRecommend } from "../api";

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
    --success-dim: rgba(52,211,153,0.10);
    --danger: #f87171;
    --danger-dim: rgba(248,113,113,0.10);
    --danger-border: rgba(248,113,113,0.3);
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
    --danger: #dc2626;
    --danger-dim: rgba(220,38,38,0.07);
    --danger-border: rgba(220,38,38,0.25);
    --grid-line: rgba(56,130,210,0.06);
  }

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  .rs-root {
    font-family: var(--font-body);
    background: var(--bg); color: var(--text);
    min-height: 100vh;
    padding: 2rem 1.5rem 5rem;
    position: relative; overflow-x: hidden;
    transition: background 0.4s, color 0.4s;
  }
  .rs-root::before {
    content: '';
    position: fixed; inset: 0;
    background-image:
      linear-gradient(var(--grid-line) 1px, transparent 1px),
      linear-gradient(90deg, var(--grid-line) 1px, transparent 1px);
    background-size: 44px 44px;
    pointer-events: none; z-index: 0;
  }

  .rs-orb {
    position: fixed; border-radius: 50%;
    filter: blur(100px); pointer-events: none; z-index: 0; opacity: 0.09;
  }
  .rs-orb-1 { width: 480px; height: 480px; background: var(--primary); top: -150px; right: -110px; animation: orb-drift 17s ease-in-out infinite alternate; }
  .rs-orb-2 { width: 340px; height: 340px; background: var(--accent); bottom: 5%; left: -80px; animation: orb-drift 22s 5s ease-in-out infinite alternate; }
  [data-theme="light"] .rs-orb { opacity: 0.05; }
  @keyframes orb-drift {
    from { transform: translate(0,0) scale(1); }
    to   { transform: translate(35px,45px) scale(1.1); }
  }

  /* Toggle */
  .rs-toggle {
    position: fixed; top: 1.25rem; right: 1.5rem; z-index: 100;
    width: 48px; height: 26px;
    background: var(--bg-card); border: 1px solid var(--border);
    border-radius: 999px; cursor: pointer;
    display: flex; align-items: center; padding: 3px;
    box-shadow: 0 2px 12px rgba(0,0,0,0.2);
    transition: border-color 0.3s, box-shadow 0.3s;
  }
  .rs-toggle:hover { border-color: var(--border-hover); box-shadow: 0 0 0 3px var(--primary-dim); }
  .rs-toggle-knob {
    width: 18px; height: 18px; border-radius: 50%; background: var(--primary);
    transition: transform 0.35s cubic-bezier(.34,1.56,.64,1);
    display: flex; align-items: center; justify-content: center; font-size: 10px;
  }
  [data-theme="light"] .rs-toggle-knob { transform: translateX(22px); }

  .rs-inner { position: relative; z-index: 1; max-width: 1100px; margin: 0 auto; }

  /* ── Top bar ── */
  .rs-topbar {
    display: flex; align-items: flex-start; justify-content: space-between;
    flex-wrap: wrap; gap: 1rem;
    background: var(--bg-card);
    border: 1px solid var(--border);
    border-radius: 20px; padding: 1.5rem 1.75rem;
    box-shadow: 0 4px 24px rgba(0,0,0,0.15);
    margin-bottom: 1.5rem;
    animation: fadeDown 0.55s 0.05s ease both;
    transition: border-color 0.3s;
  }
  .rs-topbar:hover { border-color: var(--border-hover); }

  .rs-eyebrow {
    display: inline-flex; align-items: center; gap: 6px;
    font-size: 0.67rem; font-weight: 600; letter-spacing: 0.12em; text-transform: uppercase;
    color: var(--primary); background: var(--primary-dim);
    border: 1px solid var(--border-hover); border-radius: 999px;
    padding: 3px 11px; margin-bottom: 0.5rem;
  }
  .rs-eyebrow-dot {
    width: 5px; height: 5px; border-radius: 50%;
    background: var(--primary); box-shadow: 0 0 5px var(--primary);
    animation: pulse-dot 2s ease infinite;
  }
  @keyframes pulse-dot {
    0%,100% { opacity:1; transform:scale(1); }
    50%      { opacity:0.4; transform:scale(0.6); }
  }

  .rs-query-title {
    font-family: var(--font-display);
    font-size: clamp(1.4rem, 3vw, 2rem);
    font-weight: 800; letter-spacing: -0.03em; line-height: 1.15;
    color: var(--text);
  }
  .rs-query-token {
    background: linear-gradient(90deg, var(--primary), var(--accent));
    -webkit-background-clip: text; -webkit-text-fill-color: transparent;
    background-clip: text;
  }
  .rs-meta-row {
    display: flex; align-items: center; gap: 8px; flex-wrap: wrap;
    margin-top: 0.6rem;
  }
  .rs-meta-chip {
    display: inline-flex; align-items: center; gap: 5px;
    font-size: 0.75rem; font-weight: 500;
    padding: 3px 10px; border-radius: 999px;
    background: var(--bg-card2); border: 1px solid var(--border);
    color: var(--text-muted);
  }
  .rs-meta-chip.green { border-color: var(--success); color: var(--success); background: var(--success-dim); }

  /* Back button */
  .rs-back-btn {
    font-family: var(--font-display);
    font-size: 0.82rem; font-weight: 700; letter-spacing: 0.03em;
    padding: 0.6rem 1.1rem; border-radius: 12px; border: none; cursor: pointer;
    background: var(--bg-card2); color: var(--text-mid);
    border: 1px solid var(--border);
    display: flex; align-items: center; gap: 6px;
    transition: transform 0.2s, border-color 0.2s, color 0.2s;
    white-space: nowrap;
    align-self: flex-start;
  }
  .rs-back-btn:hover { transform: translateY(-2px); border-color: var(--border-hover); color: var(--primary); }
  .rs-back-arrow { transition: transform 0.2s; }
  .rs-back-btn:hover .rs-back-arrow { transform: translateX(-4px); }

  /* ── Loading ── */
  .rs-loading {
    display: flex; flex-direction: column; align-items: center; justify-content: center;
    padding: 5rem 2rem; gap: 1.25rem;
    animation: fadeUp 0.4s ease both;
  }
  .rs-spinner-wrap { position: relative; width: 56px; height: 56px; }
  .rs-spinner {
    width: 56px; height: 56px; border-radius: 50%;
    border: 2px solid var(--border);
    border-top-color: var(--primary);
    animation: spin 0.85s linear infinite;
  }
  .rs-spinner-core {
    position: absolute; inset: 10px; border-radius: 50%;
    background: var(--primary-dim);
    animation: pulse-core 1.7s ease infinite;
  }
  @keyframes spin { to { transform: rotate(360deg); } }
  @keyframes pulse-core {
    0%,100% { opacity:0.4; transform:scale(0.85); }
    50%      { opacity:1;   transform:scale(1); }
  }
  .rs-loading-text {
    font-family: var(--font-display);
    font-size: 0.88rem; font-weight: 700; letter-spacing: 0.06em;
    text-transform: uppercase; color: var(--text-muted);
  }
  .rs-loading-dots::after {
    content: ''; animation: dots 1.4s steps(4, end) infinite;
  }
  @keyframes dots {
    0%   { content: '';    }
    25%  { content: '.';   }
    50%  { content: '..';  }
    75%  { content: '...'; }
  }

  /* ── Error ── */
  .rs-error {
    display: flex; align-items: flex-start; gap: 10px;
    background: var(--danger-dim); border: 1px solid var(--danger-border);
    border-radius: 16px; padding: 1rem 1.25rem;
    animation: fadeUp 0.4s ease both;
  }
  .rs-error-icon { font-size: 1.1rem; flex-shrink: 0; margin-top: 1px; }
  .rs-error-text { font-size: 0.88rem; color: var(--danger); line-height: 1.55; }
  .rs-error-label { font-family: var(--font-display); font-weight: 700; display: block; margin-bottom: 2px; }

  /* ── Results table card ── */
  .rs-table-card {
    background: var(--bg-card);
    border: 1px solid var(--border);
    border-radius: 20px; overflow: hidden;
    box-shadow: 0 8px 40px rgba(0,0,0,0.18);
    animation: fadeUp 0.55s 0.1s ease both;
    transition: border-color 0.3s;
  }
  .rs-table-card:hover { border-color: var(--border-hover); }

  /* Table toolbar */
  .rs-table-toolbar {
    display: flex; align-items: center; justify-content: space-between;
    flex-wrap: wrap; gap: 10px;
    padding: 0.9rem 1.4rem;
    border-bottom: 1px solid var(--border);
    background: var(--bg-card2);
  }
  .rs-table-toolbar-left { display: flex; align-items: center; gap: 10px; }
  .rs-table-toolbar-title {
    font-family: var(--font-display);
    font-size: 0.78rem; font-weight: 700; letter-spacing: 0.07em; text-transform: uppercase;
    color: var(--text-muted);
  }
  .rs-toolbar-sep { width: 1px; height: 16px; background: var(--border); }
  .rs-count-badge {
    font-family: var(--font-display); font-size: 0.75rem; font-weight: 700;
    padding: 3px 10px; border-radius: 999px;
    background: var(--primary-dim); border: 1px solid var(--border-hover); color: var(--primary);
  }

  /* Table header */
  .rs-thead {
    display: none;
  }
  @media(min-width: 768px) {
    .rs-thead {
      display: grid; grid-template-columns: 1fr 220px 120px 160px;
      gap: 1rem; padding: 0.75rem 1.4rem;
      border-bottom: 1px solid var(--border);
      background: var(--bg-card2);
    }
  }
  .rs-th {
    font-size: 0.68rem; font-weight: 700; letter-spacing: 0.1em;
    text-transform: uppercase; color: var(--text-muted);
  }
  .rs-th:last-child { text-align: right; }

  /* Result rows */
  .rs-row {
    padding: 1rem 1.4rem;
    border-bottom: 1px solid var(--border);
    transition: background 0.2s, border-color 0.2s;
    animation: row-in 0.4s ease both;
    cursor: default;
  }
  .rs-row:last-child { border-bottom: none; }
  .rs-row:hover { background: var(--primary-dim); border-left: 2px solid var(--primary); padding-left: calc(1.4rem - 2px); }
  @keyframes row-in {
    from { opacity:0; transform: translateX(-8px); }
    to   { opacity:1; transform: translateX(0); }
  }

  @media(min-width: 768px) {
    .rs-row {
      display: grid; grid-template-columns: 1fr 220px 120px 160px;
      gap: 1rem; align-items: center;
    }
  }

  .rs-row-name {
    font-family: var(--font-display);
    font-size: 0.95rem; font-weight: 700; color: var(--text);
    line-height: 1.3; margin-bottom: 4px;
  }
  .rs-row-cat-mobile {
    font-size: 0.75rem; color: var(--text-muted);
    display: block;
  }
  @media(min-width: 768px) { .rs-row-cat-mobile { display: none; } }

  .rs-row-cat {
    display: none;
  }
  @media(min-width: 768px) {
    .rs-row-cat {
      display: flex; align-items: center; gap: 6px;
      font-size: 0.82rem; color: var(--text-mid);
    }
  }

  .rs-cat-dot {
    width: 6px; height: 6px; border-radius: 50%;
    background: var(--accent); flex-shrink: 0;
  }

  .rs-row-dist {
    display: flex; align-items: center; gap: 6px;
    font-size: 0.82rem; color: var(--text-mid);
    margin-top: 6px;
  }
  @media(min-width: 768px) { .rs-row-dist { margin-top: 0; } }
  .rs-dist-badge {
    font-family: var(--font-display); font-size: 0.78rem; font-weight: 700;
    color: var(--primary); background: var(--primary-dim);
    border: 1px solid var(--border-hover); border-radius: 8px; padding: 2px 8px;
  }

  .rs-row-actions {
    display: flex; gap: 7px; align-items: center;
    margin-top: 10px; justify-content: flex-start;
  }
  @media(min-width: 768px) { .rs-row-actions { margin-top: 0; justify-content: flex-end; } }

  .rs-btn {
    font-family: var(--font-display); font-size: 0.75rem; font-weight: 700;
    letter-spacing: 0.04em; padding: 5px 12px; border-radius: 9px;
    cursor: pointer; border: none;
    display: inline-flex; align-items: center; gap: 5px;
    transition: transform 0.18s, box-shadow 0.18s, background 0.2s;
    white-space: nowrap;
  }
  .rs-btn:active { transform: scale(0.95); }

  .rs-btn-map {
    background: var(--primary); color: #fff;
    box-shadow: 0 2px 10px var(--primary-glow);
  }
  .rs-btn-map:hover { transform: translateY(-2px); box-shadow: 0 5px 16px var(--primary-glow); }

  .rs-btn-nav {
    background: var(--bg-card2); color: var(--text-mid);
    border: 1px solid var(--border);
  }
  .rs-btn-nav:hover { transform: translateY(-2px); border-color: var(--border-hover); color: var(--primary); }

  /* Empty state */
  .rs-empty {
    display: flex; flex-direction: column; align-items: center; justify-content: center;
    padding: 4.5rem 2rem; gap: 12px;
    color: var(--text-muted);
  }
  .rs-empty-icon {
    font-size: 2.8rem;
    animation: float-icon 4s ease-in-out infinite;
  }
  @keyframes float-icon {
    0%,100% { transform: translateY(0); }
    50%      { transform: translateY(-8px); }
  }
  .rs-empty-title {
    font-family: var(--font-display); font-size: 1rem; font-weight: 700; color: var(--text-mid);
  }
  .rs-empty-sub { font-size: 0.85rem; text-align: center; line-height: 1.6; }

  @keyframes fadeDown {
    from { opacity:0; transform: translateY(-14px); }
    to   { opacity:1; transform: translateY(0); }
  }
  @keyframes fadeUp {
    from { opacity:0; transform: translateY(16px); }
    to   { opacity:1; transform: translateY(0); }
  }
`;

export default function Results() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [results, setResults] = useState([]);
  const [count, setCount] = useState(0);
  const [error, setError] = useState(null);
  const [userCoords, setUserCoords] = useState(null);
  const [theme, setTheme] = useState("dark");
  const rootRef = useRef(null);

  useEffect(() => {
    if (rootRef.current) rootRef.current.setAttribute("data-theme", theme);
  }, [theme]);

  const q = (searchParams.get("query") || "").toLowerCase();
  const latParam = parseFloat(searchParams.get("lat") || "0");
  const lonParam = parseFloat(searchParams.get("lon") || "0");
  const k = parseInt(searchParams.get("k") || "10", 10);
  const max_radius_km = parseFloat(searchParams.get("max_radius_km") || "20");

  useEffect(() => {
    const raw = localStorage.getItem("user_coords");
    if (!raw) return;
    try {
      const coords = JSON.parse(raw);
      if (coords?.lat && coords?.lon) setUserCoords(coords);
    } catch { /* ignore */ }
  }, []);

  const lat = Number.isFinite(latParam) && latParam !== 0 ? latParam : userCoords?.lat;
  const lon = Number.isFinite(lonParam) && lonParam !== 0 ? lonParam : userCoords?.lon;

  useEffect(() => {
    if (!q) { setError("No query provided"); setLoading(false); return; }
    if (!lat || !lon) { setError("Location not available"); setLoading(false); return; }
    setLoading(true); setError(null);
    postRecommend({ query: q, lat, lon, k, max_radius_km })
      .then((data) => {
        setResults(Array.isArray(data?.results) ? data.results : []);
        setCount(data?.count ?? (Array.isArray(data?.results) ? data.results.length : 0));
      })
      .catch((err) => setError(err?.message || "Service retrieval failed"))
      .finally(() => setLoading(false));
  }, [q, lat, lon, k, max_radius_km]);

  function openGoogleMaps(r) {
    if (!r?.latitude || !r?.longitude) return;
    const url = lat && lon
      ? `https://www.google.com/maps/dir/?api=1&origin=${lat},${lon}&destination=${r.latitude},${r.longitude}&travelmode=driving`
      : `https://www.google.com/maps/dir/?api=1&destination=${r.latitude},${r.longitude}`;
    window.open(url, "_blank");
  }

  return (
    <>
      <style>{STYLES}</style>
      <div className="rs-root" ref={rootRef} data-theme={theme}>
        <div className="rs-orb rs-orb-1" />
        <div className="rs-orb rs-orb-2" />

        <button className="rs-toggle" onClick={() => setTheme(t => t === "dark" ? "light" : "dark")} aria-label="Toggle theme">
          <div className="rs-toggle-knob">{theme === "dark" ? "🌙" : "☀️"}</div>
        </button>

        <div className="rs-inner">
          {/* Top bar */}
          <div className="rs-topbar">
            <div>
              <div className="rs-eyebrow">
                <div className="rs-eyebrow-dot" />
                Search Results
              </div>
              <h2 className="rs-query-title">
                Results for{" "}
                <span className="rs-query-token">"{q}"</span>
              </h2>
              <div className="rs-meta-row">
                <span className="rs-meta-chip green">
                  ✦ {count} found
                </span>
                <span className="rs-meta-chip">
                  📏 within {max_radius_km} km
                </span>
                {lat && lon && (
                  <span className="rs-meta-chip">
                    📍 {Number(lat).toFixed(4)}, {Number(lon).toFixed(4)}
                  </span>
                )}
              </div>
            </div>
            <button className="rs-back-btn" onClick={() => navigate("/home")}>
              <span className="rs-back-arrow">←</span> New Search
            </button>
          </div>

          {/* Loading */}
          {loading && (
            <div className="rs-loading">
              <div className="rs-spinner-wrap">
                <div className="rs-spinner" />
                <div className="rs-spinner-core" />
              </div>
              <div className="rs-loading-text">
                Scanning database<span className="rs-loading-dots" />
              </div>
            </div>
          )}

          {/* Error */}
          {!loading && error && (
            <div className="rs-error">
              <span className="rs-error-icon">⚠️</span>
              <div className="rs-error-text">
                <span className="rs-error-label">System Error</span>
                {error}
              </div>
            </div>
          )}

          {/* Results */}
          {!loading && !error && (
            <div className="rs-table-card">
              {/* Toolbar */}
              <div className="rs-table-toolbar">
                <div className="rs-table-toolbar-left">
                  <span style={{ fontSize: "1rem" }}>🗂️</span>
                  <span className="rs-table-toolbar-title">Service Listings</span>
                  <div className="rs-toolbar-sep" />
                  <span className="rs-count-badge">{count} record{count !== 1 ? "s" : ""}</span>
                </div>
              </div>

              {results.length === 0 ? (
                <div className="rs-empty">
                  <span className="rs-empty-icon">🔭</span>
                  <div className="rs-empty-title">No results found</div>
                  <p className="rs-empty-sub">No records matched your criteria.<br />Try a broader query or wider radius.</p>
                </div>
              ) : (
                <>
                  {/* Column header */}
                  <div className="rs-thead">
                    <div className="rs-th">Entity Name</div>
                    <div className="rs-th">Category</div>
                    <div className="rs-th">Distance</div>
                    <div className="rs-th" style={{ textAlign: "right" }}>Actions</div>
                  </div>

                  {/* Rows */}
                  {results.map((r, i) => (
                    <div
                      key={r.business_id || `${r.latitude}-${r.longitude}`}
                      className="rs-row"
                      style={{ animationDelay: `${i * 0.045}s` }}
                    >
                      {/* Name */}
                      <div>
                        <div className="rs-row-name">{r.display_name || r.name}</div>
                        <span className="rs-row-cat-mobile">{r.categories_display || r.categories}</span>
                      </div>

                      {/* Category */}
                      <div className="rs-row-cat">
                        <div className="rs-cat-dot" />
                        {r.categories_display || r.categories}
                      </div>

                      {/* Distance */}
                      <div className="rs-row-dist">
                        <span className="rs-dist-badge">
                          {Number.isFinite(r.distance_km) ? `${r.distance_km} km` : "? km"}
                        </span>
                      </div>

                      {/* Actions */}
                      <div className="rs-row-actions">
                        <button
                          className="rs-btn rs-btn-map"
                          onClick={() => {
                            localStorage.setItem("last_shown_place", JSON.stringify(r));
                            navigate("/map");
                          }}
                        >
                          🗺️ Map
                        </button>
                        <button
                          className="rs-btn rs-btn-nav"
                          onClick={() => openGoogleMaps(r)}
                        >
                          🧭 Navigate
                        </button>
                      </div>
                    </div>
                  ))}
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
}