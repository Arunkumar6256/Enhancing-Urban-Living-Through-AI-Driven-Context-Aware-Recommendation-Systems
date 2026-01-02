import React from 'react'

export default function CategoryChip({label, onClick}){
  return (
    <button onClick={()=>onClick(label)} className="px-3 py-1 rounded-full bg-gray-100 text-sm hover:bg-gray-200">
      {label}
    </button>
  )
}
