// import React, { useState, useEffect } from "react";
// import { createRoot } from "react-dom/client";
// import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

// import Intro from "./pages/Intro";
// import AuthChoice from "./pages/AuthChoice";
// import Signup from "./pages/Signup";
// import Login from "./pages/Login";
// import Home from "./pages/Home";
// import MapPage from "./pages/MapPage";
// import RecommendPage from "./pages/RecommendPage";
// import Results from "./pages/Results";
// import Header from "./components/Header";

// import "./index.css";
// import { ThemeProvider } from "./utils/ThemeContext";
// import { AuthContext } from "./utils/AuthContext";

// function Layout({ children }) {
//   return (
//     <div className="min-h-screen flex flex-col">
//       <Header />
//       <main className="flex-1 w-full max-w-6xl mx-auto px-4 py-8">
//         {children}
//       </main>
//     </div>
//   );
// }

// function AppRouter() {
//   const [token, setToken] = useState(() => localStorage.getItem("access_token"));

//   useEffect(() => {
//     function onStorage(e) {
//       if (e.key === "access_token") setToken(e.newValue);
//     }
//     window.addEventListener("storage", onStorage);
//     return () => window.removeEventListener("storage", onStorage);
//   }, []);

//   const setAuthToken = (t) => {
//     if (t) {
//       localStorage.setItem("access_token", t);
//       setToken(t);
//     } else {
//       localStorage.removeItem("access_token");
//       setToken(null);
//     }
//   };

//   return (
//     <AuthContext.Provider value={{ token, setToken: setAuthToken }}>
//       <ThemeProvider>
//         <BrowserRouter>
//           <Layout>
//             <Routes>
//               <Route path="/" element={<Navigate to="/intro" replace />} />
//               <Route path="/intro" element={<Intro />} />
//               <Route path="/auth-choice" element={<AuthChoice />} />
//               <Route path="/signup" element={<Signup />} />
//               <Route path="/login" element={<Login />} />

//               <Route
//                 path="/home"
//                 element={token ? <Home /> : <Navigate to="/auth-choice" replace />}
//               />

//               <Route path="/map" element={<MapPage />} />
//               <Route path="/recommend" element={<RecommendPage />} />
//               <Route path="/results" element={<Results />} />
//               <Route path="*" element={<Navigate to="/" replace />} />
//             </Routes>
//           </Layout>
//         </BrowserRouter>
//       </ThemeProvider>
//     </AuthContext.Provider>
//   );
// }

// createRoot(document.getElementById("root")).render(
//   <React.StrictMode>
//     <AppRouter />
//   </React.StrictMode>
// );


import React, { useState, useEffect } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Intro from "./pages/Intro";
import AuthChoice from "./pages/AuthChoice";
import Signup from "./pages/Signup";
import Login from "./pages/Login";
import Home from "./pages/Home";
import MapPage from "./pages/MapPage";
import RecommendPage from "./pages/RecommendPage";
import Results from "./pages/Results";
import Header from "./components/Header";

import "./index.css";
import { ThemeProvider } from "./utils/ThemeContext";
import { AuthContext } from "./utils/AuthContext";

/* ---------------- Protected Layout ---------------- */
function ProtectedLayout({ children }) {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 w-full max-w-6xl mx-auto px-4 py-8">
        {children}
      </main>
    </div>
  );
}

function AppRouter() {
  const [token, setToken] = useState(() =>
    localStorage.getItem("access_token")
  );

  useEffect(() => {
    function onStorage(e) {
      if (e.key === "access_token") setToken(e.newValue);
    }
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

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
      <ThemeProvider>
        <BrowserRouter>
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<Navigate to="/intro" replace />} />
            <Route path="/intro" element={<Intro />} />
            <Route path="/auth-choice" element={<AuthChoice />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/login" element={<Login />} />

            {/* Protected routes */}
            <Route
              path="/home"
              element={
                token ? (
                  <ProtectedLayout>
                    <Home />
                  </ProtectedLayout>
                ) : (
                  <Navigate to="/auth-choice" replace />
                )
              }
            />

            <Route
              path="/map"
              element={
                token ? (
                  <ProtectedLayout>
                    <MapPage />
                  </ProtectedLayout>
                ) : (
                  <Navigate to="/auth-choice" replace />
                )
              }
            />

            <Route
              path="/recommend"
              element={
                token ? (
                  <ProtectedLayout>
                    <RecommendPage />
                  </ProtectedLayout>
                ) : (
                  <Navigate to="/auth-choice" replace />
                )
              }
            />

            <Route
              path="/results"
              element={
                token ? (
                  <ProtectedLayout>
                    <Results />
                  </ProtectedLayout>
                ) : (
                  <Navigate to="/auth-choice" replace />
                )
              }
            />

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/intro" replace />} />
          </Routes>
        </BrowserRouter>
      </ThemeProvider>
    </AuthContext.Provider>
  );
}

createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <AppRouter />
  </React.StrictMode>
);
