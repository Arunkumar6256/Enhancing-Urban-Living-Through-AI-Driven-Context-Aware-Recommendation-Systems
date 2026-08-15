// import React from "react";
// import { Link } from "react-router-dom";

// export default function AuthChoice() {
//   return (
//     <div className="min-h-[80vh] flex items-center justify-center p-4">
//       <div className="card w-full max-w-md text-center">
//         {/* Icon */}
//         <div className="mb-6 flex justify-center">
//           <div className="w-16 h-16 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center text-3xl mb-2">
//             🏛️
//           </div>
//         </div>

//         <h2 className="text-2xl font-bold mb-2 font-heading">Citizen Portal</h2>
//         <p className="text-[var(--text-muted)] mb-8">
//           Access smart city services, recommendations, and tracking.
//         </p>

//         <div className="flex flex-col gap-4">
//           <Link
//             to="/login"
//             className="btn w-full py-3 text-lg no-underline"
//           >
//             Sign In
//           </Link>

//           <div className="relative my-2">
//             <div className="absolute inset-0 flex items-center">
//               <div className="w-full border-t border-[var(--border)]"></div>
//             </div>
//             <div className="relative flex justify-center text-xs uppercase">
//               <span className="bg-[var(--bg-secondary)] px-2 text-[var(--text-muted)]">
//                 New User?
//               </span>
//             </div>
//           </div>

//           <Link
//             to="/signup"
//             className="btn w-full py-3 text-base no-underline"
//             style={{
//               backgroundColor: 'transparent',
//               border: '1px solid var(--border)',
//               color: 'var(--text-main)'
//             }}
//           >
//             Create New Account
//           </Link>
//         </div>

