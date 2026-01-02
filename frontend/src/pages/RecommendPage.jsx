// src/pages/RecommendPage.jsx
import React, { useState } from "react";
import RecommendForm from "../components/RecommendForm";

export default function RecommendPage(){
  const [userCoords, setUserCoords] = useState(null);
  const [places, setPlaces] = useState([]);

  return (
    <div className="card fade-in-up">
      <h2>Find Nearby Places</h2>
      <p style={{color:"#475569"}}>Search for services near you.</p>

      <RecommendForm
        userCoords={userCoords}
        onResults={(data) => setPlaces(Array.isArray(data?.results) ? data.results : [])}
        manualSetUserCoords={(coords) => setUserCoords(coords)}
        onShowPlace={(place) => {
          // Save last shown place in localStorage so Map page could pick it up
          localStorage.setItem("last_shown_place", JSON.stringify(place));
          alert("Place saved to map preview. Open Map and check 'last shown' marker (coming soon).");
        }}
      />

      {/* simple listing preview */}
      {places?.length > 0 && (
        <div style={{marginTop:14}}>
          <h4>Preview results</h4>
          <ul>
            {places.map((p, i) => <li key={i}>{p.display_name || p.name} — {p.categories_display || p.categories}</li>)}
          </ul>
        </div>
      )}
    </div>
  );
}
