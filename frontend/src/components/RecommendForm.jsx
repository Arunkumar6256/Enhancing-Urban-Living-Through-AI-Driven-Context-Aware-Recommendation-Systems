// // src/components/RecommendForm.jsx
// import React, { useState, useEffect } from "react";
// import { postRecommend, getCategories } from "../api";

// const FALLBACK_CATEGORIES = [
//   "hospital", "police", "pharmacy", "restaurant", "cafe", "bank", "school", "hotel"
// ];

// // safe parse to finite number or null
// function parseNum(v) {
//   if (v === undefined || v === null) return null;
//   if (typeof v === "number") return Number.isFinite(v) ? v : null;
//   const n = parseFloat(String(v).replace(",", "."));
//   return Number.isFinite(n) ? n : null;
// }

// // normalize one result object to guarantee latitude & longitude numeric fields if possible
// function normalizePlace(p) {
//   if (!p || typeof p !== "object") return p;
//   const out = { ...p };

//   // Common field candidates
//   const latCandidates = [p.latitude, p.lat, p.y, p.latitud, p._lat];
//   const lonCandidates = [p.longitude, p.lon, p.x, p.lng, p.long, p._lon];

//   // try candidates
//   let lat = null;
//   let lon = null;
//   for (const c of latCandidates) {
//     lat = parseNum(c);
//     if (lat !== null) break;
//   }
//   for (const c of lonCandidates) {
//     lon = parseNum(c);
//     if (lon !== null) break;
//   }

//   // fallback: coordinates might be in an array
//   if ((lat === null || lon === null) && Array.isArray(p.location) && p.location.length >= 2) {
//     lat = parseNum(p.location[0]);
//     lon = parseNum(p.location[1]);
//   }

//   // fallback: geometry object {coordinates: [lon, lat]} (GeoJSON)
//   if ((lat === null || lon === null) && p.geometry && Array.isArray(p.geometry.coordinates)) {
//     // GeoJSON: [lon, lat]
//     lon = parseNum(p.geometry.coordinates[0]);
//     lat = parseNum(p.geometry.coordinates[1]);
//   }

//   // fallback: coords object {lat, lon} or {latitude, longitude}
//   if ((lat === null || lon === null) && p.coords && typeof p.coords === "object") {
//     lat = lat ?? parseNum(p.coords.lat ?? p.coords.latitude);
//     lon = lon ?? parseNum(p.coords.lon ?? p.coords.longitude);
//   }

//   // write normalized numeric fields (if found)
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
//   const [results, setResults] = useState(null); // { count, results: [ ...normalized ] }
//   const [error, setError] = useState(null);

//   // Load categories on mount
//   useEffect(() => {
//     getCategories().then((cats) => {
//       if (cats && cats.length > 0) setCategories(cats);
//       else setCategories(FALLBACK_CATEGORIES);
//     }).catch(() => {
//       setCategories(FALLBACK_CATEGORIES);
//     });
//   }, []);

//   function applyManualLocation() {
//     const lat = Number(manualLat);
//     const lon = Number(manualLon);
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
//       setError("Query is required (e.g., 'hospital', 'police').");
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

//       // Debug: log raw backend response
//       console.log("postRecommend raw response:", data);

//       // Normalize each place to ensure latitude & longitude numeric fields exist if possible
//       const normalizedResults = Array.isArray(data?.results)
//         ? data.results.map((p) => normalizePlace(p))
//         : [];

//       const normalizedPayload = { count: normalizedResults.length, results: normalizedResults };

//       console.log("postRecommend normalized results:", normalizedPayload);

//       setResults(normalizedPayload);
//       if (onResults) onResults(normalizedPayload);
//     } catch (err) {
//       console.error("postRecommend error:", err);
//       if (err?.data?.detail) setError(err.data.detail);
//       else setError(err.message || "Unknown error occurred");
//     } finally {
//       setLoading(false);
//     }
//   }

//   return (
//     <div className="max-w-3xl mx-auto p-4">
//       <h2 className="text-xl font-semibold mb-4">Find Nearby Places</h2>

