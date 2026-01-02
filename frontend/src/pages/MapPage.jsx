
// src/pages/MapPage.jsx
import React, { useState } from "react";
import MapView from "../components/MapView";

export default function MapPage(){
  const [userCoords, setUserCoords] = useState(null);
  const [selectedPlace, setSelectedPlace] = useState(null);
  const [places, setPlaces] = useState([]);

  return (
    <div className="card fade-in-up">
      <h2>Map</h2>
      <p style={{color:"#475569"}}>Your current location and POIs are displayed on this interactive map.</p>

      <MapView
        onLocation={(coords) => setUserCoords(coords)}
        userCoords={userCoords}
        places={places}
        selectedPlace={selectedPlace}
        onSelectPlace={(p) => setSelectedPlace(p)}
      />
    </div>
  );
  // inside MapPage, after useState declarations:
useEffect(() => {
  const raw = localStorage.getItem("last_shown_place");
  if (!raw) return;
  try {
    const place = JSON.parse(raw);
    // if your MapView supports a prop selectedPlace, call setSelectedPlace(place)
    setPlaces((prev) => {
      // ensure marker exists
      const exists = prev.some(x => (x.business_id && place.business_id && x.business_id === place.business_id) || x.display_name === place.display_name);
      if (exists) return prev;
      return [place, ...prev];
    });
    setSelectedPlace(place);
  } catch (e) { /* ignore */ }
}, []);

}
