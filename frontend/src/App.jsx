// import React from "react";
// import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

// import Header from "./components/Header";
// import Intro from "./pages/Intro";
// import AuthChoice from "./pages/AuthChoice";
// import Login from "./pages/Login";
// import Signup from "./pages/SignUp";
// import Home from "./pages/Home";
// import IntentPage from "./pages/IntentPage";
// import RecommendPage from "./pages/RecommendPage";
// import Results from "./pages/Results";
// import MapPage from "./pages/MapPage";
// import ServiceDetail from "./pages/ServiceDetail";

// export default function App() {
//   return (
//     <Router>
//       <div className="min-h-screen bg-slate-50 text-slate-900">
//         {/* Global Header */}
//         <Header />

//         {/* Main Content */}
//         <main className="max-w-6xl mx-auto px-4 py-6">
//           <Routes>
//             <Route path="/" element={<Intro />} />
//             <Route path="/auth-choice" element={<AuthChoice />} />
//             <Route path="/login" element={<Login />} />
//             <Route path="/signup" element={<Signup />} />

//             <Route path="/home" element={<Home />} />
//             <Route path="/intent" element={<IntentPage />} />
//             <Route path="/recommend" element={<RecommendPage />} />
//             <Route path="/results" element={<Results />} />
//             <Route path="/map" element={<MapPage />} />

//             <Route path="/service/:id" element={<ServiceDetail />} />
//           </Routes>
//         </main>
//       </div>
//     </Router>
//   );
// }
import React, { useState, useEffect, createContext, useContext } from "react";
import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";

import Header from "./components/Header";
import Intro from "./pages/Intro";
import AuthChoice from "./pages/AuthChoice";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Home from "./pages/Home";
import IntentPage from "./pages/IntentPage";
import RecommendPage from "./pages/RecommendPage";
import Results from "./pages/Results";
import MapPage from "./pages/MapPage";
import ServiceDetail from "./pages/ServiceDetail";

// ─── Global theme context ─────────────────────────────────────────────────────
export const ThemeContext = createContext({ theme: "dark", setTheme: () => {} });

// ─── Routes that render their own full-page layout (no header overlay) ────────
const STANDALONE_ROUTES = ["/", "/auth-choice", "/login", "/signup"];

