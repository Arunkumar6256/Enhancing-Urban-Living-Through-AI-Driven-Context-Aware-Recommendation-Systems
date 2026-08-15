
// import React, { useState } from "react";
// import { useNavigate } from "react-router-dom";

// export default function IntentPage() {
//   const [q, setQ] = useState("");
//   const nav = useNavigate();

//   function proceed() {
//     if (!q.trim()) return;

//     const query = encodeURIComponent(q.trim().toLowerCase());
//     nav(`/results?query=${query}`);
//   }

//   return (
//     <div className="min-h-screen center">
//       <div className="card fade-in-up text-center">
//         <h2 className="text-xl font-bold mb-2">
//           What are you looking for today?
//         </h2>

//         <input
//           placeholder="e.g. hospital, park"
//           value={q}
//           onChange={(e) => setQ(e.target.value)}
//           onKeyDown={(e) => e.key === "Enter" && proceed()}
//         />

//         <p className="text-gray-600 mt-2">
//           Thank you for choosing <b>{q || "..."}</b>
//         </p>

//         <button
//           className="btn mt-3"
//           onClick={proceed}
//           disabled={!q.trim()}
//         >
//           Continue
//         </button>
//       </div>
//     </div>
//   );
// }
import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";

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
    --grid-line: rgba(56,130,210,0.06);
  }

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  .ip-root {
    font-family: var(--font-body);
    background: var(--bg); color: var(--text);
    min-height: 100vh;
    display: flex; align-items: center; justify-content: center;
    padding: 2rem 1.5rem;
    position: relative; overflow: hidden;
    transition: background 0.4s, color 0.4s;
  }
  .ip-root::before {
    content: '';
    position: fixed; inset: 0;
    background-image:
      linear-gradient(var(--grid-line) 1px, transparent 1px),
      linear-gradient(90deg, var(--grid-line) 1px, transparent 1px);
    background-size: 44px 44px;
    pointer-events: none; z-index: 0;
  }

  .ip-orb {
    position: fixed; border-radius: 50%;
    filter: blur(90px); pointer-events: none; z-index: 0; opacity: 0.11;
  }
  .ip-orb-1 { width: 460px; height: 460px; background: var(--primary); top: -160px; right: -120px; animation: orb-drift 16s ease-in-out infinite alternate; }
  .ip-orb-2 { width: 320px; height: 320px; background: var(--accent); bottom: -80px; left: -70px; animation: orb-drift 20s 5s ease-in-out infinite alternate; }
  [data-theme="light"] .ip-orb { opacity: 0.06; }
  @keyframes orb-drift {
    from { transform: translate(0,0) scale(1); }
    to   { transform: translate(30px,40px) scale(1.1); }
  }

  /* Toggle */
  .ip-toggle {
    position: fixed; top: 1.25rem; right: 1.5rem; z-index: 100;
    width: 48px; height: 26px;
    background: var(--bg-card); border: 1px solid var(--border);
    border-radius: 999px; cursor: pointer;
    display: flex; align-items: center; padding: 3px;
    box-shadow: 0 2px 12px rgba(0,0,0,0.2);
    transition: border-color 0.3s, box-shadow 0.3s;
  }
  .ip-toggle:hover { border-color: var(--border-hover); box-shadow: 0 0 0 3px var(--primary-dim); }
  .ip-toggle-knob {
    width: 18px; height: 18px; border-radius: 50%;
    background: var(--primary);
    transition: transform 0.35s cubic-bezier(.34,1.56,.64,1);
    display: flex; align-items: center; justify-content: center; font-size: 10px;
  }
  [data-theme="light"] .ip-toggle-knob { transform: translateX(22px); }

  /* ── Card ── */
  .ip-card {
    position: relative; z-index: 1;
    width: 100%; max-width: 520px;
    background: var(--bg-card);
    border: 1px solid var(--border);
    border-radius: 28px;
    padding: 3rem 2.5rem 2.5rem;
    box-shadow: 0 24px 80px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.04);
    text-align: center;
    animation: card-enter 0.65s cubic-bezier(.22,1,.36,1) both;
  }
  @keyframes card-enter {
    from { opacity:0; transform: translateY(28px) scale(0.97); }
    to   { opacity:1; transform: translateY(0) scale(1); }
  }

  /* Icon */
  .ip-icon-wrap {
    display: inline-flex; align-items: center; justify-content: center;
    position: relative; margin-bottom: 1.5rem;
    animation: fadeDown 0.5s 0.1s ease both;
  }
  .ip-icon-ring {
    position: absolute; width: 74px; height: 74px; border-radius: 50%;
    border: 1px solid var(--border-hover); background: var(--primary-dim);
    animation: ring-pulse 3s ease infinite;
  }
  .ip-icon-ring-2 {
    position: absolute; width: 96px; height: 96px; border-radius: 50%;
    border: 1px solid var(--border);
    animation: ring-pulse 3s 0.9s ease infinite;
  }
  @keyframes ring-pulse {
    0%,100% { transform: scale(1); opacity:1; }
    50%      { transform: scale(1.07); opacity:0.4; }
  }
  .ip-icon {
    position: relative; z-index: 1;
    width: 62px; height: 62px; border-radius: 50%;
    background: var(--primary-dim); border: 1px solid var(--border-hover);
    display: flex; align-items: center; justify-content: center;
    font-size: 1.7rem;
    transition: transform 0.35s cubic-bezier(.34,1.56,.64,1);
    animation: icon-float 4s ease-in-out infinite;
  }
  @keyframes icon-float {
    0%,100% { transform: translateY(0); }
    50%      { transform: translateY(-5px); }
  }

  /* Heading */
  .ip-title {
    font-family: var(--font-display);
    font-size: clamp(1.5rem, 3.5vw, 2rem);
    font-weight: 800; letter-spacing: -0.03em; line-height: 1.2;
    background: linear-gradient(135deg, var(--text) 0%, var(--primary) 65%, var(--accent) 100%);
    -webkit-background-clip: text; -webkit-text-fill-color: transparent;
    background-clip: text;
    animation: fadeDown 0.5s 0.15s ease both;
  }
  .ip-subtitle {
    margin-top: 0.55rem;
    font-size: 0.9rem; color: var(--text-muted); line-height: 1.6;
    animation: fadeDown 0.5s 0.2s ease both;
  }

  /* Quick chips */
  .ip-chips {
    display: flex; flex-wrap: wrap; gap: 8px;
    justify-content: center;
    margin-top: 1.75rem;
    animation: fadeUp 0.5s 0.25s ease both;
  }
  .ip-chip {
    font-family: var(--font-display);
    font-size: 0.76rem; font-weight: 700;
    letter-spacing: 0.05em;
    padding: 5px 13px;
    border-radius: 999px;
    background: var(--bg-card2);
    border: 1px solid var(--border);
    color: var(--text-mid);
    cursor: pointer;
    transition: border-color 0.2s, color 0.2s, background 0.2s, transform 0.2s;
    display: flex; align-items: center; gap: 5px;
  }
  .ip-chip:hover {
    border-color: var(--border-hover);
    color: var(--primary);
    background: var(--primary-dim);
    transform: translateY(-2px);
  }
  .ip-chip.active {
    border-color: var(--primary);
    color: var(--primary);
    background: var(--primary-dim);
    box-shadow: 0 0 0 1px var(--primary-dim);
  }

  /* Input */
  .ip-input-wrap {
    position: relative; margin-top: 1.5rem;
    animation: fadeUp 0.5s 0.3s ease both;
  }
  .ip-input-icon {
    position: absolute; left: 14px; top: 50%; transform: translateY(-50%);
    font-size: 1rem; opacity: 0.4; pointer-events: none;
    transition: opacity 0.2s;
  }
  .ip-input-wrap:focus-within .ip-input-icon { opacity: 1; }

  .ip-input {
    width: 100%;
    background: var(--bg-card2);
    border: 1px solid var(--border);
    border-radius: 14px;
    padding: 0.85rem 1rem 0.85rem 2.6rem;
    font-family: var(--font-body);
    font-size: 1rem; color: var(--text);
    outline: none;
    transition: border-color 0.25s, box-shadow 0.25s, background 0.25s;
  }
  .ip-input::placeholder { color: var(--text-muted); }
  .ip-input:focus {
    border-color: var(--primary);
    box-shadow: 0 0 0 3px var(--primary-dim);
    background: var(--bg-card);
  }

  /* Preview tag */
  .ip-preview {
    margin-top: 0.85rem;
    min-height: 26px;
    display: flex; align-items: center; justify-content: center;
    gap: 6px;
    font-size: 0.82rem; color: var(--text-muted);
    animation: fadeUp 0.4s 0.35s ease both;
  }
  .ip-preview-tag {
    display: inline-flex; align-items: center; gap: 5px;
    background: var(--primary-dim);
    border: 1px solid var(--border-hover);
    color: var(--primary);
    font-family: var(--font-display);
    font-size: 0.78rem; font-weight: 700;
    letter-spacing: 0.04em;
    padding: 3px 10px; border-radius: 999px;
    animation: tag-pop 0.3s cubic-bezier(.34,1.56,.64,1) both;
  }
  @keyframes tag-pop {
    from { transform: scale(0.7); opacity: 0; }
    to   { transform: scale(1); opacity: 1; }
  }

  /* Submit */
  .ip-submit-wrap { margin-top: 1.5rem; animation: fadeUp 0.5s 0.4s ease both; }
  .ip-submit {
    width: 100%;
    font-family: var(--font-display);
    font-size: 0.95rem; font-weight: 700; letter-spacing: 0.03em;
    padding: 0.9rem 1.5rem;
    border-radius: 14px; border: none; cursor: pointer;
    background: var(--primary); color: #fff;
    box-shadow: 0 4px 20px var(--primary-glow);
    display: flex; align-items: center; justify-content: center; gap: 8px;
    transition: transform 0.2s, box-shadow 0.2s, opacity 0.2s, background 0.2s;
    position: relative; overflow: hidden;
  }
  .ip-submit:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 10px 30px var(--primary-glow);
  }
  .ip-submit:active:not(:disabled) { transform: scale(0.97); }
  .ip-submit:disabled {
    opacity: 0.38; cursor: not-allowed;
    box-shadow: none; background: var(--text-muted);
  }
  .ip-submit::after {
    content:'';
    position: absolute; top:0; left:-75%;
    width:50%; height:100%;
    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.18), transparent);
    transform: skewX(-20deg);
    animation: shimmer 3.5s 1.5s ease infinite;
  }
  .ip-submit:disabled::after { display: none; }
  @keyframes shimmer {
    0%      { left:-75%; }
    60%,100%{ left:125%; }
  }
  .ip-arrow { transition: transform 0.25s cubic-bezier(.34,1.56,.64,1); }
  .ip-submit:hover:not(:disabled) .ip-arrow { transform: translateX(5px); }

  @keyframes fadeDown {
    from { opacity:0; transform: translateY(-14px); }
    to   { opacity:1; transform: translateY(0); }
  }
  @keyframes fadeUp {
    from { opacity:0; transform: translateY(14px); }
    to   { opacity:1; transform: translateY(0); }
  }
