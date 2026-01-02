// import React, { useEffect, useState, useMemo, useRef } from "react";
// import { MapContainer, TileLayer, Marker, Popup, Circle, Polyline } from "react-leaflet";
// import L from "leaflet";
// import "leaflet/dist/leaflet.css";

// import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
// import markerIcon from "leaflet/dist/images/marker-icon.png";
// import markerShadow from "leaflet/dist/images/marker-shadow.png";

// delete L.Icon.Default.prototype._getIconUrl;
// L.Icon.Default.mergeOptions({ iconRetinaUrl: markerIcon2x, iconUrl: markerIcon, shadowUrl: markerShadow });

// function parseNum(v) {
//   if (v === undefined || v === null) return null;
//   if (typeof v === "number") return Number.isFinite(v) ? v : null;
//   const n = parseFloat(String(v).replace(",", "."));
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
//           const coords = { lat: p.coords.latitude, lon: p.coords.longitude, accuracy: p.coords.accuracy || 0 };
//           setStatus("ok");
//           if (onLocation) onLocation(coords);
//         },
//         (err) => {
//           console.warn("geolocation error:", err);
//           setStatus("denied");
//         },
//         { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
//       );
//     }
//   }, []);

//   const center = userCoords ? [userCoords.lat, userCoords.lon] : [17.3850, 78.4867];

//   const mergedPlaces = useMemo(() => {
//     const arr = Array.isArray(places) ? places.slice() : [];
//     if (selectedPlace) {
//       const selId = selectedPlace.business_id ?? selectedPlace.place_id ?? selectedPlace.display_name;
//       const exists = arr.some((x) => (x.business_id && selId && x.business_id === selId) || x.display_name === selId);
//       if (!exists) arr.unshift(selectedPlace);
//     }
//     return arr;
//   }, [places, selectedPlace]);

//   const markers = useMemo(() => {
//     return (mergedPlaces || []).map((p, i) => {
//       const latCandidates = [p.latitude, p.lat, p.y, p.latitud, p._lat, p.location?.[0]];
//       const lonCandidates = [p.longitude, p.lon, p.x, p.lng, p.long, p._lon, p.location?.[1]];

//       let lat = null, lon = null;
//       for (const c of latCandidates) { lat = parseNum(c); if (lat !== null) break; }
//       for (const c of lonCandidates) { lon = parseNum(c); if (lon !== null) break; }

//       if ((lat === null || lon === null) && p.geometry && Array.isArray(p.geometry.coordinates)) {
//         lon = lon ?? parseNum(p.geometry.coordinates[0]);
//         lat = lat ?? parseNum(p.geometry.coordinates[1]);
//       }
//       if ((lat === null || lon === null) && p.coords) {
//         lat = lat ?? parseNum(p.coords.lat ?? p.coords.latitude);
//         lon = lon ?? parseNum(p.coords.lon ?? p.coords.longitude);
//       }

//       const id = p.business_id ?? p.place_id ?? p.display_name ?? `place-${i}`;
//       return { id, lat, lon, name: p.display_name || p.name || id, raw: p };
//     }).filter(m => Number.isFinite(m.lat) && Number.isFinite(m.lon));
//   }, [mergedPlaces]);

//   useEffect(() => { console.log("MapView: mergedPlaces:", mergedPlaces); console.log("MapView: markers:", markers); }, [mergedPlaces, markers]);

//   const routePositions = useMemo(() => {
//     if (!userCoords || !selectedPlace) return null;
//     const spLat = parseNum(selectedPlace.latitude ?? selectedPlace.lat ?? selectedPlace.y ?? selectedPlace.latitud ?? selectedPlace._lat);
//     const spLon = parseNum(selectedPlace.longitude ?? selectedPlace.lon ?? selectedPlace.x ?? selectedPlace.lng ?? selectedPlace._lon);
//     if (!Number.isFinite(spLat) || !Number.isFinite(spLon)) return null;
//     return [[userCoords.lat, userCoords.lon], [spLat, spLon]];
//   }, [userCoords, selectedPlace]);

//   useEffect(() => {
//     if (!map) return;
//     try { map.invalidateSize(); } catch (e) { /* ignore */ }
//   }, [map, markers.length, selectedPlace]);

//   useEffect(() => {
//     if (!map || !selectedPlace) return;
//     const spLat = parseNum(selectedPlace.latitude ?? selectedPlace.lat ?? selectedPlace.y ?? selectedPlace.latitud ?? selectedPlace._lat);
//     const spLon = parseNum(selectedPlace.longitude ?? selectedPlace.lon ?? selectedPlace.x ?? selectedPlace.lng ?? selectedPlace._lon);

