// import React from "react";
// import { Link } from "react-router-dom";

// export default function ServiceCard({ item, userCoords }) {
//   const {
//     business_id,
//     name,
//     categories,
//     rating,
//     review_count,
//     distance_km,
//     latitude,
//     longitude,
//   } = item;

//   const mapsUrl = userCoords
//     ? `https://www.google.com/maps/dir/?api=1&origin=${userCoords.lat},${userCoords.lon}&destination=${latitude},${longitude}&travelmode=driving`
//     : `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`;

//   return (
//     <div className="p-4 bg-white rounded shadow-sm">
//       <div className="flex justify-between items-start gap-3">
//         <div>
//           <div className="font-semibold text-lg">{name}</div>
//           <div className="text-sm text-gray-500">{categories}</div>
//         </div>
//         <div className="text-right">
//           <div className="text-sm">⭐ {rating ?? "-"}</div>
//           <div className="text-xs text-gray-500">
//             Approx. distance: {distance_km} km
//           </div>
//         </div>
//       </div>

//       <div className="mt-3 flex gap-2">
//         <a
//           href={mapsUrl}
//           target="_blank"
//           rel="noreferrer"
//           className="px-3 py-1 border rounded text-sm"
//         >
//           Locate
//         </a>

//         <Link
//           to={`/service/${business_id}`}
//           className="px-3 py-1 bg-sky-600 text-white rounded text-sm"
//         >
//           Details
//         </Link>
//       </div>
//     </div>
//   );
// }


import React from "react";
import { Link } from "react-router-dom";

export default function ServiceCard({ item, userCoords }) {
  if (!item) return null;

  const {
    business_id,
    name,
    display_name,
    categories,
    categories_display,
    rating,
    review_count,
    distance_km,
    latitude,
    longitude,
  } = item;

  const hasCoords =
    Number.isFinite(latitude) && Number.isFinite(longitude);

  const mapsUrl = hasCoords
    ? userCoords
      ? `https://www.google.com/maps/dir/?api=1&origin=${userCoords.lat},${userCoords.lon}&destination=${latitude},${longitude}&travelmode=driving`
      : `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`
    : null;

  return (
    <div className="p-4 bg-white rounded shadow-sm">
      <div className="flex justify-between items-start gap-3">
        <div>
          <div className="font-semibold text-lg">
            {display_name || name || "Place"}
          </div>
          <div className="text-sm text-gray-500">
            {categories_display || categories}
          </div>
        </div>

        <div className="text-right">
          <div className="text-sm">
            ⭐ {rating ?? "N/A"}
            {Number.isFinite(review_count) && ` (${review_count})`}
          </div>

          {/* ✅ Clarified distance */}
          <div className="text-xs text-gray-500">
            Approx. distance:{" "}
            {Number.isFinite(distance_km) ? distance_km : "?"} km
          </div>
        </div>
      </div>

      <div className="mt-3 flex gap-2">
        {/* ✅ Google Maps Directions */}
        {mapsUrl && (
          <a
            href={mapsUrl}
            target="_blank"
            rel="noreferrer"
            className="px-3 py-1 border rounded text-sm"
          >
            Locate
          </a>
        )}

        {/* Optional details page */}
        {business_id && (
          <Link
            to={`/service/${business_id}`}
            className="px-3 py-1 bg-sky-600 text-white rounded text-sm"
          >
            Details
          </Link>
        )}
      </div>
    </div>
  );
}
