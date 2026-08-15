// import React, { useState, useEffect } from "react";
// import { postRecommend, getCategories } from "../api";

// const FALLBACK_CATEGORIES = [
//   "hospital", "police", "pharmacy", "restaurant", "cafe", "bank", "school", "hotel"
// ];

// function parseNum(v) {
//   if (v === undefined || v === null) return null;
//   if (typeof v === "number") return Number.isFinite(v) ? v : null;
//   const n = parseFloat(String(v).replace(",", "."));
//   return Number.isFinite(n) ? n : null;
// }

// function normalizePlace(p) {
//   if (!p || typeof p !== "object") return p;
//   const out = { ...p };

//   const latCandidates = [p.latitude, p.lat, p.y, p.latitud, p._lat, p.location?.[0]];
//   const lonCandidates = [p.longitude, p.lon, p.x, p.lng, p.long, p._lon, p.location?.[1]];

//   let lat = null;
//   let lon = null;
//   for (const c of latCandidates) { lat = parseNum(c); if (lat !== null) break; }
//   for (const c of lonCandidates) { lon = parseNum(c); if (lon !== null) break; }

//   if ((lat === null || lon === null) && p.geometry && Array.isArray(p.geometry.coordinates)) {
//     lon = lon ?? parseNum(p.geometry.coordinates[0]);
//     lat = lat ?? parseNum(p.geometry.coordinates[1]);
//   }
//   if ((lat === null || lon === null) && p.coords) {
//     lat = lat ?? parseNum(p.coords.lat ?? p.coords.latitude);
//     lon = lon ?? parseNum(p.coords.lon ?? p.coords.longitude);
//   }

//   if (lat !== null) out.latitude = lat;
//   if (lon !== null) out.longitude = lon;

//   return out;
// }

// export default function RecommendForm({ userCoords, onResults, manualSetUserCoords, onShowPlace }) {
//   const [manualMode, setManualMode] = useState(false);
//   const [manualLat, setManualLat] = useState("");
//   const [manualLon, setManualLon] = useState("");
//   const [query, setQuery] = useState("");
//   const [lang, setLang] = useState("en");
//   const [k, setK] = useState(5);
//   const [maxRadius, setMaxRadius] = useState(20);
//   const [categoryFilter, setCategoryFilter] = useState("");
//   const [categories, setCategories] = useState([]);

//   const [loading, setLoading] = useState(false);
//   const [results, setResults] = useState(null);
//   const [error, setError] = useState(null);

//   useEffect(() => {
//     getCategories()
//       .then((cats) => {
//         if (cats?.length) setCategories(cats);
//         else setCategories(FALLBACK_CATEGORIES);
//       })
//       .catch(() => setCategories(FALLBACK_CATEGORIES));
//   }, []);

//   function applyManualLocation() {
//     const lat = Number(manualLat), lon = Number(manualLon);
//     if (!manualLat || !manualLon || Number.isNaN(lat) || Number.isNaN(lon)) {
//       setError("Enter valid manual latitude and longitude.");
//       return;
//     }
//     setError(null);
//     if (manualSetUserCoords) manualSetUserCoords({ lat, lon });
//   }

//   async function handleSubmit(e) {
//     e.preventDefault();
//     setError(null);
//     if (!query.trim()) {
//       setError("Query is required (e.g., 'hospital').");
//       return;
//     }

//     const effectiveCoords = userCoords ? { lat: userCoords.lat, lon: userCoords.lon } : null;
//     if (!effectiveCoords) {
//       setError("No location available. Either allow location permission or use manual location.");
//       return;
//     }

//     setLoading(true);
//     setResults(null);

//     const params = {
//       lat: Number(effectiveCoords.lat),
//       lon: Number(effectiveCoords.lon),
//       query: query.trim(),
//       k: Number(k),
//       max_radius_km: Number(maxRadius),
//       category_filter: categoryFilter || null,
//       lang: lang || "en"
//     };

//     try {
//       const data = await postRecommend(params);
//       const normalizedResults = Array.isArray(data?.results) ? data.results.map(normalizePlace) : [];
//       const normalizedPayload = { count: normalizedResults.length, results: normalizedResults };

//       setResults(normalizedPayload);
//       if (onResults) onResults(normalizedPayload);
//     } catch (err) {
//       if (err?.data?.detail) setError(err.data.detail);
//       else setError(err.message || "Unknown error occurred");
//     } finally {
//       setLoading(false);
//     }
//   }

//   return (
//     <div className="max-w-4xl mx-auto p-4">
//       <div className="glass-card p-6 mb-6">
//         <h2 className="text-xl font-bold mb-4">Find Nearby Places</h2>