// ─── Global styles ────────────────────────────────────────────────────────────
const GLOBAL_STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:ital,wght@0,300;0,400;0,500;1,300&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

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
    --header-h: 64px;
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

  html, body {
    font-family: 'DM Sans', sans-serif;
    background: var(--bg);
    color: var(--text);
    transition: background 0.4s, color 0.4s;
    scroll-behavior: smooth;
    -webkit-font-smoothing: antialiased;
  }

  /* Scrollbar */
  ::-webkit-scrollbar { width: 6px; }
  ::-webkit-scrollbar-track { background: var(--bg); }
  ::-webkit-scrollbar-thumb { background: var(--border-hover); border-radius: 3px; }
  ::-webkit-scrollbar-thumb:hover { background: var(--primary); }

  /* ── App shell ── */
  .app-shell {
    min-height: 100vh;
    background: var(--bg);
    position: relative;
    transition: background 0.4s;
  }

  /* Persistent grid bg */
  .app-shell::before {
    content: '';
    position: fixed; inset: 0;
    background-image:
      linear-gradient(var(--grid-line) 1px, transparent 1px),
      linear-gradient(90deg, var(--grid-line) 1px, transparent 1px);
    background-size: 44px 44px;
    pointer-events: none; z-index: 0;
  }

  /* Ambient orbs — always present, subtle */
  .app-orb {
    position: fixed; border-radius: 50%;
    filter: blur(110px); pointer-events: none; z-index: 0;
    opacity: 0.07;
    transition: opacity 0.4s;
  }
  .app-orb-1 {
    width: 500px; height: 500px;
    background: var(--primary);
    top: -160px; right: -120px;
    animation: orb-drift-1 18s ease-in-out infinite alternate;
  }
  .app-orb-2 {
    width: 360px; height: 360px;
    background: var(--accent);
    bottom: -80px; left: -80px;
    animation: orb-drift-2 22s ease-in-out infinite alternate;
  }
  [data-theme="light"] .app-orb { opacity: 0.04; }

  @keyframes orb-drift-1 {
    from { transform: translate(0,0) scale(1); }
    to   { transform: translate(40px,50px) scale(1.12); }
  }
  @keyframes orb-drift-2 {
    from { transform: translate(0,0) scale(1); }
    to   { transform: translate(-30px,-40px) scale(1.08); }
  }

  /* ── Navbar ── */
  .app-nav {
    position: fixed; top: 0; left: 0; right: 0;
    height: var(--header-h);
    z-index: 50;
    background: rgba(11, 15, 26, 0.75);
    backdrop-filter: blur(18px) saturate(160%);
    -webkit-backdrop-filter: blur(18px) saturate(160%);
    border-bottom: 1px solid var(--border);
    display: flex; align-items: center;
    transition: background 0.4s, border-color 0.3s;
  }
  [data-theme="light"] .app-nav {
    background: rgba(240, 244, 252, 0.82);
  }
  .app-nav-inner {
    max-width: 1200px; width: 100%; margin: 0 auto;
    padding: 0 1.5rem;
    display: flex; align-items: center; justify-content: space-between;
    position: relative; z-index: 1;
  }

  /* Logo */
  .app-logo {
    display: flex; align-items: center; gap: 10px;
    text-decoration: none;
    user-select: none;
  }
  .app-logo-icon {
    width: 34px; height: 34px; border-radius: 10px;
    background: var(--primary-dim); border: 1px solid var(--border-hover);
    display: flex; align-items: center; justify-content: center;
    font-size: 1.1rem;
    transition: transform 0.3s cubic-bezier(.34,1.56,.64,1);
  }
  .app-logo:hover .app-logo-icon { transform: scale(1.12) rotate(-8deg); }
  .app-logo-text {
    font-family: var(--font-display);
    font-size: 1rem; font-weight: 800; letter-spacing: -0.02em;
    background: linear-gradient(135deg, var(--text) 0%, var(--primary) 70%);
    -webkit-background-clip: text; -webkit-text-fill-color: transparent;
    background-clip: text;
  }
  .app-logo-dot {
    width: 5px; height: 5px; border-radius: 50%;
    background: var(--primary); box-shadow: 0 0 6px var(--primary);
    animation: pulse-dot 2s ease infinite; margin-left: 2px;
  }
  @keyframes pulse-dot {
    0%,100% { opacity:1; transform:scale(1); }
    50%      { opacity:0.4; transform:scale(0.6); }
  }

  /* Nav links */
  .app-nav-links {
    display: none;
    align-items: center; gap: 4px;
  }
  @media(min-width: 640px) { .app-nav-links { display: flex; } }

  .app-nav-link {
    font-family: var(--font-display);
    font-size: 0.78rem; font-weight: 700; letter-spacing: 0.05em;
    text-transform: uppercase; text-decoration: none;
    color: var(--text-muted);
    padding: 5px 12px; border-radius: 8px;
    transition: color 0.2s, background 0.2s;
    position: relative;
  }
  .app-nav-link:hover { color: var(--primary); background: var(--primary-dim); }
  .app-nav-link.active { color: var(--primary); background: var(--primary-dim); }
  .app-nav-link.active::after {
    content: '';
    position: absolute; bottom: -1px; left: 50%; transform: translateX(-50%);
    width: 16px; height: 2px; border-radius: 1px;
    background: var(--primary);
  }

  /* Nav right */
  .app-nav-right { display: flex; align-items: center; gap: 8px; }

  /* Theme toggle */
  .app-theme-toggle {
    width: 44px; height: 24px;
    background: var(--bg-card); border: 1px solid var(--border);
    border-radius: 999px; cursor: pointer;
    display: flex; align-items: center; padding: 3px;
    box-shadow: 0 2px 10px rgba(0,0,0,0.15);
    transition: border-color 0.3s, box-shadow 0.3s;
  }
  .app-theme-toggle:hover { border-color: var(--border-hover); box-shadow: 0 0 0 3px var(--primary-dim); }
  .app-theme-knob {
    width: 16px; height: 16px; border-radius: 50%;
    background: var(--primary);
    transition: transform 0.35s cubic-bezier(.34,1.56,.64,1);
    display: flex; align-items: center; justify-content: center; font-size: 9px;
  }
  [data-theme="light"] .app-theme-knob { transform: translateX(20px); }

  /* ── Page wrapper ── */
  .app-main {
    position: relative; z-index: 1;
    min-height: 100vh;
  }
  .app-main.with-header {
    padding-top: var(--header-h);
  }
  .app-content {
    max-width: 1200px; margin: 0 auto;
    padding: 2rem 1.5rem 5rem;
  }

  /* ── Page transitions ── */
  .page-transition {
    animation: page-enter 0.45s cubic-bezier(.22,1,.36,1) both;
  }
  @keyframes page-enter {
    from { opacity:0; transform: translateY(14px); }
    to   { opacity:1; transform: translateY(0); }
  }

  /* ── Route separator line ── */
  .app-breadcrumb {
    display: flex; align-items: center; gap: 8px;
    padding: 0.6rem 0 1.25rem;
    font-size: 0.72rem; font-weight: 600;
    letter-spacing: 0.08em; text-transform: uppercase;
    color: var(--text-muted);
    animation: fadeIn 0.4s ease both;
  }
  .app-breadcrumb-sep { color: var(--border-hover); }
  .app-breadcrumb-current { color: var(--primary); }
  @keyframes fadeIn { from { opacity:0; } to { opacity:1; } }

  /* ── Mobile nav menu ── */
  .app-mobile-menu-btn {
    display: flex; align-items: center; justify-content: center;
    width: 36px; height: 36px; border-radius: 10px;
    background: var(--bg-card); border: 1px solid var(--border);
    cursor: pointer; font-size: 1rem;
    transition: border-color 0.2s; color: var(--text-mid);
  }
  .app-mobile-menu-btn:hover { border-color: var(--border-hover); color: var(--primary); }
  @media(min-width: 640px) { .app-mobile-menu-btn { display: none; } }

  .app-mobile-menu {
    position: fixed; top: var(--header-h); left: 0; right: 0; z-index: 49;
    background: var(--bg-card);
    border-bottom: 1px solid var(--border);
    padding: 1rem 1.5rem;
    display: flex; flex-direction: column; gap: 6px;
    animation: slideDown 0.3s ease both;
    box-shadow: 0 8px 30px rgba(0,0,0,0.2);
  }
  @keyframes slideDown {
    from { opacity:0; transform: translateY(-10px); }
    to   { opacity:1; transform: translateY(0); }
  }
  .app-mobile-link {
    font-family: var(--font-display);
    font-size: 0.88rem; font-weight: 700; letter-spacing: 0.04em;
    text-transform: uppercase; text-decoration: none;
    color: var(--text-muted); padding: 0.65rem 0.9rem; border-radius: 10px;
    display: flex; align-items: center; gap: 8px;
    transition: background 0.2s, color 0.2s;
  }
  .app-mobile-link:hover { background: var(--primary-dim); color: var(--primary); }
