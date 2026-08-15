// import React, { useEffect, useState, useMemo, useRef } from "react";
// import { MapContainer, TileLayer, Marker, Popup, Circle, Polyline } from "react-leaflet";
// import L from "leaflet";
// import "leaflet/dist/leaflet.css";

// import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
// import markerIcon from "leaflet/dist/images/marker-icon.png";
// import markerShadow from "leaflet/dist/images/marker-shadow.png";

// delete L.Icon.Default.prototype._getIconUrl;
// L.Icon.Default.mergeOptions({
//   iconRetinaUrl: markerIcon2x,
//   iconUrl: markerIcon,
//   shadowUrl: markerShadow,
// });

// function parseNum(v) {
//   if (v === undefined || v === null) return null;
//   const n = typeof v === "number" ? v : parseFloat(v);
//   return Number.isFinite(n) ? n : null;
// }

// export default function MapView({ onLocation, userCoords, places = [], selectedPlace, onSelectPlace }) {
//   const [status, setStatus] = useState("idle");
//   const [map, setMap] = useState(null);
//   const markerRefs = useRef({});

//   useEffect(() => {
//     if (!userCoords && "geolocation" in navigator) {
//       setStatus("requesting-permission");
//       navigator.geolocation.getCurrentPosition(
//         (p) => {
//           const coords = {
//             lat: p.coords.latitude,
//             lon: p.coords.longitude,
//             accuracy: p.coords.accuracy || 0,
//           };
//           setStatus("ok");
//           onLocation && onLocation(coords);
//         },
//         () => setStatus("denied"),
//         { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
//       );
//     }
//   }, []);

//   const center = userCoords ? [userCoords.lat, userCoords.lon] : [17.3850, 78.4867];

//   const mergedPlaces = useMemo(() => {
//     const arr = Array.isArray(places) ? places.slice() : [];
//     if (selectedPlace) {
//       const id = selectedPlace.business_id ?? selectedPlace.display_name;
//       const exists = arr.some(p => p.business_id === id || p.display_name === id);
//       if (!exists) arr.unshift(selectedPlace);
//     }
//     return arr;
//   }, [places, selectedPlace]);

//   const markers = useMemo(() => {
//     return mergedPlaces.map((p, i) => {
//       const lat = parseNum(p.latitude ?? p.lat);
//       const lon = parseNum(p.longitude ?? p.lon);
//       if (!Number.isFinite(lat) || !Number.isFinite(lon)) return null;

//       return {
//         id: p.business_id ?? `place-${i}`,
//         lat,
//         lon,
//         name: p.display_name || p.name,
//         raw: p,
//       };
//     }).filter(Boolean);
//   }, [mergedPlaces]);

//   function openGoogleDirections(place) {
//     if (!userCoords) {
//       alert("User location not available");
//       return;
//     }
//     const dLat = parseNum(place.latitude ?? place.lat);
//     const dLon = parseNum(place.longitude ?? place.lon);
//     if (!Number.isFinite(dLat) || !Number.isFinite(dLon)) {
//       alert("Destination coordinates missing");
//       return;
//     }
//     const url =
//       `https://www.google.com/maps/dir/?api=1` +
//       `&origin=${userCoords.lat},${userCoords.lon}` +
//       `&destination=${dLat},${dLon}` +
//       `&travelmode=driving`;

//     window.open(url, "_blank");
//   }

//   const routePositions = useMemo(() => {
//     if (!userCoords || !selectedPlace) return null;
//     const lat = parseNum(selectedPlace.latitude ?? selectedPlace.lat);
//     const lon = parseNum(selectedPlace.longitude ?? selectedPlace.lon);
//     if (!Number.isFinite(lat) || !Number.isFinite(lon)) return null;
//     return [[userCoords.lat, userCoords.lon], [lat, lon]];
//   }, [userCoords, selectedPlace]);

