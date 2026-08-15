import React, { useState } from "react";
import { postSignup } from "../api";
import { useNavigate, Link } from "react-router-dom";

const PASSWORD_REGEX =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;

const PROFESSIONS = [
  "Student",
  "Employee",
  "Farmer",
  "Businessman",
  "Doctor",
  "Teacher",
  "Other",
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
    interests: "",
  });

  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState(null);
  const [err, setErr] = useState(null);

  function onChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function submit(e) {
    e.preventDefault();
    if (loading) return;

    setErr(null);

    if (!PASSWORD_REGEX.test(form.password)) {
      setErr(
        "Password must be at least 8 characters and include uppercase, lowercase, number, and symbol."
      );
      return;
    }

    setLoading(true);

    try {
      // 🔧 FIX: trim values before sending
      const payload = {
        ...form,
        firstname: form.firstname.trim(),
        lastname: form.lastname.trim(),
        emailid: form.emailid.trim(),
        address: form.address.trim(),
        username: form.username.trim(),
        interests: form.interests.trim(),
      };

      await postSignup(payload);
      setMsg("Registration successful. Please proceed to login.");
    } catch (e) {
      const msg =
        e?.data?.detail ||
        e?.message ||
        "Registration failed. Please check your inputs.";
      setErr(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-wrapper">
      <div className="w-full max-w-2xl">
        <div className="gov-box animate-enter">
          <div className="mb-6 border-b border-gray-100 pb-4 flex justify-between items-center">
            <h2 className="text-2xl font-bold">Citizen Registration</h2>
            <div className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded">
              Form SC-202
            </div>
          </div>

          {msg ? (
            <div className="text-center space-y-6 py-8">
              <div className="inline-block px-4 py-2 rounded-lg bg-green-50 text-green-800 font-bold border border-green-200">
                ✅ {msg}
              </div>
              <button
                className="btn-gov w-full max-w-xs mx-auto"
                onClick={() => nav("/login")}
              >
                Go to Login
              </button>
            </div>
          ) : (
            <form onSubmit={submit} className="flex flex-col gap-5">
              {/* Personal Info */}
              <div className="p-4 bg-gray-50 rounded border border-gray-100 dark:bg-slate-800 dark:border-slate-700">
                <h3 className="text-sm font-bold text-muted uppercase mb-3">
                  Personal Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <input
                    name="firstname"
                    required
                    className="gov-input"
                    placeholder="First name"
                    value={form.firstname}
                    onChange={onChange}
                    disabled={loading}
                  />
                  <input
                    name="lastname"
                    required
                    className="gov-input"
                    placeholder="Last name"
                    value={form.lastname}
                    onChange={onChange}
                    disabled={loading}
                  />
                </div>
              </div>

              {/* Contact */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <input
                  name="emailid"
                  type="email"
                  required
                  className="gov-input"
                  placeholder="Email address"
                  value={form.emailid}
                  onChange={onChange}
                  disabled={loading}
                />
                <input
                  name="address"
                  className="gov-input"
                  placeholder="Residential address"
                  value={form.address}
                  onChange={onChange}
                  disabled={loading}
                />
              </div>

              {/* Profile */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <input
                  name="username"
                  required
                  className="gov-input"
                  placeholder="Username"
                  value={form.username}
                  onChange={onChange}
                  disabled={loading}
                />

                <select
                  name="profession"
                  required
                  value={form.profession}
                  onChange={onChange}
                  className="gov-input"
                  disabled={loading}
                >
                  <option value="">-- Select Profession --</option>
                  {PROFESSIONS.map((p) => (
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
                  className="gov-input bg-yellow-50 dark:bg-slate-900"
                  disabled={loading}
                >
                  <option value="">-- Select Education Level --</option>
                  <option value="school">School</option>
                  <option value="college">College</option>
                  <option value="graduate">Graduate</option>
                </select>
              )}

              <input
                name="interests"
                placeholder="e.g. Health, Education, Transport"
                className="gov-input"
                value={form.interests}
                onChange={onChange}
                disabled={loading}
              />

              <div>
                <input
                  name="password"
                  type="password"
                  required
                  className="gov-input"
                  placeholder="Secure password"
                  value={form.password}
                  onChange={onChange}
                  maxLength={72}
                  disabled={loading}
                />
                <p className="text-xs text-muted mt-1">
                  8+ chars, uppercase, lowercase, number, special.
                </p>
              </div>

              {err && (
                <div className="bg-red-50 text-red-700 p-4 rounded border border-red-200 text-sm">
                  ⚠️ {err}
                </div>
              )}

              <div className="flex gap-4 mt-4 pt-4 border-t border-gray-100">
                <button
                  className="btn-gov flex-1 py-3"
                  disabled={loading}
                >
                  {loading ? "Processing..." : "Complete Registration"}
                </button>
                <Link
                  to="/auth-choice"
                  className="btn-gov-outline flex-1 text-center"
                >
                  Cancel
                </Link>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
