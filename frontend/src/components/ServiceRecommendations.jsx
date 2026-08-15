// import React, { useEffect, useState } from "react";
// import { getMyServices } from "../api";

// export default function ServiceRecommendations() {
//   const [services, setServices] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [err, setErr] = useState(null);

//   useEffect(() => {
//     getMyServices()
//       .then((data) => {
//         setServices(Array.isArray(data) ? data : []);
//       })
//       .catch((e) => {
//         setErr(e.message || "Failed to load services");
//       })
//       .finally(() => setLoading(false));
//   }, []);

//   if (loading) {
//     return (
//       <div className="p-8 text-center bg-gray-50 rounded border border-gray-200">
//         <div className="text-gray-500">Retrieving personalized data...</div>
//       </div>
//     );
//   }

//   if (err) {
//     return <div className="text-red-600 text-sm bg-red-50 p-3 rounded">Error: {err}</div>;
//   }

//   if (services.length === 0) {
//     return (
//       <div className="p-8 text-center bg-gray-50 rounded border border-gray-200 text-sm text-gray-600 italic">
//         No specific recommendations available for your profile at this time.
//       </div>
//     );
//   }

//   return (
//     <div className="grid gap-4">
//       {services.map((s) => (
//         <div key={s.service_name} className="gov-card p-5 relative border-l-4 border-l-blue-600">
//           <div className="flex justify-between items-start">
//             <div>
//               <h4 className="font-bold text-lg text-[#1e3a8a]">{s.service_name}</h4>
//               <div className="text-xs uppercase font-bold text-gray-400 mt-1">{s.service_type}</div>
//             </div>
//             <div className="bg-blue-50 text-blue-700 font-bold px-2 py-1 rounded text-xs border border-blue-100">
//               Match: {s.score}
//             </div>
//           </div>

//           <p className="text-sm text-gray-600 mt-2 mb-3">
//             {s.description}
//           </p>

//           {s.website_url && (
//             <a href={s.website_url} target="_blank" rel="noreferrer" className="btn-gov text-xs py-2 px-3">
//               Visit Official Portal ↗
//             </a>
//           )}
//         </div>
//       ))}
//     </div>
//   );
// }


import React, { useEffect, useState } from "react";
import { getMyServices } from "../api";

export default function ServiceRecommendations() {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);

  useEffect(() => {
    getMyServices()
      .then((data) => {
        setServices(Array.isArray(data) ? data : []);
      })
      .catch((e) => {
        setErr(e.message || "Failed to load services");
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="p-8 text-center bg-gray-50 rounded border border-gray-200">
        <div className="text-gray-500">Retrieving personalized data...</div>
      </div>
    );
  }

  if (err) {
    return <div className="text-red-600 text-sm bg-red-50 p-3 rounded">Error: {err}</div>;
  }

  if (services.length === 0) {
    return (
      <div className="p-8 text-center bg-gray-50 rounded border border-gray-200 text-sm text-gray-600 italic">
        No specific recommendations available for your profile at this time.
      </div>
    );
  }

  return (
    <div className="grid gap-4">
      {services.map((s) => (
        <div key={s.service_name} className="gov-card p-5 relative border-l-4 border-l-blue-600">
          <div className="flex justify-between items-start">
            <div>
              <h4 className="font-bold text-lg text-[#1e3a8a]">{s.service_name}</h4>
              <div className="text-xs uppercase font-bold text-gray-400 mt-1">{s.service_type}</div>
            </div>
            <div className="bg-blue-50 text-blue-700 font-bold px-2 py-1 rounded text-xs border border-blue-100">
              Match: {s.score}
            </div>
          </div>

          <p className="text-sm text-gray-600 mt-2 mb-3">
            {s.description}
          </p>

          {s.website_url && (
            <a href={s.website_url} target="_blank" rel="noreferrer" className="btn-gov text-xs py-2 px-3">
              Visit Official Portal ↗
            </a>
          )}
        </div>
      ))}
    </div>
  );
}
