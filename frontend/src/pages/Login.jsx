// import React, { useState, useContext } from "react";
// import { postLogin } from "../api";
// import { useNavigate, Link } from "react-router-dom";
// import { AuthContext } from "../utils/AuthContext";

// export default function Login() {
//   const nav = useNavigate();
//   const { setToken } = useContext(AuthContext);

//   const [username, setUsername] = useState("");
//   const [password, setPassword] = useState("");
//   const [err, setErr] = useState(null);
//   const [loading, setLoading] = useState(false);

//   async function submit(e) {
//     e.preventDefault();
//     if (loading) return;

//     setErr(null);
//     setLoading(true);

//     try {
//       const data = await postLogin({
//         username: username.trim(),
//         password: password.trim(),
//       });

//       setToken(data.access_token);
//       nav("/home");
//     } catch (e) {
//       const msg =
//         e?.data?.detail ||
//         e?.message ||
//         "Invalid username or password.";
//       setErr(msg);
//     } finally {
//       setLoading(false);
//     }
//   }

//   return (
//     <div className="min-h-[80vh] flex items-center justify-center p-4">
//       <div className="card w-full max-w-md page-enter">
//         <div className="text-center mb-6">
//           <h2 className="text-2xl font-bold text-[var(--text-main)]">
//             Sign In
//           </h2>
//           <p className="text-[var(--text-muted)] text-sm mt-1">
//             Access your Smart City dashboard
//           </p>
//         </div>

//         {err && (
//           <div className="bg-red-50 border border-red-200 text-red-600 p-3 rounded mb-6 text-sm">
//             {err}
//           </div>
//         )}

//         <form onSubmit={submit} className="flex flex-col gap-5">
//           <div>
//             <label className="input-label">Username</label>
//             <input
//               name="username"
//               className="input-field"
//               placeholder="Enter your username"
//               value={username}
//               onChange={(e) => setUsername(e.target.value)}
//               required
//               autoFocus
//               disabled={loading}
//             />
//           </div>

//           <div>
//             <label className="input-label">Password</label>
//             <input
//               name="password"
//               type="password"
//               className="input-field"
//               placeholder="••••••••"
//               value={password}
//               onChange={(e) => setPassword(e.target.value)}
//               required
//               disabled={loading}
//             />
//           </div>

//           <div className="pt-2">
//             <button
//               className="btn w-full justify-center py-3"
//               type="submit"
//               disabled={loading}
//             >
//               {loading ? "Authenticating..." : "Login"}
//             </button>
//           </div>
//         </form>

//         <div className="mt-6 text-center pt-6 border-t border-[var(--border-color)]">
//           <p className="text-sm text-[var(--text-muted)]">
//             Don&apos;t have an account?{" "}
//             <Link
//               to="/signup"
//               className="text-[var(--primary)] font-medium hover:underline"
//             >
//               Create Account
//             </Link>
//           </p>

