// // src/pages/Home.jsx
// import React, { useState, useEffect, useRef } from "react";
// import { useNavigate } from "react-router-dom";
// import CategoryChip from "../components/CategoryChip";
// import ServiceRecommendations from "../components/ServiceRecommendations";

// const CATEGORIES = [
//   "Hospital",
//   "Police",
//   "Pharmacy",
//   "Transport",
//   "Government Office",
//   "Tourism"
// ];

// const RECENT_SEARCH_KEY = "smartcity_recent_searches";
// const SAVED_LOCATIONS_KEY = "smartcity_saved_locations";
// const LAST_RESULTS_KEY = "smartcity_last_results";

// export default function Home() {
//   const [query, setQuery] = useState("");
//   const [lat, setLat] = useState("17.3850");
//   const [lon, setLon] = useState("78.4867");

//   const [recent, setRecent] = useState(() => {
//     try {
//       return JSON.parse(localStorage.getItem(RECENT_SEARCH_KEY) || "[]");
//     } catch {
//       return [];
//     }
//   });

//   const [savedLocations, setSavedLocations] = useState(() => {
//     try {
//       return JSON.parse(localStorage.getItem(SAVED_LOCATIONS_KEY) || "[]");
//     } catch {
//       return [];
//     }
//   });

//   const [lastResultsPreview, setLastResultsPreview] = useState(() => {
//     try {
//       return JSON.parse(localStorage.getItem(LAST_RESULTS_KEY) || "null");
//     } catch {
//       return null;
//     }
//   });

//   const [suggestions, setSuggestions] = useState([]);
//   const [msg, setMsg] = useState(null);

//   const queryRef = useRef(null);
//   const navigate = useNavigate();

//   // auto-hide messages
//   useEffect(() => {
//     if (!msg) return;
//     const t = setTimeout(() => setMsg(null), 3000);
//     return () => clearTimeout(t);
//   }, [msg]);

//   // autocomplete suggestions
//   useEffect(() => {
//     const q = (query || "").toLowerCase().trim();
//     if (!q) {
//       setSuggestions([]);
//       return;
//     }
//     const s = CATEGORIES.filter(
//       (c) => c.toLowerCase().includes(q) && c.toLowerCase() !== q
//     );
//     setSuggestions(s.slice(0, 6));
//   }, [query]);

//   function pushRecent(q, latVal, lonVal) {
//     if (!q) return;
//     const newItem = { q, lat: latVal, lon: lonVal, ts: Date.now() };
//     const merged = [
//       newItem,
//       ...recent.filter(
//         (r) => r.q !== q || r.lat !== latVal || r.lon !== lonVal
//       )
//     ];
//     const truncated = merged.slice(0, 8);
//     setRecent(truncated);
//     localStorage.setItem(RECENT_SEARCH_KEY, JSON.stringify(truncated));
//   }

//   function clearRecent() {
//     setRecent([]);
//     localStorage.removeItem(RECENT_SEARCH_KEY);
//     setMsg("Recent searches cleared");
//   }

//   function submit(q = null) {
//     const finalQ = ((q ?? query) || "").trim();
//     if (!finalQ) {
//       setMsg("Please enter a search query or choose a category.");
//       queryRef.current?.focus();
//       return;
//     }

//     const payload = { query: finalQ, lat: String(lat), lon: String(lon) };
//     pushRecent(finalQ, String(lat), String(lon));

//     const params = new URLSearchParams(payload).toString();
//     navigate(`/results?${params}`);
//   }

//   function useMyLocation() {
//     if (!navigator.geolocation) {
//       alert("Geolocation not supported");
//       return;
//     }
//     navigator.geolocation.getCurrentPosition(
//       (pos) => {
//         setLat(pos.coords.latitude.toFixed(6));
//         setLon(pos.coords.longitude.toFixed(6));
//         setMsg("Location updated from device");
//       },
//       (err) => alert(err.message),
//       { enableHighAccuracy: true }
//     );
//   }

//   function saveLocation(name) {
//     if (!name) {
//       setMsg("Provide a name for the saved location");
//       return;
//     }
//     const latVal = String(lat);
//     const lonVal = String(lon);

