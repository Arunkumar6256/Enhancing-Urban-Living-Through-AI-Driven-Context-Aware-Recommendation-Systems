import React from 'react'
import { Link } from 'react-router-dom'

export default function Header(){
  return (
    <header className="bg-white shadow-sm">
      <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-md bg-primary flex items-center justify-center text-white font-bold">SC</div>
          <div>
            <div className="font-semibold">Smart City</div>
            <div className="text-xs text-gray-500">Service Recommender</div>
          </div>
        </Link>
        <nav>
          <Link to="/" className="text-sm text-sky-600 hover:underline">Home</Link>
        </nav>
      </div>
    </header>
  )
}