`;

const QUICK = [
  { label: "Hospital",   emoji: "🏥" },
  { label: "Police",     emoji: "🚔" },
  { label: "Pharmacy",   emoji: "💊" },
  { label: "Transport",  emoji: "🚌" },
  { label: "Government", emoji: "🏛️" },
  { label: "Education",  emoji: "🎓" },
];

export default function IntentPage() {
  const [q, setQ] = useState("");
  const [theme, setTheme] = useState("dark");
  const rootRef = useRef(null);
  const inputRef = useRef(null);
  const nav = useNavigate();

  useEffect(() => {
    if (rootRef.current) rootRef.current.setAttribute("data-theme", theme);
  }, [theme]);

  function proceed() {
    if (!q.trim()) return;
    nav(`/results?query=${encodeURIComponent(q.trim().toLowerCase())}`);
  }

  function pickChip(label) {
    setQ(label.toLowerCase());
    inputRef.current?.focus();
  }

  return (
    <>
      <style>{STYLES}</style>
      <div className="ip-root" ref={rootRef} data-theme={theme}>
        <div className="ip-orb ip-orb-1" />
        <div className="ip-orb ip-orb-2" />

        {/* Theme toggle */}
        <button className="ip-toggle" onClick={() => setTheme(t => t === "dark" ? "light" : "dark")} aria-label="Toggle theme">
          <div className="ip-toggle-knob">{theme === "dark" ? "🌙" : "☀️"}</div>
        </button>

        <div className="ip-card">
          {/* Icon */}
          <div className="ip-icon-wrap">
            <div className="ip-icon-ring-2" />
            <div className="ip-icon-ring" />
            <div className="ip-icon">🔍</div>
          </div>

          {/* Heading */}
          <h2 className="ip-title">What are you looking<br />for today?</h2>
          <p className="ip-subtitle">Search for any city service, or pick a quick category below.</p>

          {/* Quick-pick chips */}
          <div className="ip-chips">
            {QUICK.map(({ label, emoji }) => (
              <button
                key={label}
                className={`ip-chip${q.toLowerCase() === label.toLowerCase() ? " active" : ""}`}
                onClick={() => pickChip(label)}
              >
                <span>{emoji}</span> {label}
              </button>
            ))}
          </div>

          {/* Input */}
          <div className="ip-input-wrap">
            <span className="ip-input-icon">✏️</span>
            <input
              ref={inputRef}
              className="ip-input"
              placeholder="e.g. hospital, park, fire station…"
              value={q}
              onChange={e => setQ(e.target.value)}
              onKeyDown={e => e.key === "Enter" && proceed()}
            />
          </div>

          {/* Live preview */}
          <div className="ip-preview">
            {q.trim() ? (
              <>
                <span>Searching for</span>
                <span className="ip-preview-tag" key={q.trim()}>
                  🔍 {q.trim()}
                </span>
              </>
            ) : (
              <span>Start typing or pick a category above</span>
            )}
          </div>

          {/* CTA */}
          <div className="ip-submit-wrap">
            <button className="ip-submit" onClick={proceed} disabled={!q.trim()}>
              Find Services <span className="ip-arrow">→</span>
            </button>
          </div>
        </div>
      </div>
    </>
  );
}