//     const exists = savedLocations.find(
//       (s) => s.name === name && s.lat === latVal && s.lon === lonVal
//     );
//     if (exists) {
//       setMsg("Location already saved");
//       return;
//     }

//     const next = [{ name, lat: latVal, lon: lonVal }, ...savedLocations].slice(
//       0,
//       10
//     );
//     setSavedLocations(next);
//     localStorage.setItem(SAVED_LOCATIONS_KEY, JSON.stringify(next));
//     setMsg("Location saved");
//   }

//   function removeSavedLocation(name) {
//     const next = savedLocations.filter((s) => s.name !== name);
//     setSavedLocations(next);
//     localStorage.setItem(SAVED_LOCATIONS_KEY, JSON.stringify(next));
//     setMsg("Saved location removed");
//   }

//   function useSavedLocation(s) {
//     setLat(s.lat);
//     setLon(s.lon);
//     setMsg(`Using saved location: ${s.name}`);
//   }

//   function onKeyDown(e) {
//     if (e.key === "Enter") {
//       e.preventDefault();
//       submit();
//     }
//   }

//   return (
//     <div className="space-y-6">

//       {/* 🔥 PROFILE-AWARE SERVICE RECOMMENDATIONS */}
//       <ServiceRecommendations />

//       {/* PRIMARY SEARCH */}
//       <div className="bg-white p-6 rounded shadow-sm card fade-in-up">
//         <h2 className="text-xl font-semibold mb-2">
//           Find city services near you
//         </h2>

//         <div className="flex gap-2">
//           <input
//             ref={queryRef}
//             value={query}
//             onChange={(e) => setQuery(e.target.value)}
//             onKeyDown={onKeyDown}
//             placeholder="Search (e.g., hospital, police)"
//             className="flex-1 border rounded px-3 py-2"
//           />
//           <button className="btn" onClick={() => submit()}>
//             Search
//           </button>
//         </div>

//         {suggestions.length > 0 && (
//           <div className="mt-2 flex gap-2 flex-wrap">
//             {suggestions.map((s) => (
//               <button
//                 key={s}
//                 className="btn-ghost"
//                 onClick={() => {
//                   setQuery(s);
//                   submit(s);
//                 }}
//               >
//                 {s}
//               </button>
//             ))}
//           </div>
//         )}

//         <div className="mt-3 flex gap-2 items-center">
//           <input
//             className="w-36 border rounded px-2 py-1"
//             value={lat}
//             onChange={(e) => setLat(e.target.value)}
//           />
//           <input
//             className="w-36 border rounded px-2 py-1"
//             value={lon}
//             onChange={(e) => setLon(e.target.value)}
//           />
//           <button className="btn-ghost" onClick={useMyLocation}>
//             Use my location
//           </button>
//         </div>

//         <div className="mt-4">
//           <div className="text-sm text-gray-600 mb-2">Quick categories</div>
//           <div className="flex flex-wrap gap-2">
//             {CATEGORIES.map((cat) => (
//               <CategoryChip
//                 key={cat}
//                 label={cat}
//                 onClick={() => submit(cat)}
//               />
//             ))}
//           </div>
//         </div>
//       </div>

//       {/* SAVED LOCATIONS */}
//       <div className="bg-white p-6 rounded shadow-sm card fade-in-up">
//         <h3 className="font-semibold mb-2">Saved locations</h3>
//         {savedLocations.length === 0 ? (
//           <div className="text-sm text-gray-500">
//             No saved locations yet.
//           </div>
//         ) : (
//           <div className="flex gap-2 flex-wrap">
//             {savedLocations.map((s) => (
//               <div key={s.name} className="flex gap-2 items-center">
//                 <button className="btn-ghost" onClick={() => useSavedLocation(s)}>
//                   {s.name}
//                 </button>
//                 <button
//                   className="btn-ghost"
//                   onClick={() => removeSavedLocation(s.name)}
//                 >
//                   Remove
//                 </button>
//               </div>
//             ))}
//           </div>
//         )}
//       </div>

//       {/* TOAST MESSAGE */}
//       {msg && (
//         <div
//           className="fade-in-up"
//           style={{
//             position: "fixed",
//             right: 20,
//             bottom: 20,
//             background: "#0ea5a3",
//             color: "white",
//             padding: "8px 12px",
//             borderRadius: 8
//           }}
//         >
//           {msg}
//         </div>
//       )}
//     </div>
//   );
// }