//   return (
//     <div>
//       <div className="bg-gray-100 p-3 rounded text-sm mb-3">
//         <b>Map status:</b> {status} •{" "}
//         {userCoords ? `Lat ${userCoords.lat.toFixed(5)}, Lon ${userCoords.lon.toFixed(5)}` : "No GPS yet"}
//       </div>

//       <div style={{ height: 420 }}>
//         <MapContainer
//           center={center}
//           zoom={14}
//           style={{ height: "100%", width: "100%" }}
//           whenCreated={setMap}
//         >
//           <TileLayer
//             attribution="&copy; OpenStreetMap contributors"
//             url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
//           />

//           {userCoords && (
//             <>
//               <Marker position={[userCoords.lat, userCoords.lon]}>
//                 <Popup>You are here</Popup>
//               </Marker>
//               {userCoords.accuracy && (
//                 <Circle center={[userCoords.lat, userCoords.lon]} radius={userCoords.accuracy} />
//               )}
//             </>
//           )}

//           {markers.map((m) => (
//             <Marker
//               key={m.id}
//               position={[m.lat, m.lon]}
//               ref={(el) => (markerRefs.current[m.id] = el)}
//               eventHandlers={{
//                 click: () => onSelectPlace && onSelectPlace(m.raw),
//               }}
//             >
//               <Popup>
//                 <b>{m.name}</b>
//                 <br />
//                 <div className="mt-2 flex gap-2">
//                   <button
//                     onClick={() => onSelectPlace && onSelectPlace(m.raw)}
//                     className="bg-blue-600 text-white px-2 py-1 rounded text-xs"
//                   >
//                     Select
//                   </button>
//                   <button
//                     onClick={() => openGoogleDirections(m.raw)}
//                     className="bg-green-600 text-white px-2 py-1 rounded text-xs"
//                   >
//                     Directions
//                   </button>
//                 </div>
//               </Popup>
//             </Marker>
//           ))}

//           {routePositions && (
//             <Polyline positions={routePositions} pathOptions={{ dashArray: "6 8" }} />
//           )}
//         </MapContainer>
//       </div>
//     </div>
//   );
// }


import React, { useEffect, useState, useMemo, useRef } from "react";
import { MapContainer, TileLayer, Marker, Popup, Circle, Polyline } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

// Fix Leaflet icon issue
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

function parseNum(v) {
  if (v === undefined || v === null) return null;
  const n = typeof v === "number" ? v : parseFloat(v);
  return Number.isFinite(n) ? n : null;
}

