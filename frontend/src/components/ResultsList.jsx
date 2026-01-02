import React from 'react'

export default function ResultsList({results}){
  if(!results || results.length===0) return <div>No results</div>
  return (
    <div className="space-y-3">
      {results.map(r => (
        <div key={r.business_id} className="p-4 border rounded shadow-sm bg-white">
          <div className="flex justify-between items-center">
            <div>
              <div className="font-semibold">{r.name}</div>
              <div className="text-sm text-gray-600">{r.categories}</div>
            </div>
            <div className="text-right text-sm">
              <div>⭐ {r.rating} ({r.review_count})</div>
              <div className="text-gray-500">{r.distance_km} km</div>
            </div>
          </div>
          <div className="mt-2 text-sm text-gray-700">Score: {r.hybrid_score}</div>
          <div className="mt-2 space-x-2">
            <a className="text-sm text-sky-600" href={`https://www.google.com/maps/search/?api=1&query=${r.latitude},${r.longitude}`} target="_blank" rel="noreferrer">Directions</a>
          </div>
        </div>
      ))}
    </div>
  )
}