// src/pages/Home.jsx
// src/pages/Home.jsx
// src/pages/Home.jsx
import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import ServiceRecommendations from "../components/ServiceRecommendations";

const CATEGORIES = [
  "Hospital",
  "Police",
  "Pharmacy",
  "Transport",
  "Government Office",
  "Tourism"
];

const SAVED_LOCATIONS_KEY = "smartcity_saved_locations";

export default function Home() {
  const [query, setQuery] = useState("");
  const [lat, setLat] = useState("17.3850"); // hidden
  const [lon, setLon] = useState("78.4867"); // hidden
  const [manualLocation, setManualLocation] = useState("");
  const [savedLocations, setSavedLocations] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(SAVED_LOCATIONS_KEY) || "[]");
    } catch {
      return [];
    }
  });
  const [msg, setMsg] = useState(null);

  const navigate = useNavigate();
  const categoryRef = useRef(null);

  /* ------------------------------
     Auto-hide toast
  ------------------------------ */
  useEffect(() => {
    if (!msg) return;
    const t = setTimeout(() => setMsg(null), 3000);
    return () => clearTimeout(t);
  }, [msg]);

  /* ------------------------------
     Manual location → lat/lon
  ------------------------------ */
  async function resolveLocation() {
    if (!manualLocation.trim()) {
      setMsg("Enter a location name");
      return;
    }

    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          manualLocation
        )}`
      );
      const data = await res.json();

      if (!data.length) {
        setMsg("Location not found");
        return;
      }

      setLat(parseFloat(data[0].lat).toFixed(6));
      setLon(parseFloat(data[0].lon).toFixed(6));
      setMsg("Location detected successfully");
    } catch {
      setMsg("Failed to resolve location");
    }
  }

  /* ------------------------------
     Use device location
  ------------------------------ */
  function useMyLocation() {
    if (!navigator.geolocation) {
      setMsg("Geolocation not supported");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLat(pos.coords.latitude.toFixed(6));
        setLon(pos.coords.longitude.toFixed(6));
        setMsg("Using your current location");
      },
      (err) => setMsg(err.message),
      { enableHighAccuracy: true }
    );
  }

  /* ------------------------------
     Submit search
  ------------------------------ */
  function submit() {
    if (!query) {
      setMsg("Please select a service category");
      categoryRef.current?.focus();
      return;
    }

    const params = new URLSearchParams({
      query,
      lat,
      lon
    }).toString();

    navigate(`/results?${params}`);
  }

  return (
    <div className="space-y-10">

      {/* 🔍 SEARCH FIRST */}
      <div className="glass-card search-card fade-in-scale">
        <h2 className="title">Find city services near you</h2>

        <div className="form-group">
          <label>Service category</label>
          <select
            ref={categoryRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          >
            <option value="">Select a category</option>
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>

        <div className="form-group horizontal">
          <input
            placeholder="Enter location (e.g., Gachibowli)"
            value={manualLocation}
            onChange={(e) => setManualLocation(e.target.value)}
          />
          <button className="btn" onClick={resolveLocation}>
            Locate
          </button>
        </div>

        <div className="form-group">
          <button className="btn-ghost" onClick={useMyLocation}>
            Use my current location
          </button>
        </div>

        <button className="btn primary" onClick={submit}>
          Search
        </button>
      </div>

      {/* 🤖 RECOMMENDATIONS SECOND */}
      <ServiceRecommendations />

      {/* 💾 SAVED LOCATIONS */}
      <div className="glass-card fade-in-up">
        <h3 className="font-semibold mb-2">Saved locations</h3>

        {savedLocations.length === 0 ? (
          <div className="text-muted">No saved locations yet.</div>
        ) : (
          <div className="flex gap-2 flex-wrap">
            {savedLocations.map((s) => (
              <button
                key={s.name}
                className="btn-ghost"
                onClick={() => {
                  setLat(s.lat);
                  setLon(s.lon);
                  setMsg(`Using saved location: ${s.name}`);
                }}
              >
                {s.name}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* 🔔 TOAST */}
      {msg && (
        <div className="toast fade-in-up">
          {msg}
        </div>
      )}
    </div>
  );
}