//       {/* Show detected coordinates or manual controls */}
//       <div className="bg-gray-100 p-3 rounded text-sm mb-4">
//         <b>Current location:</b>
//         <div className="mt-1">
//           {userCoords ? (
//             <span>Lat: {userCoords.lat.toFixed(6)} | Lon: {userCoords.lon.toFixed(6)}</span>
//           ) : (
//             <span className="text-sm text-gray-600">No GPS location detected yet.</span>
//           )}
//         </div>

//         <div className="mt-3 flex items-center gap-3">
//           <label className="flex items-center gap-2">
//             <input type="checkbox" checked={manualMode} onChange={(e) => setManualMode(e.target.checked)} />
//             <span className="text-sm">Use manual location</span>
//           </label>

//           {manualMode && (
//             <div className="flex gap-2 items-center">
//               <input
//                 placeholder="Latitude"
//                 className="border p-1 rounded w-28"
//                 value={manualLat}
//                 onChange={(e) => setManualLat(e.target.value)}
//               />
//               <input
//                 placeholder="Longitude"
//                 className="border p-1 rounded w-28"
//                 value={manualLon}
//                 onChange={(e) => setManualLon(e.target.value)}
//               />
//               <button
//                 type="button"
//                 onClick={applyManualLocation}
//                 className="bg-indigo-600 text-white px-3 py-1 rounded text-sm"
//               >
//                 Apply
//               </button>
//             </div>
//           )}
//         </div>
//       </div>

//       <form onSubmit={handleSubmit} className="space-y-4 mb-6">
//         {/* Query */}
//         <label className="flex flex-col">
//           <span className="text-sm font-medium">Search Query (Required)</span>
//           <input
//             className="border p-2 rounded"
//             placeholder="e.g., hospital, police"
//             value={query}
//             onChange={(e) => setQuery(e.target.value)}
//           />
//         </label>

//         {/* k, radius, category, language */}
//         <div className="grid grid-cols-4 gap-4">
//           <label className="flex flex-col">
//             <span className="text-sm font-medium">k (results)</span>
//             <input
//               type="number"
//               min="1"
//               className="border p-2 rounded"
//               value={k}
//               onChange={(e) => setK(e.target.value)}
//             />
//           </label>

//           <label className="flex flex-col">
//             <span className="text-sm font-medium">Max Radius (km)</span>
//             <input
//               type="number"
//               min="1"
//               className="border p-2 rounded"
//               value={maxRadius}
//               onChange={(e) => setMaxRadius(e.target.value)}
//             />
//           </label>

//           <label className="flex flex-col">
//             <span className="text-sm font-medium">Category Filter</span>
//             <select
//               className="border p-2 rounded"
//               value={categoryFilter}
//               onChange={(e) => setCategoryFilter(e.target.value)}
//             >
//               <option value="">(Any)</option>
//               {categories.map((c) => (
//                 <option key={c} value={c}>{c}</option>
//               ))}
//             </select>
//           </label>

//           <label className="flex flex-col">
//             <span className="text-sm font-medium">Language</span>
//             <select
//               className="border p-2 rounded"
//               value={lang}
//               onChange={(e) => setLang(e.target.value)}
//             >
//               <option value="en">English</option>
//               <option value="hi">Hindi</option>
//               <option value="te">Telugu</option>
//               <option value="ta">Tamil</option>
//               <option value="ml">Malayalam</option>
//               <option value="ar">Arabic</option>
//             </select>
//           </label>
//         </div>

//         <button
//           type="submit"
//           disabled={loading}
//           className="bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50"
//         >
//           {loading ? "Searching..." : "Search Near Me"}
//         </button>
//       </form>

//       {error && (
//         <div className="bg-red-200 text-red-800 p-3 rounded mb-4">
//           <b>Error:</b> {error}
//         </div>
//       )}

//       {results && (
//         <div className="space-y-4">
//           <div className="text-sm text-gray-600">Results: {results.count}</div>

//           {results.results.map((r, idx) => (
//             <div key={idx} className="border p-4 rounded shadow-sm">
//               <div className="flex justify-between items-start">
//                 <div>
//                   <div className="text-lg font-semibold">
//                     {r.display_name || r.name}
//                   </div>

//                   {r.original_name &&
//                     r.original_name !== r.display_name &&
//                     r.original_name !== r.name && (
//                       <div className="text-sm text-gray-500">Original: {r.original_name}</div>
//                     )}