//     console.log("MapView: selectedPlace changed:", selectedPlace);
//     console.log("MapView: parsed selected coords:", { spLat, spLon });

//     if (!Number.isFinite(spLat) || !Number.isFinite(spLon)) {
//       console.warn("MapView: selectedPlace has no numeric coords, will not fly. Creating temporary marker at fallback (if possible).");
//       return;
//     }

//     try { map.flyTo([spLat, spLon], 16, { duration: 0.8 }); } catch (e) { console.warn("flyTo failed:", e); }

//     // try to open popup via stored marker refs
//     const id = selectedPlace.business_id ?? selectedPlace.place_id ?? selectedPlace.display_name;
//     setTimeout(() => {
//       const marker = markerRefs.current[id];
//       console.log("MapView: trying to open popup for id:", id, "markerRef:", marker);
//       if (marker && typeof marker.openPopup === "function") {
//         try { marker.openPopup(); return; } catch (e) { console.warn("openPopup direct failed:", e); }
//       }
//       // fallback: find any marker close to coords and open its popup
//       for (const key of Object.keys(markerRefs.current)) {
//         const m = markerRefs.current[key];
//         try {
//           const latlng = m?.getLatLng && m.getLatLng();
//           if (latlng && Math.abs(latlng.lat - spLat) < 1e-4 && Math.abs(latlng.lng - spLon) < 1e-4) {
//             if (typeof m.openPopup === "function") try { m.openPopup(); return; } catch (e) { /* ignore */ }
//           }
//         } catch (e) { /* ignore */ }
//       }
//     }, 900);
//   }, [map, selectedPlace]);

//   function haversineKm(aLat, aLon, bLat, bLon) {
//     const toRad = (d) => (d * Math.PI) / 180.0;
//     const R = 6371;
//     const dLat = toRad(bLat - aLat);
//     const dLon = toRad(bLon - aLon);
//     const lat1 = toRad(aLat); const lat2 = toRad(bLat);
//     const h = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;
//     const c = 2 * Math.asin(Math.sqrt(h));
//     return R * c;
//   }

//   return (
//     <div>
//       <div className="bg-gray-100 p-3 rounded text-sm mb-3">
//         <b>Map status:</b> {status} • {userCoords ? `Lat ${userCoords.lat.toFixed(6)} Lon ${userCoords.lon.toFixed(6)}` : "No GPS yet"}
//       </div>

//       <div style={{ height: 420, width: "100%" }}>
//         <MapContainer center={center} zoom={14} style={{ height: "100%", width: "100%" }} whenCreated={(m) => { setMap(m); console.log("MapView: map created"); }}>
//           <TileLayer attribution='&copy; OpenStreetMap contributors' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

//           {userCoords && (
//             <>
//               <Marker position={[userCoords.lat, userCoords.lon]}>
//                 <Popup>You are here<br />Accuracy: {userCoords.accuracy ? `${Math.round(userCoords.accuracy)} m` : "n/a"}</Popup>
//               </Marker>
//               {userCoords.accuracy && <Circle center={[userCoords.lat, userCoords.lon]} radius={userCoords.accuracy} />}
//             </>
//           )}

//           {markers.map((m) => (
//             <Marker key={m.id} position={[m.lat, m.lon]} ref={(el) => { try { if (el && el.getElement) markerRefs.current[m.id] = el; else markerRefs.current[m.id] = el; } catch (e) { markerRefs.current[m.id] = el; } }} eventHandlers={{ click: () => { if (onSelectPlace) onSelectPlace(m.raw); } }}>
//               <Popup>
//                 <div>
//                   <b>{m.name}</b><br />
//                   <div className="text-xs text-gray-600">coords: {m.lat}, {m.lon}</div>
//                   <div style={{ marginTop: 6 }}>
//                     <button onClick={(ev) => { ev.preventDefault(); ev.stopPropagation(); if (onSelectPlace) onSelectPlace(m.raw); }} className="bg-blue-600 text-white px-2 py-1 rounded text-xs">Route here</button>
//                   </div>
//                 </div>
//               </Popup>
//             </Marker>
//           ))}

//           {routePositions && (
//             <>
//               <Polyline positions={routePositions} pathOptions={{ weight: 4, dashArray: "6 8" }} />
//               <Marker position={[(routePositions[0][0] + routePositions[1][0]) / 2, (routePositions[0][1] + routePositions[1][1]) / 2]}>
//                 <Popup>Direct distance: {haversineKm(routePositions[0][0], routePositions[0][1], routePositions[1][0], routePositions[1][1]).toFixed(2)} km</Popup>
//               </Marker>
//             </>
//           )}

