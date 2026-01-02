// // src/pages/AuthChoice.jsx
// import React from "react";
// import { Link } from "react-router-dom";

// export default function AuthChoice(){
//   return (
//     <div className="card fade-in-up" style={{display:"grid", gap:18}}>
//       <h2 style={{margin:0}}>Welcome</h2>
//       <p className="text-muted" style={{color:"#475569"}}>
//         Choose whether you already have an account or want to create a new one.
//       </p>

//       <div style={{display:"flex", gap:12}}>
//         <Link to="/login" className="btn" style={{flex:1, textAlign:"center"}}>Login</Link>
//         <Link to="/signup" className="btn-ghost" style={{flex:1, textAlign:"center"}}>Sign up</Link>
//       </div>
//     </div>
//   );
// }
// src/pages/AuthChoice.jsx
import React from "react";
import { Link } from "react-router-dom";

export default function AuthChoice(){
  return (
    <div className="auth-bg">
      {/* animated background shapes */}
      <div className="bg-blob blob-1"></div>
      <div className="bg-blob blob-2"></div>
      <div className="bg-blob blob-3"></div>

      {/* centered card */}
      <div className="auth-center">
        <div className="card fade-in-up auth-card">
          <h2 style={{ margin: 0, fontSize: 26, fontWeight: 800 }}>
            Welcome
          </h2>

          <p className="text-muted" style={{ color: "#475569", marginTop: 8 }}>
            Choose whether you already have an account or want to create a new one.
          </p>

          <div className="auth-actions">
            <Link
              to="/login"
              className="btn"
              style={{ flex: 1, textAlign: "center" }}
            >
              Login
            </Link>

            <Link
              to="/signup"
              className="btn-ghost"
              style={{ flex: 1, textAlign: "center" }}
            >
              Sign up
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
