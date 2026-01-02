import React, { useEffect, useState } from "react";
import { getMyServices } from "../api";

export default function ServiceRecommendations() {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);

  useEffect(() => {
    getMyServices()
      .then((data) => {
        console.log("Services from backend:", data);
        setServices(Array.isArray(data) ? data : []);
      })
      .catch((e) => {
        console.error("Service fetch error:", e);
        setErr(e.message || "Failed to load services");
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="card fade-in-up">
        <h3>Recommended Services for You</h3>
        <div className="text-sm text-gray-500">
          Loading recommendations…
        </div>
      </div>
    );
  }

  return (
    <div className="card fade-in-up">
      <h3>Recommended Services for You</h3>

      {err && (
        <div style={{ color: "#b91c1c", fontSize: 14, marginBottom: 8 }}>
          {err}
        </div>
      )}

      {services.length === 0 && !err && (
        <div style={{ color: "#64748b" }}>
          No services available for your profile right now.
        </div>
      )}

      <div style={{ display: "grid", gap: 16, marginTop: 12 }}>
        {services.map((s) => (
          <div key={s.service_name} className="service-card">
            <div style={{ fontWeight: 700, fontSize: 16 }}>
              {s.service_name}
            </div>

            <div style={{ fontSize: 14, color: "#475569", marginTop: 4 }}>
              {s.description}
            </div>

            <div style={{ marginTop: 6, display: "flex", gap: 8, alignItems: "center" }}>
              <span className="badge">{s.service_type}</span>
              <span style={{ fontSize: 12, color: "#64748b" }}>
                Score: <b>{s.score}</b>
              </span>
            </div>

            {s.expiry_date && (
              <div style={{ fontSize: 12, color: "#64748b", marginTop: 4 }}>
                Valid till: {s.expiry_date}
              </div>
            )}

            {/* 🔥 WEBSITE LINK (NEW) */}
            {s.website_url && (
              <a
                href={s.website_url}
                target="_blank"
                rel="noreferrer"
                style={{
                  display: "inline-block",
                  marginTop: 8,
                  fontSize: 13,
                  fontWeight: 600,
                  color: "#0369a1"
                }}
              >
                Visit Official Website →
              </a>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