//           {/* Visual highlight for selected place even if marker not found */}
//           {selectedPlace && (() => {
//             const spLat = parseNum(selectedPlace.latitude ?? selectedPlace.lat ?? selectedPlace.y ?? selectedPlace.latitud ?? selectedPlace._lat);
//             const spLon = parseNum(selectedPlace.longitude ?? selectedPlace.lon ?? selectedPlace.x ?? selectedPlace.lng ?? selectedPlace._lon);
//             if (Number.isFinite(spLat) && Number.isFinite(spLon)) {
//               return <Circle center={[spLat, spLon]} pathOptions={{ color: "red" }} radius={40} />;
//             }
//             return null;
//           })()}
//         </MapContainer>
//       </div>
//     </div>
//   );
  
// }

// src/components/MapView.jsx
import React, { useEffect, useState, useMemo, useRef } from "react";
import { MapContainer, TileLayer, Marker, Popup, Circle, Polyline } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

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

export default function MapView({ onLocation, userCoords, places = [], selectedPlace, onSelectPlace }) {
  const [status, setStatus] = useState("idle");
  const [map, setMap] = useState(null);
  const markerRefs = useRef({});

  /* ------------------ GET REAL USER LOCATION ------------------ */
  useEffect(() => {
    if (!userCoords && "geolocation" in navigator) {
      setStatus("requesting-permission");
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
  }, []);

  const center = userCoords ? [userCoords.lat, userCoords.lon] : [17.3850, 78.4867];

  /* ------------------ MERGE SELECTED PLACE ------------------ */
  const mergedPlaces = useMemo(() => {
    const arr = Array.isArray(places) ? places.slice() : [];
    if (selectedPlace) {
      const id = selectedPlace.business_id ?? selectedPlace.display_name;
      const exists = arr.some(p => p.business_id === id || p.display_name === id);
      if (!exists) arr.unshift(selectedPlace);
    }
    return arr;
  }, [places, selectedPlace]);

  /* ------------------ BUILD MARKERS ------------------ */
  const markers = useMemo(() => {
    return mergedPlaces.map((p, i) => {
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
    }).filter(Boolean);
  }, [mergedPlaces]);

  /* ------------------ OPEN GOOGLE MAPS DIRECTIONS ------------------ */
  function openGoogleDirections(place) {
    if (!userCoords) {
      alert("User location not available");
      return;
    }

    const dLat = parseNum(place.latitude ?? place.lat);
    const dLon = parseNum(place.longitude ?? place.lon);
    if (!Number.isFinite(dLat) || !Number.isFinite(dLon)) {
      alert("Destination coordinates missing");
      return;
    }

    const url =
      `https://www.google.com/maps/dir/?api=1` +
      `&origin=${userCoords.lat},${userCoords.lon}` +
      `&destination=${dLat},${dLon}` +
      `&travelmode=driving`;

    window.open(url, "_blank");
  }

  /* ------------------ STRAIGHT LINE (VISUAL ONLY) ------------------ */
  const routePositions = useMemo(() => {
    if (!userCoords || !selectedPlace) return null;
    const lat = parseNum(selectedPlace.latitude ?? selectedPlace.lat);
    const lon = parseNum(selectedPlace.longitude ?? selectedPlace.lon);
    if (!Number.isFinite(lat) || !Number.isFinite(lon)) return null;
    return [[userCoords.lat, userCoords.lon], [lat, lon]];
  }, [userCoords, selectedPlace]);

  return (
    <div>
      <div className="bg-gray-100 p-3 rounded text-sm mb-3">
        <b>Map status:</b> {status} •{" "}
        {userCoords ? `Lat ${userCoords.lat.toFixed(5)}, Lon ${userCoords.lon.toFixed(5)}` : "No GPS yet"}
      </div>

      <div style={{ height: 420 }}>
        <MapContainer
          center={center}
          zoom={14}
          style={{ height: "100%", width: "100%" }}
          whenCreated={setMap}
        >
          <TileLayer
            attribution="&copy; OpenStreetMap contributors"
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {/* USER LOCATION */}
          {userCoords && (
            <>
              <Marker position={[userCoords.lat, userCoords.lon]}>
                <Popup>You are here</Popup>
              </Marker>
              {userCoords.accuracy && (
                <Circle center={[userCoords.lat, userCoords.lon]} radius={userCoords.accuracy} />
              )}
            </>
          )}

          {/* PLACE MARKERS */}
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
                <br />
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

          {/* VISUAL STRAIGHT LINE (OPTIONAL) */}
          {routePositions && (
            <Polyline positions={routePositions} pathOptions={{ dashArray: "6 8" }} />
          )}
        </MapContainer>
      </div>
    </div>
  );
}