//           <div className="mt-2">
//             <Link
//               to="/auth-choice"
//               className="text-xs text-[var(--text-light)] hover:text-[var(--text-main)]"
//             >
//               &larr; Back to Selection
//             </Link>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }
import React, { useState, useContext, useRef, useEffect } from "react";
import { postLogin } from "../api";
import { useNavigate, Link } from "react-router-dom";
import { AuthContext } from "../utils/AuthContext";

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
    --text: #0f172a;
    --text-muted: #64748b;
    --text-mid: #475569;
    --danger: #dc2626;
    --danger-dim: rgba(220,38,38,0.07);
    --danger-border: rgba(220,38,38,0.25);
    --grid-line: rgba(56,130,210,0.06);
  }

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  .lg-root {
    font-family: var(--font-body);
    background: var(--bg);
    color: var(--text);
    min-height: 100vh;
    display: flex; align-items: center; justify-content: center;
    padding: 2rem 1.5rem;
    position: relative; overflow: hidden;
    transition: background 0.4s, color 0.4s;
  }
  .lg-root::before {
    content: '';
    position: fixed; inset: 0;
    background-image:
      linear-gradient(var(--grid-line) 1px, transparent 1px),
      linear-gradient(90deg, var(--grid-line) 1px, transparent 1px);
    background-size: 44px 44px;
    pointer-events: none; z-index: 0;
  }

  .lg-orb {
    position: fixed; border-radius: 50%;
    filter: blur(90px); pointer-events: none; z-index: 0; opacity: 0.11;
  }
  .lg-orb-1 { width: 440px; height: 440px; background: var(--primary); top: -150px; right: -110px; animation: orb-drift 16s ease-in-out infinite alternate; }
  .lg-orb-2 { width: 300px; height: 300px; background: var(--accent); bottom: -70px; left: -60px; animation: orb-drift 20s 5s ease-in-out infinite alternate; }
  [data-theme="light"] .lg-orb { opacity: 0.06; }
  @keyframes orb-drift {
    from { transform: translate(0,0) scale(1); }
    to   { transform: translate(30px,40px) scale(1.1); }
  }

  /* Toggle */
  .lg-toggle {
    position: fixed; top: 1.25rem; right: 1.5rem; z-index: 100;
    width: 48px; height: 26px;
    background: var(--bg-card); border: 1px solid var(--border);
    border-radius: 999px; cursor: pointer;
    display: flex; align-items: center; padding: 3px;
    transition: border-color 0.3s, box-shadow 0.3s;
    box-shadow: 0 2px 12px rgba(0,0,0,0.2);
  }
  .lg-toggle:hover { border-color: var(--border-hover); box-shadow: 0 0 0 3px var(--primary-dim); }
  .lg-toggle-knob {
    width: 18px; height: 18px; border-radius: 50%;
    background: var(--primary);
    transition: transform 0.35s cubic-bezier(.34,1.56,.64,1);
    display: flex; align-items: center; justify-content: center; font-size: 10px;
  }
  [data-theme="light"] .lg-toggle-knob { transform: translateX(22px); }

  /* ── Card ── */
  .lg-card {
    position: relative; z-index: 1;
    width: 100%; max-width: 420px;
    background: var(--bg-card);
    border: 1px solid var(--border);
    border-radius: 28px;
    padding: 2.75rem 2.25rem 2.25rem;
    box-shadow: 0 24px 80px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.04);
    animation: card-enter 0.65s cubic-bezier(.22,1,.36,1) both;
  }
  @keyframes card-enter {
    from { opacity:0; transform: translateY(28px) scale(0.97); }
    to   { opacity:1; transform: translateY(0) scale(1); }
  }

  /* Header */
  .lg-header {
    text-align: center; margin-bottom: 2rem;
    animation: fadeDown 0.5s 0.1s ease both;
  }
  .lg-icon-wrap {
    display: inline-flex; align-items: center; justify-content: center;
    position: relative; margin-bottom: 1.25rem;
  }
  .lg-icon-ring {
    position: absolute; width: 72px; height: 72px; border-radius: 50%;
    border: 1px solid var(--border-hover); background: var(--primary-dim);
    animation: ring-pulse 3s ease infinite;
  }
  .lg-icon-ring-2 {
    position: absolute; width: 92px; height: 92px; border-radius: 50%;
    border: 1px solid var(--border);
    animation: ring-pulse 3s 0.9s ease infinite;
  }
  @keyframes ring-pulse {
    0%,100% { transform: scale(1); opacity:1; }
    50%      { transform: scale(1.07); opacity:0.4; }
  }
  .lg-icon {
    position: relative; z-index: 1;
    width: 58px; height: 58px; border-radius: 50%;
    background: var(--primary-dim); border: 1px solid var(--border-hover);
    display: flex; align-items: center; justify-content: center;
    font-size: 1.6rem;
    transition: transform 0.35s cubic-bezier(.34,1.56,.64,1);
  }
  .lg-icon:hover { transform: scale(1.1) rotate(-8deg); }

  .lg-title {
    font-family: var(--font-display);
    font-size: 1.85rem; font-weight: 800;
    letter-spacing: -0.03em;
    background: linear-gradient(135deg, var(--text) 0%, var(--primary) 70%);
    -webkit-background-clip: text; -webkit-text-fill-color: transparent;
    background-clip: text;
  }
  .lg-subtitle {
    margin-top: 0.4rem;
    font-size: 0.88rem; color: var(--text-muted); line-height: 1.5;
  }

  /* Error */
  .lg-error {
    display: flex; align-items: flex-start; gap: 9px;
    background: var(--danger-dim);
    border: 1px solid var(--danger-border);
    border-radius: 12px;
    padding: 0.8rem 1rem;
    margin-bottom: 1.5rem;
    animation: shake 0.45s cubic-bezier(.36,.07,.19,.97) both;
  }
  .lg-error-icon { font-size: 1rem; flex-shrink: 0; margin-top: 1px; }
  .lg-error-text { font-size: 0.84rem; color: var(--danger); line-height: 1.5; }
  @keyframes shake {
    10%,90%  { transform: translateX(-2px); }
    20%,80%  { transform: translateX(4px); }
    30%,50%,70% { transform: translateX(-5px); }
    40%,60%  { transform: translateX(5px); }
    100%     { transform: translateX(0); }
  }

  /* Form */
  .lg-form { display: flex; flex-direction: column; gap: 1.1rem; }

  .lg-field {
    display: flex; flex-direction: column; gap: 6px;
    animation: fadeUp 0.5s ease both;
  }
  .lg-field:nth-child(1) { animation-delay: 0.2s; }
  .lg-field:nth-child(2) { animation-delay: 0.28s; }

  .lg-label {
    font-size: 0.75rem; font-weight: 600;
    letter-spacing: 0.09em; text-transform: uppercase;
    color: var(--text-muted);
    display: flex; align-items: center; gap: 6px;
  }

  .lg-input-wrap { position: relative; }
  .lg-input-icon {
    position: absolute; left: 13px; top: 50%; transform: translateY(-50%);
    font-size: 0.95rem; opacity: 0.5; pointer-events: none;
    transition: opacity 0.2s;
  }
  .lg-input-wrap:focus-within .lg-input-icon { opacity: 1; }

  .lg-input {
    width: 100%;
    background: var(--bg-card2);
    border: 1px solid var(--border);
    border-radius: 12px;
    padding: 0.75rem 1rem 0.75rem 2.5rem;
    font-family: var(--font-body);
    font-size: 0.95rem; color: var(--text);
    outline: none;
    transition: border-color 0.25s, box-shadow 0.25s, background 0.25s;
  }
  .lg-input::placeholder { color: var(--text-muted); }
  .lg-input:focus {
    border-color: var(--primary);
    box-shadow: 0 0 0 3px var(--primary-dim);
    background: var(--bg-card);
  }
  .lg-input:disabled { opacity: 0.5; cursor: not-allowed; }

  /* Password toggle */
  .lg-pw-toggle {
    position: absolute; right: 12px; top: 50%; transform: translateY(-50%);
    background: none; border: none; cursor: pointer;
    color: var(--text-muted); font-size: 0.85rem; padding: 2px 4px;
    border-radius: 6px; transition: color 0.2s, background 0.2s;
    display: flex; align-items: center;
  }
  .lg-pw-toggle:hover { color: var(--primary); background: var(--primary-dim); }

  /* Submit */
  .lg-submit-wrap { padding-top: 0.5rem; animation: fadeUp 0.5s 0.35s ease both; }
  .lg-submit {
    width: 100%;
    font-family: var(--font-display);
    font-size: 0.95rem; font-weight: 700; letter-spacing: 0.03em;
    padding: 0.9rem 1.5rem;
    border-radius: 14px; border: none; cursor: pointer;
    background: var(--primary); color: #fff;
    box-shadow: 0 4px 20px var(--primary-glow);
    display: flex; align-items: center; justify-content: center; gap: 8px;
    transition: transform 0.2s, box-shadow 0.2s, opacity 0.2s;
    position: relative; overflow: hidden;
  }
  .lg-submit:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 10px 30px var(--primary-glow); }
  .lg-submit:active:not(:disabled) { transform: scale(0.97); }
  .lg-submit:disabled { opacity: 0.65; cursor: not-allowed; }
  .lg-submit::after {
    content:'';
    position: absolute; top:0; left:-75%;
    width:50%; height:100%;
    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.18), transparent);
    transform: skewX(-20deg);
    animation: shimmer 3.5s 1.5s ease infinite;
  }
  .lg-submit:disabled::after { display: none; }
  @keyframes shimmer {
    0%      { left:-75%; }
    60%,100%{ left:125%; }
  }

  /* Spinner */
  .lg-spinner {
    width: 16px; height: 16px;
    border: 2px solid rgba(255,255,255,0.3);
    border-top-color: #fff;
    border-radius: 50%;
    animation: spin 0.7s linear infinite;
  }
  @keyframes spin { to { transform: rotate(360deg); } }

  /* Submit arrow */
  .lg-arrow { transition: transform 0.25s cubic-bezier(.34,1.56,.64,1); }
  .lg-submit:hover:not(:disabled) .lg-arrow { transform: translateX(5px); }

  /* Footer */
  .lg-footer {
    margin-top: 1.75rem; padding-top: 1.5rem;
    border-top: 1px solid var(--border);
    text-align: center;
    display: flex; flex-direction: column; gap: 10px;
    animation: fadeUp 0.5s 0.42s ease both;
  }
  .lg-footer-text { font-size: 0.84rem; color: var(--text-muted); }
  .lg-link {
    color: var(--primary); font-weight: 600;
    text-decoration: none; transition: opacity 0.2s;
  }
  .lg-link:hover { opacity: 0.75; text-decoration: underline; }
  .lg-back {
    display: inline-flex; align-items: center; gap: 5px;
    font-size: 0.78rem; color: var(--text-muted);
    text-decoration: none; transition: color 0.2s;
  }
  .lg-back:hover { color: var(--primary); }
  .lg-back-arrow { transition: transform 0.2s; }
  .lg-back:hover .lg-back-arrow { transform: translateX(-3px); }

  @keyframes fadeDown {
    from { opacity:0; transform: translateY(-14px); }
    to   { opacity:1; transform: translateY(0); }
  }
  @keyframes fadeUp {
    from { opacity:0; transform: translateY(14px); }
    to   { opacity:1; transform: translateY(0); }
  }
