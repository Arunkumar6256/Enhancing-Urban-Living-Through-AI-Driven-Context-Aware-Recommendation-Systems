// import React from 'react'

// export default function ResultsList({results}){
//   if(!results || results.length===0) return <div>No results</div>
//   return (
//     <div className="space-y-3">
//       {results.map(r => (
//         <div key={r.business_id} className="p-4 border rounded shadow-sm bg-white">
//           <div className="flex justify-between items-center">
//             <div>
//               <div className="font-semibold">{r.name}</div>
//               <div className="text-sm text-gray-600">{r.categories}</div>
//             </div>
//             <div className="text-right text-sm">
//               <div>⭐ {r.rating} ({r.review_count})</div>
//               <div className="text-gray-500">{r.distance_km} km</div>
//             </div>
//           </div>
//           <div className="mt-2 text-sm text-gray-700">Score: {r.hybrid_score}</div>
//           <div className="mt-2 space-x-2">
//             <a className="text-sm text-sky-600" href={`https://www.google.com/maps/search/?api=1&query=${r.latitude},${r.longitude}`} target="_blank" rel="noreferrer">Directions</a>
//           </div>
//         </div>
//       ))}
//     </div>
//   )
// }
import React from "react";

export default function ResultsList({ results, userCoords }) {
  if (!results || results.length === 0) {
    return <div>No results</div>;
  }

  function openGoogleMaps(r) {
    if (!r?.latitude || !r?.longitude) return;

    const url = userCoords
      ? `https://www.google.com/maps/dir/?api=1&origin=${userCoords.lat},${userCoords.lon}&destination=${r.latitude},${r.longitude}&travelmode=driving`
      : `https://www.google.com/maps/dir/?api=1&destination=${r.latitude},${r.longitude}`;

    window.open(url, "_blank");
  }

  return (
    <div className="space-y-3">
      {results.map((r) => (
        <div
          key={r.business_id}
          className="p-4 border rounded shadow-sm bg-white"
        >
          <div className="flex justify-between items-center">
            <div>
              <div className="font-semibold">
                {r.display_name || r.name}
              </div>
              <div className="text-sm text-gray-600">
                {r.categories_display || r.categories}
              </div>
            </div>

            <div className="text-right text-sm">
              <div>
                ⭐ {r.rating ?? "N/A"} ({r.review_count ?? 0})
              </div>

              {/* 🔧 FIX: clarify distance */}
              <div className="text-gray-500">
                Approx. distance:{" "}
                {Number.isFinite(r.distance_km) ? r.distance_km : "?"} km
              </div>
            </div>
          </div>

          {r.hybrid_score !== undefined && (
            <div className="mt-2 text-sm text-gray-700">
              Score: {r.hybrid_score}
            </div>
          )}

          <div className="mt-3 space-x-3">
            {/* 🔧 FIX: Proper Directions */}
            <button
              onClick={() => openGoogleMaps(r)}
              className="text-sm text-sky-600 hover:underline"
            >
              Locate
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