export default function MapView({
  onLocation,
  userCoords,
  places = [],
  selectedPlace,
  onSelectPlace,
}) {
  const [status, setStatus] = useState("idle");
  const markerRefs = useRef({});

  // --------------------------------------------------
  // Get user location (only if not already provided)
  // --------------------------------------------------
  useEffect(() => {
    if (!userCoords && "geolocation" in navigator) {
      setStatus("requesting");
      navigator.geolocation.getCurrentPosition(
        (p) => {
          const coords = {
            lat: p.coords.latitude,
            lon: p.coords.longitude,
            accuracy: p.coords.accuracy || 0,
          };
          setStatus("ok");
          onLocation && onLocation(coords);
        },
        () => setStatus("denied"),
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
      );
    }
  }, [userCoords, onLocation]);

  const center = userCoords
    ? [userCoords.lat, userCoords.lon]
    : [17.3850, 78.4867]; // Hyderabad fallback

  // --------------------------------------------------
  // Merge selected place into places list
  // --------------------------------------------------
  const mergedPlaces = useMemo(() => {
    const arr = Array.isArray(places) ? [...places] : [];
    if (selectedPlace) {
      const id = selectedPlace.business_id ?? selectedPlace.name;
      const exists = arr.some(
        (p) => p.business_id === id || p.name === id
      );
      if (!exists) arr.unshift(selectedPlace);
    }
    return arr;
  }, [places, selectedPlace]);

  const markers = useMemo(() => {
    return mergedPlaces
      .map((p, i) => {
        const lat = parseNum(p.latitude ?? p.lat);
        const lon = parseNum(p.longitude ?? p.lon);
        if (!Number.isFinite(lat) || !Number.isFinite(lon)) return null;

        return {
          id: p.business_id ?? `place-${i}`,
          lat,
          lon,
          name: p.display_name || p.name,
          raw: p,
        };
      })
      .filter(Boolean);
  }, [mergedPlaces]);

  // --------------------------------------------------
  // Google Maps directions (SAFE fallback)
  // --------------------------------------------------
  function openGoogleDirections(place) {
    const dLat = parseNum(place.latitude ?? place.lat);
    const dLon = parseNum(place.longitude ?? place.lon);
    if (!Number.isFinite(dLat) || !Number.isFinite(dLon)) {
      alert("Destination location unavailable");
      return;
    }

    const url = userCoords
      ? `https://www.google.com/maps/dir/?api=1&origin=${userCoords.lat},${userCoords.lon}&destination=${dLat},${dLon}&travelmode=driving`
      : `https://www.google.com/maps/dir/?api=1&destination=${dLat},${dLon}`;

    window.open(url, "_blank");
  }

  // --------------------------------------------------
  // Straight-line route (visual only)
  // --------------------------------------------------
  const routePositions = useMemo(() => {
    if (!userCoords || !selectedPlace) return null;
    const lat = parseNum(selectedPlace.latitude ?? selectedPlace.lat);
    const lon = parseNum(selectedPlace.longitude ?? selectedPlace.lon);
    if (!Number.isFinite(lat) || !Number.isFinite(lon)) return null;
    return [
      [userCoords.lat, userCoords.lon],
      [lat, lon],
    ];
  }, [userCoords, selectedPlace]);

  return (
    <div>
      {/* User-friendly status */}
      <div className="bg-gray-100 p-3 rounded text-sm mb-3">
        {status === "requesting" && "Requesting location access…"}
        {status === "denied" && "Location permission denied"}
        {status === "ok" && userCoords && (
          <>
            Your location: {userCoords.lat.toFixed(4)}, {userCoords.lon.toFixed(4)}
          </>
        )}
      </div>

      <div style={{ height: 420 }}>
        <MapContainer center={center} zoom={14} style={{ height: "100%", width: "100%" }}>
          <TileLayer
            attribution="&copy; OpenStreetMap contributors"
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {/* User marker */}
          {userCoords && (
            <>
              <Marker position={[userCoords.lat, userCoords.lon]}>
                <Popup>You are here</Popup>
              </Marker>
              {userCoords.accuracy && (
                <Circle
                  center={[userCoords.lat, userCoords.lon]}
                  radius={userCoords.accuracy}
                />
              )}
            </>
          )}

          {/* Place markers */}
          {markers.map((m) => (
            <Marker
              key={m.id}
              position={[m.lat, m.lon]}
              ref={(el) => (markerRefs.current[m.id] = el)}
              eventHandlers={{
                click: () => onSelectPlace && onSelectPlace(m.raw),
              }}
            >
              <Popup>
                <b>{m.name}</b>
                <div className="mt-2 flex gap-2">
                  <button
                    onClick={() => onSelectPlace && onSelectPlace(m.raw)}
                    className="bg-blue-600 text-white px-2 py-1 rounded text-xs"
                  >
                    Select
                  </button>
                  <button
                    onClick={() => openGoogleDirections(m.raw)}
                    className="bg-green-600 text-white px-2 py-1 rounded text-xs"
                  >
                    Directions
                  </button>
                </div>
              </Popup>
            </Marker>
          ))}

          {/* Visual straight-line route */}
          {routePositions && (
            <Polyline positions={routePositions} pathOptions={{ dashArray: "6 8" }} />
          )}
        </MapContainer>
      </div>
    </div>
  );
}