//         <div className="text-center mt-8 text-sm text-[var(--text-muted)]">
//           Official Smart City Administration © 2026
//         </div>
//       </div>
//     </div>
//   );
// }
import React, { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";

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

  .ac-root {
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

  .ac-root::before {
    content: '';
    position: fixed; inset: 0;
    background-image:
      linear-gradient(var(--grid-line) 1px, transparent 1px),
      linear-gradient(90deg, var(--grid-line) 1px, transparent 1px);
    background-size: 44px 44px;
    pointer-events: none; z-index: 0;
  }

  .ac-orb {
    position: fixed; border-radius: 50%;
    filter: blur(90px); pointer-events: none; z-index: 0;
    opacity: 0.12;
    animation: orb-drift 16s ease-in-out infinite alternate;
  }
  .ac-orb-1 { width: 420px; height: 420px; background: var(--primary); top: -140px; right: -100px; }
  .ac-orb-2 { width: 320px; height: 320px; background: var(--accent); bottom: -80px; left: -70px; animation-delay: 6s; animation-duration: 20s; }
  [data-theme="light"] .ac-orb { opacity: 0.06; }

  @keyframes orb-drift {
    from { transform: translate(0,0) scale(1); }
    to   { transform: translate(35px,45px) scale(1.1); }
  }

  /* Theme toggle */
  .ac-toggle {
    position: fixed; top: 1.25rem; right: 1.5rem; z-index: 100;
    width: 48px; height: 26px;
    background: var(--bg-card); border: 1px solid var(--border);
    border-radius: 999px; cursor: pointer;
    display: flex; align-items: center; padding: 3px;
    transition: border-color 0.3s, box-shadow 0.3s;
    box-shadow: 0 2px 12px rgba(0,0,0,0.2);
  }
  .ac-toggle:hover { border-color: var(--border-hover); box-shadow: 0 0 0 3px var(--primary-dim); }
  .ac-toggle-knob {
    width: 18px; height: 18px; border-radius: 50%;
    background: var(--primary);
    transition: transform 0.35s cubic-bezier(.34,1.56,.64,1);
    display: flex; align-items: center; justify-content: center; font-size: 10px;
  }
  [data-theme="light"] .ac-toggle-knob { transform: translateX(22px); }

  /* ── Card ── */
  .ac-card {
    position: relative; z-index: 1;
    width: 100%; max-width: 420px;
    background: var(--bg-card);
    border: 1px solid var(--border);
    border-radius: 28px;
    padding: 2.75rem 2.25rem 2.25rem;
    box-shadow: 0 24px 80px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.04);
    animation: card-enter 0.65s cubic-bezier(.22,1,.36,1) both;
    text-align: center;
  }
  @keyframes card-enter {
    from { opacity:0; transform: translateY(28px) scale(0.97); }
    to   { opacity:1; transform: translateY(0) scale(1); }
  }

  /* Glow ring behind icon */
  .ac-icon-wrap {
    position: relative;
    display: inline-flex;
    align-items: center; justify-content: center;
    margin-bottom: 1.75rem;
    animation: fadeDown 0.5s 0.15s ease both;
  }
  .ac-icon-ring {
    position: absolute;
    width: 80px; height: 80px;
    border-radius: 50%;
    background: var(--primary-dim);
    border: 1px solid var(--border-hover);
    animation: ring-pulse 3s ease infinite;
  }
  .ac-icon-ring-2 {
    position: absolute;
    width: 100px; height: 100px;
    border-radius: 50%;
    border: 1px solid var(--border);
    animation: ring-pulse 3s 0.8s ease infinite;
  }
  @keyframes ring-pulse {
    0%,100% { transform: scale(1); opacity:1; }
    50%      { transform: scale(1.08); opacity:0.5; }
  }
  .ac-icon {
    position: relative; z-index: 1;
    width: 64px; height: 64px;
    background: var(--primary-dim);
    border: 1px solid var(--border-hover);
    border-radius: 50%;
    display: flex; align-items: center; justify-content: center;
    font-size: 1.75rem;
    transition: transform 0.35s cubic-bezier(.34,1.56,.64,1);
  }
  .ac-icon:hover { transform: scale(1.12) rotate(-8deg); }

  /* Badge */
  .ac-badge {
    display: inline-flex; align-items: center; gap: 6px;
    font-size: 0.68rem; font-weight: 600;
    letter-spacing: 0.12em; text-transform: uppercase;
    color: var(--primary);
    background: var(--primary-dim);
    border: 1px solid var(--border-hover);
    border-radius: 999px; padding: 4px 12px;
    margin-bottom: 0.85rem;
    animation: fadeDown 0.5s 0.2s ease both;
  }
  .ac-badge-dot {
    width: 5px; height: 5px; border-radius: 50%;
    background: var(--primary);
    box-shadow: 0 0 5px var(--primary);
    animation: pulse-dot 2s ease infinite;
  }
  @keyframes pulse-dot {
    0%,100% { opacity:1; transform:scale(1); }
    50%      { opacity:0.4; transform:scale(0.6); }
  }

  .ac-title {
    font-family: var(--font-display);
    font-size: 1.9rem; font-weight: 800;
    letter-spacing: -0.03em; line-height: 1.1;
    background: linear-gradient(135deg, var(--text) 0%, var(--primary) 70%);
    -webkit-background-clip: text; -webkit-text-fill-color: transparent;
    background-clip: text;
    animation: fadeDown 0.5s 0.25s ease both;
  }
  .ac-sub {
    margin-top: 0.65rem;
    font-size: 0.93rem; line-height: 1.65;
    color: var(--text-muted);
    animation: fadeDown 0.5s 0.3s ease both;
  }

  /* Buttons */
  .ac-buttons { display: flex; flex-direction: column; gap: 12px; margin-top: 2rem; }

  .ac-btn {
    font-family: var(--font-display);
    font-size: 0.92rem; font-weight: 700;
    letter-spacing: 0.03em;
    padding: 0.85rem 1.5rem;
    border-radius: 14px;
    cursor: pointer; border: none;
    display: flex; align-items: center; justify-content: center;
    gap: 8px;
    text-decoration: none;
    transition: transform 0.2s, box-shadow 0.2s;
    position: relative; overflow: hidden;
  }
  .ac-btn:active { transform: scale(0.97) !important; }

  .ac-btn-primary {
    background: var(--primary); color: #fff;
    box-shadow: 0 4px 20px var(--primary-glow);
    animation: fadeUp 0.5s 0.35s ease both;
  }
  .ac-btn-primary:hover { transform: translateY(-3px); box-shadow: 0 10px 30px var(--primary-glow); }
  .ac-btn-primary::after {
    content:'';
    position:absolute; top:0; left:-75%;
    width:50%; height:100%;
    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.18), transparent);
    transform: skewX(-20deg);
    animation: shimmer 3.5s 1s ease infinite;
  }
  @keyframes shimmer {
    0%      { left: -75%; }
    60%,100%{ left: 125%; }
  }

  .ac-btn-ghost {
    background: var(--bg-card2); color: var(--text);
    border: 1px solid var(--border);
    animation: fadeUp 0.5s 0.45s ease both;
  }
  .ac-btn-ghost:hover {
    transform: translateY(-3px);
    border-color: var(--border-hover);
    box-shadow: 0 6px 20px rgba(0,0,0,0.15);
    color: var(--primary);
  }

  .btn-arrow {
    display: inline-block;
    transition: transform 0.25s cubic-bezier(.34,1.56,.64,1);
  }
  .ac-btn:hover .btn-arrow { transform: translateX(5px); }

  /* Divider */
  .ac-divider {
    display: flex; align-items: center; gap: 10px;
    animation: fadeUp 0.5s 0.4s ease both;
  }
  .ac-divider::before, .ac-divider::after {
    content:''; flex:1; height:1px; background: var(--border);
  }
  .ac-divider span {
    font-size: 0.68rem; font-weight: 600;
    letter-spacing: 0.12em; text-transform: uppercase;
    color: var(--text-muted);
  }

  /* Footer */
  .ac-footer {
    margin-top: 2rem; padding-top: 1.5rem;
    border-top: 1px solid var(--border);
    font-size: 0.75rem; color: var(--text-muted);
    letter-spacing: 0.03em;
    animation: fadeUp 0.5s 0.5s ease both;
    display: flex; align-items: center; justify-content: center; gap: 6px;
  }
  .ac-footer-dot { width: 3px; height: 3px; border-radius: 50%; background: var(--text-muted); }

  @keyframes fadeDown {
    from { opacity:0; transform: translateY(-14px); }
    to   { opacity:1; transform: translateY(0); }
  }
  @keyframes fadeUp {
    from { opacity:0; transform: translateY(14px); }
    to   { opacity:1; transform: translateY(0); }
  }
