// src/App.jsx
import React, { useState } from "react";
import RecommendForm from "./components/RecommendForm";
import MapView from "./components/MapView";

export default function App() {
  const [userCoords, setUserCoords] = useState(null);       // { lat, lon }
  const [places, setPlaces] = useState([]);                // list of recommended places
  const [selectedPlace, setSelectedPlace] = useState(null); // place to highlight on map

  console.log("App render: userCoords:", userCoords, "places.length:", places.length, "selectedPlace:", selectedPlace?.display_name ?? selectedPlace?.business_id);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <header className="bg-white shadow-sm py-4 mb-6">
        <div className="max-w-4xl mx-auto px-4">
          <h1 className="text-xl font-bold">Smart City Recommender (Frontend)</h1>
          <p className="text-sm text-gray-600">
            Connected to backend at {import.meta.env.VITE_API_BASE || "http://localhost:8000"}
          </p>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 space-y-6">

        <MapView
          onLocation={(coords) => {
            console.log("App: onLocation ->", coords);
            setUserCoords(coords);
          }}
          userCoords={userCoords}
          places={places}
          selectedPlace={selectedPlace}
          onSelectPlace={(p) => {
            console.log("App: onSelectPlace ->", p);
            setSelectedPlace(p);
          }}
        />

        <RecommendForm
          userCoords={userCoords}
          onResults={(data) => {
            console.log("App: onResults ->", data);
            setPlaces(Array.isArray(data?.results) ? data.results : []);
            // Do NOT clear selectedPlace here — keep any current selection
          }}
          onShowPlace={(place) => {
            console.log("App: onShowPlace ->", place);
            setPlaces((prev) => {
              const id = place.business_id ?? place.place_id ?? place.display_name;
              const exists = prev.some((x) => (x.business_id && place.business_id && x.business_id === place.business_id) || x.display_name === place.display_name);
              if (exists) return prev;
              return [place, ...prev];
            });
            setSelectedPlace(place);
          }}
          manualSetUserCoords={(coords) => {
            console.log("App: manualSetUserCoords ->", coords);
            setUserCoords(coords);
          }}
        />
      </main>
    </div>
  );
}
