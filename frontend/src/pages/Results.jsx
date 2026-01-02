import React, { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { postRecommend } from "../api";

export default function Results() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [results, setResults] = useState([]);
  const [count, setCount] = useState(0);
  const [error, setError] = useState(null);

  // User intent + location
  const q = searchParams.get("query") || "";
  const lat = parseFloat(searchParams.get("lat") || "0");
  const lon = parseFloat(searchParams.get("lon") || "0");
  const k = parseInt(searchParams.get("k") || "10", 10);
  const max_radius_km = parseFloat(searchParams.get("max_radius_km") || "20");

  /* ---------------- FETCH RECOMMENDATIONS ---------------- */
  useEffect(() => {
    if (!q) {
      setError("No query provided");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    const body = { query: q, lat, lon, k, max_radius_km };

    postRecommend(body)
      .then((data) => {
        setResults(data?.results || []);
        setCount(data?.count ?? (data?.results?.length ?? 0));
      })
      .catch((err) => {
        console.error("recommend error:", err);
        setError(err?.message || "Failed to fetch recommendations");
      })
      .finally(() => setLoading(false));
  }, [q, lat, lon, k, max_radius_km]);

  /* ---------------- MAP HANDOFF ---------------- */
  function showOnMap(place) {
    try {
      localStorage.setItem("last_shown_place", JSON.stringify(place));
    } catch (e) {}
    navigate("/map");
  }

  /* ---------------- DIRECTIONS WITH CONFIRMATION ---------------- */
  function openDirections(place) {
    const name = place.display_name || place.name || "this place";

    const ok = window.confirm(
      `Are you sure you want to visit ${name}?`
    );
    if (!ok) return;

    if (!isFinite(lat) || !isFinite(lon)) {
      alert("User location not available");
      return;
    }

    const dLat = place.latitude ?? place.lat;
    const dLon = place.longitude ?? place.lon;

    if (!isFinite(dLat) || !isFinite(dLon)) {
      alert("Destination coordinates missing");
      return;
    }

    const url =
      `https://www.google.com/maps/dir/?api=1` +
      `&origin=${lat},${lon}` +
      `&destination=${dLat},${dLon}` +
      `&travelmode=driving`;

    window.open(url, "_blank");
  }

  /* ---------------- UI ---------------- */
  return (
    <div className="card fade-in-up">
      <h2 className="mb-2">Results for “{q}”</h2>

      {/* Friendly system message */}
      <div className="badge mb-4 fade-in-up">
        😊 Thank you for choosing <b>{q}</b>.  
        I will now recommend the nearest places for you.
      </div>

      <div style={{ color: "#64748b", marginBottom: 14 }}>
        📍 Your location:{" "}
        {isFinite(lat) && isFinite(lon)
          ? `${lat.toFixed(6)}, ${lon.toFixed(6)}`
          : "n/a"}
      </div>

      {loading && (
        <div className="fade-in-up">
          🔍 Finding the best places near you…
        </div>
      )}

      {error && <div style={{ color: "crimson" }}>{error}</div>}

      {!loading && !error && (
        <>
          <div className="text-sm text-gray-600 mb-3">
            Showing {count} nearby results
          </div>

          {results.length === 0 && (
            <div className="text-gray-600">No results found.</div>
          )}

          <ul style={{ listStyle: "none", padding: 0 }}>
            {results.map((r, i) => (
              <li
                key={r.business_id ?? r.place_id ?? i}
                className="service-card card fade-in-up"
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: 12,
                }}
              >
                <div>
                  <div style={{ fontWeight: 700 }}>
                    {r.display_name || r.name}
                  </div>

                  <div style={{ fontSize: 13, color: "#64748b" }}>
                    {r.categories_display || r.categories}
                  </div>

                  <div style={{ fontSize: 13, marginTop: 6 }}>
                    ⭐ Rating: {r.rating ?? "—"} • 📏{" "}
                    {r.distance_km ?? "—"} km (approx.)
                  </div>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  <button className="btn" onClick={() => showOnMap(r)}>
                    🗺 Show on map
                  </button>

                  <button className="btn" onClick={() => openDirections(r)}>
                    🚗 Directions
                  </button>

                  <a
                    className="btn-ghost"
                    href={`https://www.google.com/maps/search/?api=1&query=${r.latitude ?? r.lat},${r.longitude ?? r.lon}`}
                    target="_blank"
                    rel="noreferrer"
                  >
                    📍 Open in Maps
                  </a>
                </div>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}