`;

export default function AuthChoice() {
  const [theme, setTheme] = useState("dark");
  const rootRef = useRef(null);

  useEffect(() => {
    if (rootRef.current) rootRef.current.setAttribute("data-theme", theme);
  }, [theme]);

  return (
    <>
      <style>{STYLES}</style>
      <div className="ac-root" ref={rootRef} data-theme={theme}>
        <div className="ac-orb ac-orb-1" />
        <div className="ac-orb ac-orb-2" />

        {/* Theme toggle */}
        <button className="ac-toggle" onClick={() => setTheme(t => t === "dark" ? "light" : "dark")} aria-label="Toggle theme">
          <div className="ac-toggle-knob">{theme === "dark" ? "🌙" : "☀️"}</div>
        </button>

        <div className="ac-card">
          {/* Icon */}
          <div className="ac-icon-wrap">
            <div className="ac-icon-ring-2" />
            <div className="ac-icon-ring" />
            <div className="ac-icon">🏛️</div>
          </div>

          {/* Badge */}
          <div className="ac-badge">
            <div className="ac-badge-dot" />
            Official Portal
          </div>

          {/* Heading */}
          <h2 className="ac-title">Citizen Portal</h2>
          <p className="ac-sub">
            Access smart city services, recommendations,<br />and real-time tracking.
          </p>

          {/* Buttons */}
          <div className="ac-buttons">
            <Link to="/login" className="ac-btn ac-btn-primary">
              Sign In <span className="btn-arrow">→</span>
            </Link>

            <div className="ac-divider"><span>New here?</span></div>

            <Link to="/signup" className="ac-btn ac-btn-ghost">
              Create New Account <span className="btn-arrow">→</span>
            </Link>
          </div>

          {/* Footer */}
          <div className="ac-footer">
            <span>Smart City Administration</span>
            <div className="ac-footer-dot" />
            <span>© 2026</span>
          </div>
        </div>
      </div>
    </>
  );
}