//         <div className="bg-[var(--bg-accent)] p-4 rounded-lg text-sm mb-6 border border-[var(--border)]">
//           <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
//             <div>
//               <span className="font-semibold block mb-1">Current location:</span>
//               <div className="text-muted">
//                 {userCoords ? `Lat: ${userCoords.lat} | Lon: ${userCoords.lon}` : "No GPS location detected yet."}
//               </div>
//             </div>

//             <label className="flex items-center gap-2 cursor-pointer">
//               <input type="checkbox" checked={manualMode} onChange={(e) => setManualMode(e.target.checked)} />
//               <span>Use manual location</span>
//             </label>
//           </div>

//           {manualMode && (
//             <div className="flex flex-wrap gap-2 items-center mt-4 pt-4 border-t border-[var(--border)]">
//               <input placeholder="Latitude" className="w-28" value={manualLat} onChange={(e) => setManualLat(e.target.value)} />
//               <input placeholder="Longitude" className="w-28" value={manualLon} onChange={(e) => setManualLon(e.target.value)} />
//               <button type="button" onClick={applyManualLocation} className="btn py-2 px-4 text-xs">Apply</button>
//             </div>
//           )}
//         </div>

//         <form onSubmit={handleSubmit} className="space-y-6">
//           <div className="form-group">
//             <label>Search Query (Required)</label>
//             <input placeholder="e.g., hospital, police" value={query} onChange={(e) => setQuery(e.target.value)} />
//           </div>

//           <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
//             <div className="form-group">
//               <label>k (results)</label>
//               <input type="number" min="1" value={k} onChange={(e) => setK(e.target.value)} />
//             </div>

//             <div className="form-group">
//               <label>Max Radius (km)</label>
//               <input type="number" min="1" value={maxRadius} onChange={(e) => setMaxRadius(e.target.value)} />
//             </div>

//             <div className="form-group">
//               <label>Category Filter</label>
//               <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
//                 <option value="">(Any)</option>
//                 {categories.map((c) => (<option key={c} value={c}>{c}</option>))}
//               </select>
//             </div>

//             <div className="form-group">
//               <label>Language</label>
//               <select value={lang} onChange={(e) => setLang(e.target.value)}>
//                 <option value="en">English</option>
//                 <option value="hi">Hindi</option>
//                 <option value="te">Telugu</option>
//                 <option value="ta">Tamil</option>
//                 <option value="ml">Malayalam</option>
//                 <option value="ar">Arabic</option>
//               </select>
//             </div>
//           </div>

//           <button type="submit" disabled={loading} className="btn w-full md:w-auto min-w-[200px] flex justify-center items-center gap-2">
//             {loading ? "Searching..." : <><span>🔍</span> Search Near Me</>}
//           </button>
//         </form>

//         {error && (<div className="bg-red-50 text-red-700 p-4 rounded-lg mt-6 border border-red-100"><b>Error:</b> {error}</div>)}
//       </div>

//       {results && (
//         <div className="space-y-4">
//           <div className="text-sm font-semibold text-muted">Results: {results.count}</div>
//           <div className="grid gap-4">
//             {results.results.map((r, idx) => (
//               <div key={idx} className="glass-card p-4 flex flex-col md:flex-row justify-between gap-4 hover:bg-[var(--bg-accent)] transition-colors">
//                 <div className="flex-1">
//                   <div className="text-lg font-bold" style={{ color: 'var(--primary)' }}>{r.display_name || r.name}</div>
//                   {r.original_name && r.original_name !== r.display_name && r.original_name !== r.name && (
//                     <div className="text-xs text-muted mt-1">Original: {r.original_name}</div>
//                   )}
//                   <div className="text-sm text-muted mt-2">{r.categories_display || r.categories}</div>

//                   <div className="flex gap-4 mt-3 text-sm">
//                     <span className="font-semibold">⭐ {r.rating || "N/A"}</span>
//                     <span className="font-semibold">📍 {r.distance_km || "?"} km</span>
//                   </div>
//                 </div>

//                 <div className="text-right flex flex-col justify-between items-end gap-2">
//                   <div className="text-xs text-muted">
//                     Score: {r.hybrid_score}
//                   </div>
//                   <button type="button" onClick={() => {
//                     if (onShowPlace) onShowPlace(r);
//                   }} className="btn-ghost text-xs py-1 px-3">Show on map</button>
//                 </div>
//               </div>
//             ))}
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }



import React, { useState, useEffect } from "react";
import { postRecommend, getCategories } from "../api";

const FALLBACK_CATEGORIES = [
  "hospital", "police", "pharmacy", "restaurant", "cafe", "bank", "school", "hotel"
];

function parseNum(v) {
  if (v === undefined || v === null) return null;
  if (typeof v === "number") return Number.isFinite(v) ? v : null;
  const n = parseFloat(String(v).replace(",", "."));
  return Number.isFinite(n) ? n : null;
}