`;

const NAV_LINKS = [
  { to: "/home",      label: "Home",      icon: "🏠" },
  { to: "/recommend", label: "Services",  icon: "🔍" },
  { to: "/map",       label: "Map",       icon: "🗺️" },
  { to: "/intent",    label: "Search",    icon: "💡" },
];

// Route label map for breadcrumb
const ROUTE_LABELS = {
  "/": "Intro", "/auth-choice": "Portal", "/login": "Sign In",
  "/signup": "Register", "/home": "Home", "/intent": "Search",
  "/recommend": "Services", "/results": "Results",
  "/map": "City Map", "/service": "Service Detail",
};

// ─── Inner app (needs router context) ────────────────────────────────────────
function AppInner() {
  const location = useLocation();
  const { theme, setTheme } = useContext(ThemeContext);
  const [mobileOpen, setMobileOpen] = useState(false);

  const isStandalone = STANDALONE_ROUTES.includes(location.pathname);
  const routeKey = "/" + location.pathname.split("/")[1];
  const routeLabel = ROUTE_LABELS[routeKey] || "Page";

  // Close mobile menu on route change
  useEffect(() => { setMobileOpen(false); }, [location.pathname]);

  // Apply theme to <html>
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  return (
    <div className="app-shell" data-theme={theme}>
      {/* Ambient orbs */}
      <div className="app-orb app-orb-1" />
      <div className="app-orb app-orb-2" />

      {/* ── Navbar (only on non-standalone routes) ── */}
      {!isStandalone && (
        <>
          <nav className="app-nav">
            <div className="app-nav-inner">
              {/* Logo */}
              <a href="/home" className="app-logo">
                <div className="app-logo-icon">🏙️</div>
                <span className="app-logo-text">SmartCity</span>
                <div className="app-logo-dot" />
              </a>

              {/* Desktop nav links */}
              <div className="app-nav-links">
                {NAV_LINKS.map(({ to, label }) => (
                  <a
                    key={to}
                    href={to}
                    className={`app-nav-link${location.pathname === to ? " active" : ""}`}
                  >
                    {label}
                  </a>
                ))}
              </div>

              {/* Right side */}
              <div className="app-nav-right">
                {/* Theme toggle */}
                <button
                  className="app-theme-toggle"
                  onClick={() => setTheme(t => t === "dark" ? "light" : "dark")}
                  aria-label="Toggle theme"
                >
                  <div className="app-theme-knob">{theme === "dark" ? "🌙" : "☀️"}</div>
                </button>

                {/* Mobile menu button */}
                <button
                  className="app-mobile-menu-btn"
                  onClick={() => setMobileOpen(v => !v)}
                  aria-label="Menu"
                >
                  {mobileOpen ? "✕" : "☰"}
                </button>
              </div>
            </div>
          </nav>

          {/* Mobile dropdown */}
          {mobileOpen && (
            <div className="app-mobile-menu">
              {NAV_LINKS.map(({ to, label, icon }) => (
                <a key={to} href={to} className="app-mobile-link">
                  <span>{icon}</span> {label}
                </a>
              ))}
            </div>
          )}
        </>
      )}

      {/* ── Main content ── */}
      <main className={`app-main${!isStandalone ? " with-header" : ""}`}>
        {!isStandalone && (
          <div className="app-content">
            {/* Breadcrumb */}
            <div className="app-breadcrumb">
              <span>SmartCity</span>
              <span className="app-breadcrumb-sep">›</span>
              <span className="app-breadcrumb-current">{routeLabel}</span>
            </div>

            {/* Routed page with transition */}
            <div className="page-transition" key={location.pathname}>
              <Routes>
                <Route path="/home"      element={<Home />} />
                <Route path="/intent"    element={<IntentPage />} />
                <Route path="/recommend" element={<RecommendPage />} />
                <Route path="/results"   element={<Results />} />
                <Route path="/map"       element={<MapPage />} />
                <Route path="/service/:id" element={<ServiceDetail />} />
              </Routes>
            </div>
          </div>
        )}

        {/* Standalone pages (own full-page layout) */}
        {isStandalone && (
          <div className="page-transition" key={location.pathname}>
            <Routes>
              <Route path="/"           element={<Intro />} />
              <Route path="/auth-choice" element={<AuthChoice />} />
              <Route path="/login"      element={<Login />} />
              <Route path="/signup"     element={<Signup />} />
            </Routes>
          </div>
        )}
      </main>
    </div>
  );
}

// ─── Root ─────────────────────────────────────────────────────────────────────
export default function App() {
  const [theme, setTheme] = useState("dark");

  return (
    <>
      <style>{GLOBAL_STYLES}</style>
      <ThemeContext.Provider value={{ theme, setTheme }}>
        <Router>
          <AppInner />
        </Router>
      </ThemeContext.Provider>
    </>
  );
}