`;

export default function Login() {
  const nav = useNavigate();
  const { setToken } = useContext(AuthContext);

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [err, setErr] = useState(null);
  const [loading, setLoading] = useState(false);
  const [theme, setTheme] = useState("dark");
  const rootRef = useRef(null);

  useEffect(() => {
    if (rootRef.current) rootRef.current.setAttribute("data-theme", theme);
  }, [theme]);

  async function submit(e) {
    e.preventDefault();
    if (loading) return;
    setErr(null);
    setLoading(true);
    try {
      const data = await postLogin({ username: username.trim(), password: password.trim() });
      setToken(data.access_token);
      nav("/home");
    } catch (e) {
      setErr(e?.data?.detail || e?.message || "Invalid username or password.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <style>{STYLES}</style>
      <div className="lg-root" ref={rootRef} data-theme={theme}>
        <div className="lg-orb lg-orb-1" />
        <div className="lg-orb lg-orb-2" />

        {/* Theme toggle */}
        <button className="lg-toggle" onClick={() => setTheme(t => t === "dark" ? "light" : "dark")} aria-label="Toggle theme">
          <div className="lg-toggle-knob">{theme === "dark" ? "🌙" : "☀️"}</div>
        </button>

        <div className="lg-card">
          {/* Header */}
          <div className="lg-header">
            <div className="lg-icon-wrap">
              <div className="lg-icon-ring-2" />
              <div className="lg-icon-ring" />
              <div className="lg-icon">🔑</div>
            </div>
            <h2 className="lg-title">Welcome Back</h2>
            <p className="lg-subtitle">Sign in to your Smart City dashboard</p>
          </div>

          {/* Error */}
          {err && (
            <div className="lg-error" key={err}>
              <span className="lg-error-icon">⚠️</span>
              <span className="lg-error-text">{err}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={submit} className="lg-form">
            <div className="lg-field">
              <label className="lg-label" htmlFor="lg-username">Username</label>
              <div className="lg-input-wrap">
                <span className="lg-input-icon">👤</span>
                <input
                  id="lg-username"
                  name="username"
                  className="lg-input"
                  placeholder="Enter your username"
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  required autoFocus disabled={loading}
                />
              </div>
            </div>

            <div className="lg-field">
              <label className="lg-label" htmlFor="lg-password">Password</label>
              <div className="lg-input-wrap">
                <span className="lg-input-icon">🔒</span>
                <input
                  id="lg-password"
                  name="password"
                  type={showPw ? "text" : "password"}
                  className="lg-input"
                  placeholder="••••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  style={{ paddingRight: "2.75rem" }}
                  required disabled={loading}
                />
                <button
                  type="button"
                  className="lg-pw-toggle"
                  onClick={() => setShowPw(v => !v)}
                  tabIndex={-1}
                  aria-label={showPw ? "Hide password" : "Show password"}
                >
                  {showPw ? "🙈" : "👁️"}
                </button>
              </div>
            </div>

            <div className="lg-submit-wrap">
              <button className="lg-submit" type="submit" disabled={loading}>
                {loading ? (
                  <><div className="lg-spinner" /> Authenticating…</>
                ) : (
                  <>Sign In <span className="lg-arrow">→</span></>
                )}
              </button>
            </div>
          </form>

          {/* Footer */}
          <div className="lg-footer">
            <p className="lg-footer-text">
              Don't have an account?{" "}
              <Link to="/signup" className="lg-link">Create Account</Link>
            </p>
            <Link to="/auth-choice" className="lg-back">
              <span className="lg-back-arrow">←</span> Back to Selection
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}