function normalizePlace(p) {
  if (!p || typeof p !== "object") return p;
  const out = { ...p };

  const latCandidates = [p.latitude, p.lat, p.y, p._lat, p.location?.[0]];
  const lonCandidates = [p.longitude, p.lon, p.x, p.lng, p._lon, p.location?.[1]];

  let lat = null;
  let lon = null;
  for (const c of latCandidates) { lat = parseNum(c); if (lat !== null) break; }
  for (const c of lonCandidates) { lon = parseNum(c); if (lon !== null) break; }

  if ((lat === null || lon === null) && p.geometry?.coordinates) {
    lon = lon ?? parseNum(p.geometry.coordinates[0]);
    lat = lat ?? parseNum(p.geometry.coordinates[1]);
  }

  if (lat !== null) out.latitude = lat;
  if (lon !== null) out.longitude = lon;

  return out;
}

export default function RecommendForm({
  userCoords,
  onResults,
  manualSetUserCoords,
  onShowPlace
}) {
  const [manualMode, setManualMode] = useState(false);
  const [manualLat, setManualLat] = useState("");
  const [manualLon, setManualLon] = useState("");
  const [query, setQuery] = useState("");
  const [lang, setLang] = useState("en");
  const [k, setK] = useState(5);
  const [maxRadius, setMaxRadius] = useState(20);
  const [categoryFilter, setCategoryFilter] = useState("");
  const [categories, setCategories] = useState([]);

  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    getCategories()
      .then(cats => setCategories(cats?.length ? cats : FALLBACK_CATEGORIES))
      .catch(() => setCategories(FALLBACK_CATEGORIES));
  }, []);

  function applyManualLocation() {
    const lat = Number(manualLat);
    const lon = Number(manualLon);
    if (Number.isNaN(lat) || Number.isNaN(lon)) {
      setError("Enter valid manual latitude and longitude.");
      return;
    }
    setError(null);
    manualSetUserCoords && manualSetUserCoords({ lat, lon });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);

    if (!query.trim()) {
      setError("Query is required (e.g., hospital).");
      return;
    }

    if (!userCoords) {
      setError("No location available.");
      return;
    }

    setLoading(true);
    setResults(null);

    try {
      const data = await postRecommend({
        lat: userCoords.lat,
        lon: userCoords.lon,
        query: query.trim(),
        k: Number(k),
        max_radius_km: Number(maxRadius),
        category_filter: categoryFilter || null,
        lang
      });

      const normalized = Array.isArray(data?.results)
        ? data.results.map(normalizePlace)
        : [];

      const payload = { count: normalized.length, results: normalized };
      setResults(payload);
      onResults && onResults(payload);
    } catch (err) {
      setError(err?.message || "Error fetching recommendations");
    } finally {
      setLoading(false);
    }
  }

  // 🔧 FIX: Google Maps directions
  function openGoogleDirections(place) {
    const lat = place.latitude;
    const lon = place.longitude;
    if (!lat || !lon) return;

    const url = userCoords
      ? `https://www.google.com/maps/dir/?api=1&origin=${userCoords.lat},${userCoords.lon}&destination=${lat},${lon}&travelmode=driving`
      : `https://www.google.com/maps/dir/?api=1&destination=${lat},${lon}`;

    window.open(url, "_blank");
  }

  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="glass-card p-6 mb-6">
        <h2 className="text-xl font-bold mb-4">Find Nearby Places</h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          <input
            placeholder="e.g., hospital, police"
            value={query}
            onChange={e => setQuery(e.target.value)}
          />

          <button type="submit" disabled={loading} className="btn">
            {loading ? "Searching..." : "🔍 Search Near Me"}
          </button>
        </form>

        {error && (
          <div className="bg-red-50 text-red-700 p-4 rounded-lg mt-4">
            {error}
          </div>
        )}
      </div>

      {results && (
        <div className="space-y-4">
          <div className="text-sm font-semibold">
            Results: {results.count}
          </div>

          {results.results.map((r, idx) => (
            <div key={idx} className="glass-card p-4 flex justify-between">
              <div>
                <div className="text-lg font-bold">
                  {r.display_name || r.name}
                </div>
                <div className="text-sm text-muted">
                  {r.categories_display || r.categories}
                </div>

                {/* 🔧 FIX: Approx distance */}
                <div className="text-sm mt-2">
                  📍 Approx. distance: {Number.isFinite(r.distance_km) ? r.distance_km : "?"} km
                </div>
              </div>

              <div className="flex flex-col gap-2 items-end">
                <button
                  className="btn-ghost text-xs"
                  onClick={() => onShowPlace && onShowPlace(r)}
                >
                  Show on map
                </button>

                {/* 🔧 FIX: Locate button */}
                <button
                  className="btn-ghost text-xs"
                  onClick={() => openGoogleDirections(r)}
                >
                  Locate
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