//                   <div className="text-sm text-gray-600">{r.categories_display || r.categories}</div>
//                 </div>

//                 <div className="text-right">
//                   <button
//                     type="button"
//                     onClick={() => {
//                       console.log("Show on map clicked for (normalized):", r);
//                       // Inform App to show all results as normal, and also request selection
//                       if (onResults) onResults({ results: [r], count: 1 });
//                       if (onShowPlace) onShowPlace(r);
//                     }}
//                     className="bg-gray-100 px-2 py-1 rounded text-sm"
//                   >
//                     Show on map
//                   </button>
//                 </div>
//               </div>

//               <div className="text-sm mt-2">
//                 ⭐ Rating: {r.rating}
//                 <br />
//                 📍 Distance: {r.distance_km} km
//                 <br />
//                 Score: {r.hybrid_score}
//               </div>
//             </div>
//           ))}
//         </div>
//       )}
//     </div>
//   );
// }
// src/components/RecommendForm.jsx
// src/components/RecommendForm.jsx
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

  const latCandidates = [p.latitude, p.lat, p.y, p.latitud, p._lat, p.location?.[0]];
  const lonCandidates = [p.longitude, p.lon, p.x, p.lng, p.long, p._lon, p.location?.[1]];

  let lat = null;
  let lon = null;
  for (const c of latCandidates) { lat = parseNum(c); if (lat !== null) break; }
  for (const c of lonCandidates) { lon = parseNum(c); if (lon !== null) break; }

  if ((lat === null || lon === null) && p.geometry && Array.isArray(p.geometry.coordinates)) {
    lon = lon ?? parseNum(p.geometry.coordinates[0]);
    lat = lat ?? parseNum(p.geometry.coordinates[1]);
  }
  if ((lat === null || lon === null) && p.coords) {
    lat = lat ?? parseNum(p.coords.lat ?? p.coords.latitude);
    lon = lon ?? parseNum(p.coords.lon ?? p.coords.longitude);
  }

  if (lat !== null) out.latitude = lat;
  if (lon !== null) out.longitude = lon;

  return out;
}

