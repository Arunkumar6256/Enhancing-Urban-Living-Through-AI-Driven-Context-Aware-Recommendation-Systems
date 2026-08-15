// import React, { useEffect, useState } from 'react'
// import { useParams } from 'react-router-dom'
// import api from '../api'

// export default function ServiceDetail(){
//   const { id } = useParams()
//   const [item, setItem] = useState(null)
//   useEffect(()=>{
//     api.getService(id).then(r=>setItem(r)).catch(e=>console.error(e))
//   }, [id])

//   if(!item) return <div className="p-6 bg-white rounded">Loading...</div>

//   return (
//     <div className="bg-white p-6 rounded shadow-sm">
//       <div className="flex justify-between items-start">
//         <div>
//           <h2 className="text-2xl font-semibold">{item.name}</h2>
//           <div className="text-sm text-gray-600">{item.categories}</div>
//         </div>
//         <div className="text-right">
//           <div className="text-lg">⭐ {item.rating ?? '-'}</div>
//           <div className="text-xs text-gray-500">{item.review_count} reviews</div>
//         </div>
//       </div>

//       <div className="mt-4">
//         <div className="text-sm text-gray-700">Address: {item.address || `${item.latitude}, ${item.longitude}`}</div>
//         <div className="text-sm text-gray-700">City: {item.city} • State: {item.state}</div>
//         <div className="mt-3 text-gray-600 text-sm">Attributes: {item.attributes}</div>
//       </div>

//       <div className="mt-4">
//         <a className="px-3 py-1 bg-sky-600 text-white rounded" target="_blank" rel="noreferrer" href={`https://www.google.com/maps/search/?api=1&query=${item.latitude},${item.longitude}`}>Open in Maps</a>
//       </div>
//     </div>
//   )
// }


import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import api from '../api'

export default function ServiceDetail(){
  const { id } = useParams()
  const [item, setItem] = useState(null)
  useEffect(()=>{
    api.getService(id).then(r=>setItem(r)).catch(e=>console.error(e))
  }, [id])

  if(!item) return <div className="p-6 bg-white rounded">Loading...</div>

  return (
    <div className="bg-white p-6 rounded shadow-sm">
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-2xl font-semibold">{item.name}</h2>
          <div className="text-sm text-gray-600">{item.categories}</div>
        </div>
        <div className="text-right">
          <div className="text-lg">⭐ {item.rating ?? '-'}</div>
          <div className="text-xs text-gray-500">{item.review_count} reviews</div>
        </div>
      </div>

      <div className="mt-4">
        <div className="text-sm text-gray-700">Address: {item.address || `${item.latitude}, ${item.longitude}`}</div>
        <div className="text-sm text-gray-700">City: {item.city} • State: {item.state}</div>
        <div className="mt-3 text-gray-600 text-sm">Attributes: {item.attributes}</div>
      </div>

      <div className="mt-4">
        <a className="px-3 py-1 bg-sky-600 text-white rounded" target="_blank" rel="noreferrer" href={`https://www.google.com/maps/search/?api=1&query=${item.latitude},${item.longitude}`}>Open in Maps</a>
      </div>
    </div>
  )
}
