// import React, { useState, useEffect } from "react";
// import MapView from "../components/MapView";

// export default function MapPage() {
//   const [userCoords, setUserCoords] = useState(null);
//   const [selectedPlace, setSelectedPlace] = useState(null);
//   const [places, setPlaces] = useState([]);

//   // Load last selected place
//   useEffect(() => {
//     const raw = localStorage.getItem("last_shown_place");
//     if (!raw) return;

//     try {
//       const place = JSON.parse(raw);
//       setPlaces((prev) => {
//         const exists = prev.some(
//           (x) =>
//             (x.business_id &&
//               place.business_id &&
//               x.business_id === place.business_id) ||
//             x.display_name === place.display_name
//         );
//         if (exists) return prev;
//         return [place, ...prev];
//       });
//       setSelectedPlace(place);
//     } catch {
//       /* ignore */
//     }
//   }, []);

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

//   function handleLocation(coords) {
//     setUserCoords(coords);
//     localStorage.setItem("user_coords", JSON.stringify(coords));
//   }

//   function handleSelectPlace(place) {
//     setSelectedPlace(place);
//     localStorage.setItem("last_shown_place", JSON.stringify(place));
//   }

//   return (
//     <div className="card p-4">
//       <h2 className="text-2xl font-bold mb-4 font-heading">
//         City Map
//       </h2>

//       <MapView
//         onLocation={handleLocation}
//         userCoords={userCoords}
//         places={places}
//         selectedPlace={selectedPlace}
//         onSelectPlace={handleSelectPlace}
//       />
//     </div>
//   );
// }