export default function RecommendForm({ userCoords, onResults, manualSetUserCoords, onShowPlace }) {
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
      .then((cats) => {
        if (cats?.length) setCategories(cats);
        else setCategories(FALLBACK_CATEGORIES);
      })
      .catch(() => setCategories(FALLBACK_CATEGORIES));
  }, []);

  function applyManualLocation() {
    const lat = Number(manualLat), lon = Number(manualLon);
    if (!manualLat || !manualLon || Number.isNaN(lat) || Number.isNaN(lon)) {
      setError("Enter valid manual latitude and longitude.");
      return;
    }
    setError(null);
    if (manualSetUserCoords) manualSetUserCoords({ lat, lon });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    if (!query.trim()) {
      setError("Query is required (e.g., 'hospital').");
      return;
    }

    const effectiveCoords = userCoords ? { lat: userCoords.lat, lon: userCoords.lon } : null;
    if (!effectiveCoords) {
      setError("No location available. Either allow location permission or use manual location.");
      return;
    }

    setLoading(true);
    setResults(null);

    const params = {
      lat: Number(effectiveCoords.lat),
      lon: Number(effectiveCoords.lon),
      query: query.trim(),
      k: Number(k),
      max_radius_km: Number(maxRadius),
      category_filter: categoryFilter || null,
      lang: lang || "en"
    };

    try {
      const data = await postRecommend(params);
      console.log("RecommendForm: raw response from postRecommend:", data);

      const normalizedResults = Array.isArray(data?.results) ? data.results.map(normalizePlace) : [];
      const normalizedPayload = { count: normalizedResults.length, results: normalizedResults };

      console.log("RecommendForm: normalized payload:", normalizedPayload);

      setResults(normalizedPayload);
      if (onResults) onResults(normalizedPayload);
    } catch (err) {
      console.error("RecommendForm: postRecommend error:", err);
      if (err?.data?.detail) setError(err.data.detail);
      else setError(err.message || "Unknown error occurred");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-3xl mx-auto p-4">
      <h2 className="text-xl font-semibold mb-4">Find Nearby Places</h2>

      <div className="bg-gray-100 p-3 rounded text-sm mb-4">
        <b>Current location:</b>
        <div className="mt-1">{userCoords ? `Lat: ${userCoords.lat} | Lon: ${userCoords.lon}` : "No GPS location detected yet."}</div>

        <div className="mt-3 flex items-center gap-3">
          <label className="flex items-center gap-2">
            <input type="checkbox" checked={manualMode} onChange={(e) => setManualMode(e.target.checked)} />
            <span className="text-sm">Use manual location</span>
          </label>

          {manualMode && (
            <div className="flex gap-2 items-center">
              <input placeholder="Latitude" className="border p-1 rounded w-28" value={manualLat} onChange={(e) => setManualLat(e.target.value)} />
              <input placeholder="Longitude" className="border p-1 rounded w-28" value={manualLon} onChange={(e) => setManualLon(e.target.value)} />
              <button type="button" onClick={applyManualLocation} className="bg-indigo-600 text-white px-3 py-1 rounded text-sm">Apply</button>
            </div>
          )}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 mb-6">
        <label className="flex flex-col">
          <span className="text-sm font-medium">Search Query (Required)</span>
          <input className="border p-2 rounded" placeholder="e.g., hospital" value={query} onChange={(e) => setQuery(e.target.value)} />
        </label>

        <div className="grid grid-cols-4 gap-4">
          <label className="flex flex-col">
            <span className="text-sm font-medium">k (results)</span>
            <input type="number" min="1" className="border p-2 rounded" value={k} onChange={(e) => setK(e.target.value)} />
          </label>

          <label className="flex flex-col">
            <span className="text-sm font-medium">Max Radius (km)</span>
            <input type="number" min="1" className="border p-2 rounded" value={maxRadius} onChange={(e) => setMaxRadius(e.target.value)} />
          </label>

          <label className="flex flex-col">
            <span className="text-sm font-medium">Category Filter</span>
            <select className="border p-2 rounded" value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
              <option value="">(Any)</option>
              {categories.map((c) => (<option key={c} value={c}>{c}</option>))}
            </select>
          </label>

          <label className="flex flex-col">
            <span className="text-sm font-medium">Language</span>
            <select className="border p-2 rounded" value={lang} onChange={(e) => setLang(e.target.value)}>
              <option value="en">English</option>
              <option value="hi">Hindi</option>
              <option value="te">Telugu</option>
              <option value="ta">Tamil</option>
              <option value="ml">Malayalam</option>
              <option value="ar">Arabic</option>
            </select>
          </label>
        </div>

        <button type="submit" disabled={loading} className="bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50">
          {loading ? "Searching..." : "Search Near Me"}
        </button>
      </form>

      {error && (<div className="bg-red-200 text-red-800 p-3 rounded mb-4"><b>Error:</b> {error}</div>)}

      {results && (
        <div className="space-y-4">
          <div className="text-sm text-gray-600">Results: {results.count}</div>
          {results.results.map((r, idx) => (
            <div key={idx} className="border p-4 rounded shadow-sm">
              <div className="flex justify-between items-start">
                <div>
                  <div className="text-lg font-semibold">{r.display_name || r.name}</div>
                  {r.original_name && r.original_name !== r.display_name && r.original_name !== r.name && (<div className="text-sm text-gray-500">Original: {r.original_name}</div>)}
                  <div className="text-sm text-gray-600">{r.categories_display || r.categories}</div>
                  <div className="text-xs text-gray-500 mt-1">Normalized coords: {String(r.latitude ?? r.lat ?? "N/A")}, {String(r.longitude ?? r.lon ?? "N/A")}</div>
                </div>

                <div className="text-right">
                  <button type="button" onClick={() => {
                    console.log("RecommendForm: Show on map clicked for (normalized):", r);
                    // Only call onShowPlace — do NOT call onResults here to avoid clearing selection
                    if (onShowPlace) onShowPlace(r);
                  }} className="bg-gray-100 px-2 py-1 rounded text-sm">Show on map</button>
                </div>
              </div>

              <div className="text-sm mt-2">
                ⭐ Rating: {r.rating}<br />
                📍 Distance: {r.distance_km} km<br />
                Score: {r.hybrid_score}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
