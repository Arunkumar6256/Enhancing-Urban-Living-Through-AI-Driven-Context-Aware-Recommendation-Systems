// src/main.jsx
import React, { useState, useEffect } from "react";
import { createRoot } from "react-dom/client";
import {
  BrowserRouter,
  Routes,
  Route,
  Link,
  Navigate,
} from "react-router-dom";

import Intro from "./pages/Intro";
import AuthChoice from "./pages/AuthChoice";
import Signup from "./pages/Signup";
import Login from "./pages/Login";
import Home from "./pages/Home";
import MapPage from "./pages/MapPage";
import RecommendPage from "./pages/RecommendPage";
import Results from "./pages/Results";

import "./index.css";

/* ===============================
   AUTH CONTEXT
================================ */
export const AuthContext = React.createContext({
  token: null,
  setToken: () => {},
});

/* ===============================
   GLOBAL CLICK PARTICLES
================================ */
function enableClickParticles() {
  document.addEventListener("click", (e) => {
    for (let i = 0; i < 8; i++) {
      const p = document.createElement("div");
      p.className = "particle";

      const angle = Math.random() * Math.PI * 2;
      const distance = Math.random() * 40 + 10;

      p.style.left = `${e.clientX}px`;
      p.style.top = `${e.clientY}px`;
      p.style.setProperty("--dx", `${Math.cos(angle) * distance}px`);
      p.style.setProperty("--dy", `${Math.sin(angle) * distance}px`);

      document.body.appendChild(p);
      setTimeout(() => p.remove(), 700);
    }
  });
}

/* ===============================
   APP ROUTER
================================ */
function AppRouter() {
  // init token once
  const [token, setToken] = useState(() =>
    localStorage.getItem("access_token")
  );

  /* Sync auth across tabs */
  useEffect(() => {
    function onStorage(e) {
      if (e.key === "access_token") {
        setToken(e.newValue);
      }
    }
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  /* Enable particles once */
  useEffect(() => {
    enableClickParticles();
  }, []);

  /* Auth setter */
  const setAuthToken = (t) => {
    if (t) {
      localStorage.setItem("access_token", t);
      setToken(t);
    } else {
      localStorage.removeItem("access_token");
      setToken(null);
    }
  };

  return (
    <AuthContext.Provider value={{ token, setToken: setAuthToken }}>
      <BrowserRouter>
        <div className="container">
          {/* ================= HEADER ================= */}
          <header className="header">
            <div className="logo">SmartCity • Recommender</div>

            <nav style={{ display: "flex", gap: 12, alignItems: "center" }}>
              <Link to="/intro" className="link-small">
                Intro
              </Link>
              <Link to="/home" className="link-small">
                Home
              </Link>
              <Link to="/map" className="link-small">
                Map
              </Link>
              <Link to="/recommend" className="link-small">
                Recommend
              </Link>

              {token ? (
                <button
                  className="btn-ghost"
                  onClick={() => {
                    setAuthToken(null);
                    window.location.href = "/";
                  }}
                >
                  Logout
                </button>
              ) : (
                <Link to="/auth-choice" className="btn-ghost">
                  Sign in / Sign up
                </Link>
              )}
            </nav>
          </header>

          {/* ================= ROUTES ================= */}
          <Routes>
            <Route path="/" element={<Navigate to="/intro" replace />} />
            <Route path="/intro" element={<Intro />} />
            <Route path="/auth-choice" element={<AuthChoice />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/login" element={<Login />} />

            {/* Protected Home */}
            <Route
              path="/home"
              element={token ? <Home /> : <Navigate to="/auth-choice" replace />}
            />

            <Route path="/map" element={<MapPage />} />
            <Route path="/recommend" element={<RecommendPage />} />
            <Route path="/results" element={<Results />} />

            <Route
              path="*"
              element={
                <div className="glass-card fade-in-up">
                  <h3>Page not found</h3>
                </div>
              }
            />
          </Routes>
        </div>
      </BrowserRouter>
    </AuthContext.Provider>
  );
}

/* ===============================
   RENDER
================================ */
createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <AppRouter />
  </React.StrictMode>
);