import React, { useState, useEffect, useRef } from "react";
import MapView from "../components/MapView";

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
    --text: #0f172a;
    --text-muted: #64748b;
    --text-mid: #475569;
    --success: #059669;
    --success-dim: rgba(5,150,105,0.08);
    --grid-line: rgba(56,130,210,0.06);
  }

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  .mp-root {
    font-family: var(--font-body);
    background: var(--bg); color: var(--text);
    min-height: 100vh;
    padding: 2rem 1.5rem 4rem;
    position: relative; overflow-x: hidden;
    transition: background 0.4s, color 0.4s;
  }
  .mp-root::before {
    content: '';
    position: fixed; inset: 0;
    background-image:
      linear-gradient(var(--grid-line) 1px, transparent 1px),
      linear-gradient(90deg, var(--grid-line) 1px, transparent 1px);
    background-size: 44px 44px;
    pointer-events: none; z-index: 0;
  }

  .mp-orb {
    position: fixed; border-radius: 50%;
    filter: blur(100px); pointer-events: none; z-index: 0; opacity: 0.09;
  }
  .mp-orb-1 { width: 500px; height: 500px; background: var(--primary); top: -160px; right: -120px; animation: orb-drift 18s ease-in-out infinite alternate; }
  .mp-orb-2 { width: 350px; height: 350px; background: var(--accent); bottom: -80px; left: -80px; animation: orb-drift 22s 5s ease-in-out infinite alternate; }
  [data-theme="light"] .mp-orb { opacity: 0.05; }
  @keyframes orb-drift {
    from { transform: translate(0,0) scale(1); }
    to   { transform: translate(35px,45px) scale(1.1); }
  }

  /* Theme toggle */
  .mp-toggle {
    position: fixed; top: 1.25rem; right: 1.5rem; z-index: 100;
    width: 48px; height: 26px;
    background: var(--bg-card); border: 1px solid var(--border);
    border-radius: 999px; cursor: pointer;
    display: flex; align-items: center; padding: 3px;
    box-shadow: 0 2px 12px rgba(0,0,0,0.2);
    transition: border-color 0.3s, box-shadow 0.3s;
  }
  .mp-toggle:hover { border-color: var(--border-hover); box-shadow: 0 0 0 3px var(--primary-dim); }
  .mp-toggle-knob {
    width: 18px; height: 18px; border-radius: 50%;
    background: var(--primary);
    transition: transform 0.35s cubic-bezier(.34,1.56,.64,1);
    display: flex; align-items: center; justify-content: center; font-size: 10px;
  }
  [data-theme="light"] .mp-toggle-knob { transform: translateX(22px); }

  /* ── Page layout ── */
  .mp-inner { position: relative; z-index: 1; max-width: 1200px; margin: 0 auto; }

  /* ── Page header ── */
  .mp-header {
    display: flex; align-items: flex-end; justify-content: space-between;
    flex-wrap: wrap; gap: 1rem;
    margin-bottom: 1.75rem;
    animation: fadeDown 0.55s 0.05s ease both;
  }
  .mp-header-left {}
  .mp-eyebrow {
    display: inline-flex; align-items: center; gap: 6px;
    font-size: 0.68rem; font-weight: 600; letter-spacing: 0.12em; text-transform: uppercase;
    color: var(--primary); background: var(--primary-dim);
    border: 1px solid var(--border-hover); border-radius: 999px;
    padding: 4px 12px; margin-bottom: 0.6rem;
  }
  .mp-eyebrow-dot {
    width: 5px; height: 5px; border-radius: 50%;
    background: var(--primary); box-shadow: 0 0 5px var(--primary);
    animation: pulse-dot 2s ease infinite;
  }
  @keyframes pulse-dot {
    0%,100% { opacity:1; transform:scale(1); }
    50%      { opacity:0.4; transform:scale(0.6); }
  }
  .mp-title {
    font-family: var(--font-display);
    font-size: clamp(1.7rem, 3.5vw, 2.4rem);
    font-weight: 800; letter-spacing: -0.03em; line-height: 1.1;
    background: linear-gradient(135deg, var(--text) 0%, var(--primary) 65%);
    -webkit-background-clip: text; -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  /* Status pills */
  .mp-status-row {
    display: flex; align-items: center; gap: 8px; flex-wrap: wrap;
  }
  .mp-pill {
    display: inline-flex; align-items: center; gap: 6px;
    font-size: 0.75rem; font-weight: 600; letter-spacing: 0.04em;
    padding: 5px 12px; border-radius: 999px;
    border: 1px solid var(--border);
    background: var(--bg-card2); color: var(--text-muted);
    transition: border-color 0.25s, color 0.25s;
  }
  .mp-pill.active {
    border-color: var(--success);
    color: var(--success);
    background: var(--success-dim);
  }
  .mp-pill.places {
    border-color: var(--border-hover);
    color: var(--primary);
    background: var(--primary-dim);
  }
  .mp-pill-dot {
    width: 6px; height: 6px; border-radius: 50%;
    background: currentColor;
  }
  .mp-pill.active .mp-pill-dot {
    box-shadow: 0 0 5px var(--success);
    animation: pulse-dot 2s ease infinite;
  }

  /* ── Map card ── */
  .mp-map-card {
    background: var(--bg-card);
    border: 1px solid var(--border);
    border-radius: 24px;
    overflow: hidden;
    box-shadow: 0 12px 48px rgba(0,0,0,0.22), inset 0 1px 0 rgba(255,255,255,0.04);
    transition: border-color 0.3s;
    animation: fadeUp 0.6s 0.15s ease both;
  }
  .mp-map-card:hover { border-color: var(--border-hover); }

  /* Map toolbar */
  .mp-toolbar {
    display: flex; align-items: center; justify-content: space-between;
    flex-wrap: wrap; gap: 10px;
    padding: 1rem 1.4rem;
    border-bottom: 1px solid var(--border);
    background: var(--bg-card2);
  }
  .mp-toolbar-left {
    display: flex; align-items: center; gap: 10px;
  }
  .mp-toolbar-title {
    font-family: var(--font-display);
    font-size: 0.82rem; font-weight: 700;
    letter-spacing: 0.06em; text-transform: uppercase;
    color: var(--text-mid);
  }
  .mp-toolbar-sep {
    width: 1px; height: 18px;
    background: var(--border);
  }
  .mp-coords-badge {
    display: flex; align-items: center; gap: 6px;
    font-size: 0.76rem; font-family: 'DM Mono', monospace;
    color: var(--text-muted);
    background: var(--bg-card);
    border: 1px solid var(--border);
    border-radius: 8px; padding: 3px 10px;
  }
  .mp-coords-val { color: var(--text-mid); font-weight: 500; }

  /* Selected place banner */
  .mp-selected-banner {
    display: flex; align-items: center; gap: 10px;
    padding: 0.7rem 1.4rem;
    background: var(--primary-dim);
    border-bottom: 1px solid var(--border-hover);
    font-size: 0.83rem; color: var(--primary);
    animation: slideDown 0.35s ease both;
  }
  .mp-selected-icon { font-size: 1rem; }
  .mp-selected-name { font-family: var(--font-display); font-weight: 700; flex: 1; }
  .mp-selected-type { font-size: 0.72rem; color: var(--text-muted); background: var(--bg-card2); border: 1px solid var(--border); border-radius: 6px; padding: 2px 8px; }
  @keyframes slideDown {
    from { opacity:0; transform: translateY(-8px); }
    to   { opacity:1; transform: translateY(0); }
  }

  /* Map container */
  .mp-map-body {
    position: relative;
    min-height: 520px;
  }
  .mp-map-body > * { border-radius: 0 !important; }

  /* Empty state */
  .mp-empty {
    position: absolute; inset: 0;
    display: flex; flex-direction: column; align-items: center; justify-content: center;
    gap: 10px; pointer-events: none;
    color: var(--text-muted); font-size: 0.88rem;
  }
  .mp-empty-icon {
    font-size: 2.5rem;
    animation: float-icon 4s ease-in-out infinite;
  }
  @keyframes float-icon {
    0%,100% { transform: translateY(0); }
    50%      { transform: translateY(-8px); }
  }

  /* ── Side info strip (below map on mobile, beside on lg) ── */
  .mp-info-row {
    display: grid; grid-template-columns: 1fr;
    gap: 12px; margin-top: 1.25rem;
    animation: fadeUp 0.6s 0.25s ease both;
  }
  @media(min-width: 700px) { .mp-info-row { grid-template-columns: repeat(3, 1fr); } }

  .mp-info-chip {
    background: var(--bg-card);
    border: 1px solid var(--border);
    border-radius: 16px; padding: 1rem 1.2rem;
    display: flex; align-items: center; gap: 12px;
    transition: border-color 0.25s, transform 0.25s;
  }
  .mp-info-chip:hover { border-color: var(--border-hover); transform: translateY(-2px); }
  .mp-info-chip-icon {
    width: 40px; height: 40px; border-radius: 12px;
    background: var(--primary-dim); border: 1px solid var(--border-hover);
    display: flex; align-items: center; justify-content: center;
    font-size: 1.2rem; flex-shrink: 0;
  }
  .mp-info-chip-text { flex: 1; min-width: 0; }
  .mp-info-chip-label { font-size: 0.7rem; font-weight: 600; letter-spacing: 0.08em; text-transform: uppercase; color: var(--text-muted); }
  .mp-info-chip-val { font-family: var(--font-display); font-size: 0.9rem; font-weight: 700; color: var(--text); margin-top: 2px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }

  @keyframes fadeDown {
    from { opacity:0; transform: translateY(-14px); }
    to   { opacity:1; transform: translateY(0); }
  }
  @keyframes fadeUp {
    from { opacity:0; transform: translateY(16px); }
    to   { opacity:1; transform: translateY(0); }
  }
`;

export default function MapPage() {
  const [userCoords, setUserCoords] = useState(null);
  const [selectedPlace, setSelectedPlace] = useState(null);
  const [places, setPlaces] = useState([]);
  const [theme, setTheme] = useState("dark");
  const rootRef = useRef(null);

  useEffect(() => {
    if (rootRef.current) rootRef.current.setAttribute("data-theme", theme);
  }, [theme]);

  // Load last selected place
  useEffect(() => {
    const raw = localStorage.getItem("last_shown_place");
    if (!raw) return;
    try {
      const place = JSON.parse(raw);
      setPlaces(prev => {
        const exists = prev.some(
          x => (x.business_id && place.business_id && x.business_id === place.business_id)
            || x.display_name === place.display_name
        );
        return exists ? prev : [place, ...prev];
      });
      setSelectedPlace(place);
    } catch { /* ignore */ }
  }, []);

  // Load stored user location
  useEffect(() => {
    const raw = localStorage.getItem("user_coords");
    if (!raw) return;
    try {
      const coords = JSON.parse(raw);
      if (coords?.lat && coords?.lon) setUserCoords(coords);
    } catch { /* ignore */ }
  }, []);

  function handleLocation(coords) {
    setUserCoords(coords);
    localStorage.setItem("user_coords", JSON.stringify(coords));
  }

  function handleSelectPlace(place) {
    setSelectedPlace(place);
    localStorage.setItem("last_shown_place", JSON.stringify(place));
  }

  const coordsLabel = userCoords
    ? `${userCoords.lat.toFixed(4)}, ${userCoords.lon.toFixed(4)}`
    : "Not set";

  const placeName = selectedPlace?.display_name?.split(",")[0] || "None";
  const placeType = selectedPlace?.category || selectedPlace?.type || null;

  return (
    <>
      <style>{STYLES}</style>
      <div className="mp-root" ref={rootRef} data-theme={theme}>
        <div className="mp-orb mp-orb-1" />
        <div className="mp-orb mp-orb-2" />

        {/* Theme toggle */}
        <button className="mp-toggle" onClick={() => setTheme(t => t === "dark" ? "light" : "dark")} aria-label="Toggle theme">
          <div className="mp-toggle-knob">{theme === "dark" ? "🌙" : "☀️"}</div>
        </button>

        <div className="mp-inner">
          {/* Header */}
          <div className="mp-header">
            <div className="mp-header-left">
              <div className="mp-eyebrow">
                <div className="mp-eyebrow-dot" />
                Live City Map
              </div>
              <h2 className="mp-title">City Map</h2>
            </div>
            <div className="mp-status-row">
              <div className={`mp-pill${userCoords ? " active" : ""}`}>
                <div className="mp-pill-dot" />
                {userCoords ? "Location Active" : "No Location"}
              </div>
              {places.length > 0 && (
                <div className="mp-pill places">
                  <div className="mp-pill-dot" />
                  {places.length} place{places.length !== 1 ? "s" : ""} loaded
                </div>
              )}
            </div>
          </div>

          {/* Map card */}
          <div className="mp-map-card">
            {/* Toolbar */}
            <div className="mp-toolbar">
              <div className="mp-toolbar-left">
                <span style={{ fontSize: "1rem" }}>🗺️</span>
                <span className="mp-toolbar-title">Interactive Map</span>
                <div className="mp-toolbar-sep" />
                <div className="mp-coords-badge">
                  <span>📍</span>
                  <span className="mp-coords-val">{coordsLabel}</span>
                </div>
              </div>
            </div>

            {/* Selected place banner */}
            {selectedPlace && (
              <div className="mp-selected-banner" key={selectedPlace.display_name}>
                <span className="mp-selected-icon">📌</span>
                <span className="mp-selected-name">{placeName}</span>
                {placeType && <span className="mp-selected-type">{placeType}</span>}
              </div>
            )}

            {/* Map body */}
            <div className="mp-map-body">
              <MapView
                onLocation={handleLocation}
                userCoords={userCoords}
                places={places}
                selectedPlace={selectedPlace}
                onSelectPlace={handleSelectPlace}
              />
            </div>
          </div>

          {/* Info chips */}
          <div className="mp-info-row">
            <div className="mp-info-chip">
              <div className="mp-info-chip-icon">📡</div>
              <div className="mp-info-chip-text">
                <div className="mp-info-chip-label">Your Coords</div>
                <div className="mp-info-chip-val">{coordsLabel}</div>
              </div>
            </div>
            <div className="mp-info-chip">
              <div className="mp-info-chip-icon">📌</div>
              <div className="mp-info-chip-text">
                <div className="mp-info-chip-label">Selected Place</div>
                <div className="mp-info-chip-val">{placeName}</div>
              </div>
            </div>
            <div className="mp-info-chip">
              <div className="mp-info-chip-icon">🏙️</div>
              <div className="mp-info-chip-text">
                <div className="mp-info-chip-label">Places Loaded</div>
                <div className="mp-info-chip-val">{places.length} marker{places.length !== 1 ? "s" : ""}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
