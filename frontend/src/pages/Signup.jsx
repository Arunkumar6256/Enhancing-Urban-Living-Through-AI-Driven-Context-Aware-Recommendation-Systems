// // src/pages/Signup.jsx
// import React, { useState } from "react";
// import { postSignup } from "../api";

// const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;

// export default function Signup() {
//   const [form, setForm] = useState({
//     firstname: "", lastname: "", emailid: "", address: "", username: "", password: "", occupation: ""
//   });
//   const [loading, setLoading] = useState(false);
//   const [msg, setMsg] = useState(null);
//   const [err, setErr] = useState(null);

//   function onChange(e) {
//     setForm({ ...form, [e.target.name]: e.target.value });
//   }

//   async function handleSignup(e) {
//     e.preventDefault();
//     setErr(null);
//     setMsg(null);

//     if (!PASSWORD_REGEX.test(form.password)) {
//       setErr("Password must be at least 8 characters and include upper, lower, number and special character.");
//       return;
//     }

//     setLoading(true);
//     try {
//       const res = await postSignup(form);
//       setMsg(`Signup successful. Username: ${res.username}`);
//       setForm({ firstname: "", lastname: "", emailid: "", address: "", username: "", password: "", occupation: "" });
//     } catch (e) {
//       setErr(e.message || "Signup failed");
//     } finally { setLoading(false); }
//   }

//   return (
//     <div className="max-w-md mx-auto p-6 bg-white rounded shadow">
//       <h2 className="text-xl font-bold mb-4">Sign up</h2>

//       {msg && <div className="bg-green-100 p-2 mb-3 text-green-800">{msg}</div>}
//       {err && <div className="bg-red-100 p-2 mb-3 text-red-800">{err}</div>}

//       <form onSubmit={handleSignup} className="space-y-3">
//         <div className="grid grid-cols-2 gap-2">
//           <input name="firstname" required placeholder="First name" value={form.firstname} onChange={onChange} className="border p-2 rounded" />
//           <input name="lastname" required placeholder="Last name" value={form.lastname} onChange={onChange} className="border p-2 rounded" />
//         </div>

//         <input name="emailid" type="email" required placeholder="Email" value={form.emailid} onChange={onChange} className="border p-2 rounded w-full" />
//         <input name="address" placeholder="Address" value={form.address} onChange={onChange} className="border p-2 rounded w-full" />

//         <div className="grid grid-cols-2 gap-2">
//           <input name="username" required placeholder="Username" value={form.username} onChange={onChange} className="border p-2 rounded" />
//           <input name="occupation" placeholder="Occupation" value={form.occupation} onChange={onChange} className="border p-2 rounded" />
//         </div>

//         <input name="password" type="password" required placeholder="Password" value={form.password} onChange={onChange} className="border p-2 rounded w-full" />
//         <div className="text-xs text-gray-500">
//           Password must be at least 8 characters and include uppercase, lowercase, number and a special character.
//         </div>

//         <button type="submit" disabled={loading} className="bg-blue-600 text-white px-4 py-2 rounded">
//           {loading ? "Signing up..." : "Sign up"}
//         </button>
//       </form>
//     </div>
//   );
// }


// src/pages/Signup.jsx
// import React, { useState } from "react";
// import { postSignup } from "../api";
// import { useNavigate } from "react-router-dom";

// const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;

// export default function Signup(){
//   const nav = useNavigate();
//   const [form, setForm] = useState({ firstname:"", lastname:"", emailid:"", address:"", username:"", password:"", occupation:"" });
//   const [loading, setLoading] = useState(false);
//   const [msg, setMsg] = useState(null);
//   const [err, setErr] = useState(null);

//   function onChange(e){ setForm({...form, [e.target.name]: e.target.value}); }

//   async function submit(e){
//     e.preventDefault();
//     setErr(null);
//     if (!PASSWORD_REGEX.test(form.password)) {
//       setErr("Password must be at least 8 characters and include upper, lower, number and special character.");
//       return;
//     }
//     setLoading(true);
//     try {
//       const res = await postSignup(form);
//       setMsg(`Congratulations! Signup successful. You can login now.`);
//     } catch (e){
//       setErr(e?.message || String(e));
//     } finally { setLoading(false); }
//   }

//   return (
//     <div className="card fade-in-up" style={{maxWidth:600, margin:"0 auto"}}>
//       <h2>Sign up</h2>

