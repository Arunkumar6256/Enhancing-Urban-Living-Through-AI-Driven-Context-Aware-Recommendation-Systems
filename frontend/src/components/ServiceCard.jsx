import React from 'react'
import { Link } from 'react-router-dom'

export default function ServiceCard({ item }){
  const { business_id, name, categories, rating, review_count, distance_km, hybrid_score, latitude, longitude } = item
  return (
    <div className="p-4 bg-white rounded shadow-sm">
      <div className="flex justify-between items-start gap-3">
        <div>
          <div className="font-semibold text-lg">{name}</div>
          <div className="text-sm text-gray-500">{categories}</div>
          <div className="mt-2 text-sm text-gray-700">Score: {hybrid_score}</div>
        </div>
        <div className="text-right">
          <div className="text-sm">⭐ {rating ?? '-'}</div>
          <div className="text-xs text-gray-500">{review_count} reviews</div>
          <div className="text-xs text-gray-500">{distance_km} km</div>
        </div>
      </div>

      <div className="mt-3 flex gap-2">
        <a className="px-3 py-1 border rounded text-sm" target="_blank" rel="noreferrer" href={`https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`}>Directions</a>
        <Link to={`/service/${business_id}`} className="px-3 py-1 bg-sky-600 text-white rounded text-sm">Details</Link>
        <button className="px-3 py-1 border rounded text-sm">Save</button>
      </div>
    </div>
  )
}
