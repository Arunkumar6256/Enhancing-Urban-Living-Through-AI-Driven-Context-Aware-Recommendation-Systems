  // import React, { useState, useContext } from "react";
  // import { postLogin } from "../api";
  // import { useNavigate } from "react-router-dom";
  // import { AuthContext } from "../main"; // 🔥 IMPORT CONTEXT

  // export default function Login() {
  //   const nav = useNavigate();
  //   const { setToken } = useContext(AuthContext);   // 🔥 GET CONTEXT TOKEN SETTER

  //   const [username, setUsername] = useState("");
  //   const [password, setPassword] = useState("");
  //   const [err, setErr] = useState(null);
  //   const [loading, setLoading] = useState(false);

  //   async function submit(e) {
  //     e.preventDefault();
  //     setErr(null);
  //     setLoading(true);

  //     try {
  //       const data = await postLogin({ username, password });

  //       // 🔥 UPDATE BOTH React STATE + localStorage
  //       setToken(data.access_token);

  //       // 🔥 Navigate to home (reactive auth means router now allows it)
  //       nav("/home");
  //     } catch (e) {
  //       setErr(e?.message || "Login failed");
  //     } finally {
  //       setLoading(false);
  //     }
  //   }

  //   return (
  //     <div className="card fade-in-up" style={{ maxWidth: 420, margin: "0 auto" }}>
  //       <h2>Login</h2>

  //       {err && (
  //         <div style={{ background: "#fee2e2", padding: 8, borderRadius: 8, color: "#9b1c1c" }}>
  //           {err}
  //         </div>
  //       )}

  //       <form onSubmit={submit} style={{ display: "grid", gap: 10 }}>
  //         <input
  //           name="username"
  //           placeholder="Username"
  //           value={username}
  //           onChange={(e) => setUsername(e.target.value)}
  //         />

  //         <input
  //           name="password"
  //           type="password"
  //           placeholder="Password"
  //           value={password}
  //           onChange={(e) => setPassword(e.target.value)}
  //         />

  //         <div style={{ display: "flex", gap: 8, marginTop: 6 }}>
  //           <button className="btn" type="submit" disabled={loading}>
  //             {loading ? "Logging..." : "Login"}
  //           </button>

  //           <button type="button" className="btn-ghost" onClick={() => window.history.back()}>
  //             Back
  //           </button>
  //         </div>
  //       </form>
  //     </div>
  //   );
  // }
  // <div className="min-h-screen center bg-gradient-to-br from-sky-50 to-white">
  //   <div className="card fade-in-up" style={{maxWidth:420, width:"100%"}}>
  //     {/* existing form here */}
  //   </div>
  // </div>
import React, { useState, useContext } from "react";
import { postLogin } from "../api";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../main";

export default function Login() {
  const nav = useNavigate();
  const { setToken } = useContext(AuthContext);

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState(null);
  const [loading, setLoading] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setErr(null);
    setLoading(true);

    try {
      const data = await postLogin({ username, password });
      setToken(data.access_token);
      nav("/home");
    } catch (e) {
      setErr(e?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-bg">
      {/* animated background */}
      <div className="bg-blob blob-1"></div>
      <div className="bg-blob blob-2"></div>
      <div className="bg-blob blob-3"></div>

      {/* centered card */}
      <div className="auth-center">
        <div className="card fade-in-up auth-card glass">
          <h2 style={{ fontSize: 26, marginBottom: 12 }}>Login</h2>

          {err && (
            <div className="error-box">
              {err}
            </div>
          )}

          <form onSubmit={submit} className="form-grid">
            <input
              name="username"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />

            <input
              name="password"
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            <div className="auth-actions">
              <button className="btn" type="submit" disabled={loading}>
                {loading ? "Logging..." : "Login"}
              </button>

              <button
                type="button"
                className="btn-ghost"
                onClick={() => window.history.back()}
              >
                Back
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