//       {msg ? (
//         <div style={{display:"grid", gap:12, alignItems:"center"}}>
//           <div className="badge">✓ Registered</div>
//           <div style={{fontWeight:700}}>Congratulations — you can login now</div>
//           <div style={{color:"#475569"}}>Click continue to go to the login page.</div>
//           <div style={{display:"flex", gap:12}}>
//             <button className="btn" onClick={() => nav("/login")}>Continue to Login</button>
//             <button className="btn-ghost" onClick={() => nav("/")} >Back to Intro</button>
//           </div>
//         </div>
//       ) : (
//         <form onSubmit={submit} style={{display:"grid", gap:10}}>
//           <div style={{display:"grid", gridTemplateColumns:"1fr 1fr", gap:8}}>
//             <input name="firstname" required placeholder="First name" value={form.firstname} onChange={onChange} />
//             <input name="lastname" required placeholder="Last name" value={form.lastname} onChange={onChange} />
//           </div>
//           <input name="emailid" type="email" required placeholder="Email" value={form.emailid} onChange={onChange} />
//           <input name="address" placeholder="Address" value={form.address} onChange={onChange} />
//           <div style={{display:"grid", gridTemplateColumns:"1fr 1fr", gap:8}}>
//             <input name="username" placeholder="Username" required value={form.username} onChange={onChange} />
//             <input name="occupation" placeholder="Occupation" value={form.occupation} onChange={onChange} />
//           </div>
//           <input name="password" type="password" required placeholder="Password" value={form.password} onChange={onChange} maxLength={72} />
//           <div style={{fontSize:12, color:"#475569"}}>Password rules: min 8 chars, include upper+lower+number+special.</div>

//           {err && <div style={{background:"#fee2e2", color:"#9b1c1c", padding:8, borderRadius:8}}>{err}</div>}

//           <div style={{display:"flex", gap:10, marginTop:6}}>
//             <button className="btn" type="submit" disabled={loading}>{loading ? "Signing..." : "Sign up"}</button>
//             <button type="button" className="btn-ghost" onClick={() => nav("/auth-choice")}>Back</button>
//           </div>
//         </form>
//       )}
//     </div>
//   );
// }
// src/pages/Signup.jsx
import React, { useState } from "react";
import { postSignup } from "../api";
import { useNavigate } from "react-router-dom";

const PASSWORD_REGEX =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;

const PROFESSIONS = [
  "Student",
  "Employee",
  "Farmer",
  "Businessman",
  "Doctor",
  "Teacher",
  "Other"
];

export default function Signup() {
  const nav = useNavigate();

  const [form, setForm] = useState({
    firstname: "",
    lastname: "",
    emailid: "",
    address: "",
    username: "",
    password: "",
    profession: "",
    education_level: "",
    interests: ""
  });

  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState(null);
  const [err, setErr] = useState(null);

  function onChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function submit(e) {
    e.preventDefault();
    setErr(null);

    if (!PASSWORD_REGEX.test(form.password)) {
      setErr(
        "Password must be at least 8 characters and include upper, lower, number and special character."
      );
      return;
    }

    setLoading(true);
    try {
      await postSignup(form);
      setMsg("Signup successful. You can login now.");
    } catch (e) {
      setErr(e?.message || "Signup failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="card fade-in-up" style={{ maxWidth: 650, margin: "0 auto" }}>
      <h2>User Registration</h2>

      {msg ? (
        <div style={{ display: "grid", gap: 12 }}>
          <div className="badge">✓ Registered</div>
          <div style={{ fontWeight: 700 }}>{msg}</div>
          <button className="btn" onClick={() => nav("/login")}>
            Continue to Login
          </button>
        </div>
      ) : (
        <form onSubmit={submit} style={{ display: "grid", gap: 10 }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
            <input
              name="firstname"
              required
              placeholder="First name"
              value={form.firstname}
              onChange={onChange}
            />
            <input
              name="lastname"
              required
              placeholder="Last name"
              value={form.lastname}
              onChange={onChange}
            />
          </div>

          <input
            name="emailid"
            type="email"
            required
            placeholder="Email"
            value={form.emailid}
            onChange={onChange}
          />

          <input
            name="address"
            placeholder="Address"
            value={form.address}
            onChange={onChange}
          />

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
            <input
              name="username"
              required
              placeholder="Username"
              value={form.username}
              onChange={onChange}
            />

            <select
              name="profession"
              required
              value={form.profession}
              onChange={onChange}
            >
              <option value="">Select Profession</option>
              {PROFESSIONS.map(p => (
                <option key={p} value={p.toLowerCase()}>
                  {p}
                </option>
              ))}
            </select>
          </div>

          {form.profession === "student" && (
            <select
              name="education_level"
              value={form.education_level}
              onChange={onChange}
            >
              <option value="">Education Level</option>
              <option value="school">School</option>
              <option value="college">College</option>
              <option value="graduate">Graduate</option>
            </select>
          )}

          <input
            name="interests"
            placeholder="Interests (e.g. scholarships, internships, health)"
            value={form.interests}
            onChange={onChange}
          />

          <input
            name="password"
            type="password"
            required
            placeholder="Password"
            value={form.password}
            onChange={onChange}
            maxLength={72}
          />

          <div style={{ fontSize: 12, color: "#475569" }}>
            Password must contain uppercase, lowercase, number and special
            character.
          </div>

          {err && (
            <div
              style={{
                background: "#fee2e2",
                color: "#9b1c1c",
                padding: 8,
                borderRadius: 6
              }}
            >
              {err}
            </div>
          )}

          <div style={{ display: "flex", gap: 10 }}>
            <button className="btn" disabled={loading}>
              {loading ? "Signing..." : "Sign up"}
            </button>
            <button
              type="button"
              className="btn-ghost"
              onClick={() => nav("/auth-choice")}
            >
              Back
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
