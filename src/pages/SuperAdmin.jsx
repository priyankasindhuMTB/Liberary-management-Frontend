


// import React, { useEffect, useMemo, useState } from "react";
// import axios from "axios";
// import { useNavigate } from "react-router-dom";
// import { 
//   CheckCircle, 
//   AlertTriangle, 
//   Loader2, 
//   ExternalLink,
//   ShieldCheck,
//   RefreshCw,
//   LogOut,
//   Building,
//   Clock,
//   MessageSquare
// } from "lucide-react";

// function readAdminRole() {
//   try {
//     const raw = localStorage.getItem("admin");
//     if (!raw) return null;
//     return JSON.parse(raw).role ?? null;
//   } catch { return null; }
// }

// const SuperAdmin = () => {
//   const API_URL = import.meta.env.VITE_API_URL;
//   const token = localStorage.getItem("token");
//   const navigate = useNavigate();

//   const [admins, setAdmins] = useState([]); 
//   const [loading, setLoading] = useState(true);
//   const [actionLoading, setActionLoading] = useState(null); 
//   const [approveError, setApproveError] = useState("");
//   const [remarks, setRemarks] = useState({}); // Stores inline text values for super admin remarks mapped by ID

//   const adminProfile = useMemo(() => {
//     try { return JSON.parse(localStorage.getItem("admin")) || {}; } catch { return {}; }
//   }, []);

//   const fetchAllRequests = async () => {
//     try {
//       setLoading(true);
//       // Fetches documents directly matching status: "Pending" based on router path controls
//       const res = await axios.get(`${API_URL}/api/admin-request`, {
//         headers: { Authorization: `Bearer ${token}` }
//       });
//       setAdmins(res.data);
//     } catch (err) {
//       console.error("Fetch Error:", err.response?.data || err.message);
//     } crystalline: {
//       setLoading(false);
//     }
//   };

//   useEffect(() => { 
//     if (readAdminRole() !== "super_admin") {
//       navigate("/super-admin/login");
//       return;
//     }
//     fetchAllRequests(); 
//   }, []);

//   const handleLogout = () => {
//     localStorage.removeItem("token");
//     localStorage.removeItem("admin");
//     navigate("/super-admin/login");
//   };

//   const handleApprove = async (id) => {
//     setApproveError("");
//     setActionLoading(id);
//     try {
//       await axios.put(
//         `${API_URL}/api/admin-request/approve/${id}`,
//         { superAdminRemarks: remarks[id] || "Approved by Administration" },
//         { headers: { Authorization: `Bearer ${token}` } }
//       );
//       await fetchAllRequests();
//     } catch (err) {
//       setApproveError(err.response?.data?.message || err.message);
//     } finally {
//       setActionLoading(null);
//     }
//   };

//   const handleRemarksChange = (id, val) => {
//     setRemarks(prev => ({ ...prev, [id]: val }));
//   };

//   if (loading && admins.length === 0) {
//     return (
//       <div className="min-h-screen flex flex-col items-center justify-center bg-slate-900 text-white">
//         <Loader2 className="animate-spin text-indigo-500 mb-4" size={40} />
//         <p className="text-slate-400 font-bold text-sm tracking-wide">Loading System Directory...</p>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-slate-900 text-slate-100 antialiased font-sans pb-12">
      
//       {/* Navigation Header */}
//       <header className="bg-slate-800/60 backdrop-blur-md border-b border-slate-700/50 sticky top-0 z-50">
//         <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
//           <div className="flex items-center gap-3">
//             <div className="w-9 h-9 bg-indigo-600 rounded-xl flex items-center justify-center shadow-md">
//               <Building className="text-white" size={18} />
//             </div>
//             <span className="font-black text-lg text-white">
//               Lib<span className="text-indigo-400">Sync Central</span>
//             </span>
//             <span className="bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-[10px] font-black px-2 py-0.5 rounded-md uppercase tracking-wider hidden sm:inline-block">
//               Super Admin Control Center
//             </span>
//           </div>

//           <div className="flex items-center gap-4">
//             <div className="text-right hidden sm:block">
//               <p className="text-xs font-bold text-white leading-none mb-0.5">{adminProfile.name || "Root Admin"}</p>
//               <p className="text-[10px] text-slate-400 font-medium">System Director</p>
//             </div>
//             <button 
//               onClick={handleLogout}
//               className="flex items-center gap-2 bg-slate-700 hover:bg-red-500/20 hover:text-red-400 text-slate-300 font-bold px-4 py-2 rounded-xl text-xs transition-all border border-slate-600"
//             >
//               <LogOut size={14} /> Sign Out
//             </button>
//           </div>
//         </div>
//       </header>

//       <div className="max-w-5xl mx-auto px-4 mt-8">
        
//         {/* Main Title Actions */}
//         <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
//           <div>
//             <h1 className="text-3xl font-black text-white tracking-tight">Access & Subscription Enquiries</h1>
//             <p className="text-slate-400 text-sm mt-1">Review operational durations and timeline parameters for branch registers.</p>
//           </div>
//           <button 
//             onClick={fetchAllRequests} 
//             disabled={loading}
//             className="flex items-center gap-2 text-xs font-bold text-indigo-400 hover:text-white bg-slate-800 px-4 py-2.5 rounded-xl border border-slate-700 shadow-sm transition-all disabled:opacity-50"
//           >
//             <RefreshCw size={14} className={loading ? "animate-spin" : ""} /> Refresh Requests List
//           </button>
//         </div>

//         {/* Primary Container Stacks */}
//         <div className="space-y-4">
//           <h2 className="text-sm font-black text-slate-400 uppercase tracking-wider px-1">
//             Pending Queue ({admins.length})
//           </h2>
          
//           {admins.length === 0 ? (
//             <div className="bg-slate-800/30 border border-slate-700/50 rounded-2xl p-16 text-center shadow-inner">
//               <CheckCircle className="mx-auto mb-4 text-slate-600" size={44} />
//               <p className="font-bold text-lg text-slate-300">Queue Cleared</p>
//               <p className="text-sm text-slate-500 mt-1">There are no administrative subscription request parameters awaiting action.</p>
//             </div>
//           ) : (
//             <div className="space-y-4">
//               {admins.map((reqItem) => {
//                 const isRowProcessing = actionLoading === reqItem._id;
                
//                 return (
//                   <div key={reqItem._id} className="bg-slate-800/40 border border-slate-700/40 p-6 rounded-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-6 hover:border-slate-600/60 transition-all duration-200">
                    
//                     {/* User profile parameters block */}
//                     <div className="flex gap-4 items-start flex-1">
//                       <div className="h-12 w-12 bg-slate-700 text-indigo-400 rounded-xl flex items-center justify-center font-black text-lg uppercase border border-slate-600 shadow-inner shrink-0 mt-1">
//                         {reqItem.name?.charAt(0) || "A"}
//                       </div>
//                       <div className="space-y-2 w-full">
//                         <div className="flex items-center gap-2 flex-wrap">
//                           <h3 className="font-bold text-white text-base">{reqItem.name}</h3>
//                           <span className={`text-[10px] font-black px-2.5 py-0.5 rounded-md ${
//                             reqItem.requestType === "Extension" 
//                               ? "bg-purple-500/10 text-purple-400 border border-purple-500/20" 
//                               : "bg-blue-500/10 text-blue-400 border border-blue-500/20"
//                           }`}>
//                             {reqItem.requestType || "New_Registration"}
//                           </span>
//                         </div>
//                         <p className="text-sm text-slate-400 font-medium">{reqItem.email}</p>
                        
//                         {/* Branch info matrix tags */}
//                         <div className="flex items-center gap-3 flex-wrap pt-1">
//                           {reqItem.libraryName && (
//                             <div className="flex items-center gap-1.5 text-[11px] text-indigo-400 font-bold bg-indigo-500/5 px-2.5 py-1 rounded-lg border border-indigo-500/10">
//                               <ExternalLink size={12} />
//                               {reqItem.libraryName} Branch
//                             </div>
//                           )}
//                           <div className="flex items-center gap-1.5 text-[11px] text-amber-400 font-bold bg-amber-500/5 px-2.5 py-1 rounded-lg border border-amber-500/10">
//                             <Clock size={12} />
//                             Duration: {reqItem.requestedDurationMonths || 1} Month(s)
//                           </div>
//                         </div>

//                         {/* Inline custom super admin remarks wrapper box */}
//                         <div className="mt-3 max-w-sm relative">
//                           <div className="absolute top-3 left-3 text-slate-500">
//                             <MessageSquare size={14} />
//                           </div>
//                           <input
//                             type="text"
//                             placeholder="Add approval comments/remarks..."
//                             value={remarks[reqItem._id] || ""}
//                             onChange={(e) => handleRemarksChange(reqItem._id, e.target.value)}
//                             disabled={isRowProcessing}
//                             className="w-full bg-slate-900/40 border border-slate-700/60 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 outline-none focus:border-indigo-500 transition-all"
//                           />
//                         </div>
//                       </div>
//                     </div>

//                     {/* Action button container operations */}
//                     <div className="w-full md:w-auto flex items-center justify-end shrink-0">
//                       <button
//                         type="button"
//                         disabled={isRowProcessing}
//                         onClick={() => handleApprove(reqItem._id)}
//                         className="w-full md:w-36 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-700 text-white px-4 py-3 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/10"
//                       >
//                         {isRowProcessing ? (
//                           <Loader2 size={14} className="animate-spin" />
//                         ) : (
//                           <CheckCircle size={14} />
//                         )}
//                         Authorize Branch
//                       </button>
//                     </div>
//                   </div>
//                 );
//               })}
//             </div>
//           )}
          
//           {approveError && (
//             <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center gap-2 text-red-400 text-xs font-bold mt-4">
//               <AlertTriangle size={14} /> System Execution Error: {approveError}
//             </div>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// };

// export default SuperAdmin;


import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { 
  CheckCircle, 
  AlertTriangle, 
  Loader2, 
  ExternalLink,
  RefreshCw,
  LogOut,
  Building,
  Calendar,
  MessageSquare
} from "lucide-react";

function readAdminRole() {
  try {
    const raw = localStorage.getItem("admin");
    if (!raw) return null;
    return JSON.parse(raw).role ?? null;
  } catch { return null; }
}

const SuperAdmin = () => {
  const API_URL = import.meta.env.VITE_API_URL;
  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  const [admins, setAdmins] = useState([]); 
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null); 
  const [approveError, setApproveError] = useState("");
  const [remarks, setRemarks] = useState({}); 

  const adminProfile = useMemo(() => {
    try { return JSON.parse(localStorage.getItem("admin")) || {}; } catch { return {}; }
  }, []);

  const fetchAllRequests = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_URL}/api/admin-request`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAdmins(res.data);
    } catch (err) {
      console.error("Fetch Error:", err.response?.data || err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { 
    if (readAdminRole() !== "super_admin") {
      navigate("/super-admin/login");
      return;
    }
    fetchAllRequests(); 
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("admin");
    navigate("/super-admin/login");
  };

  const handleApprove = async (id) => {
    setApproveError("");
    setActionLoading(id);
    try {
      await axios.put(
        `${API_URL}/api/admin-request/approve/${id}`,
        { superAdminRemarks: remarks[id] || "Approved by Administration" },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      await fetchAllRequests();
    } catch (err) {
      setApproveError(err.response?.data?.message || err.message);
    } finally {
      setActionLoading(null);
    }
  };

  const handleRemarksChange = (id, val) => {
    setRemarks(prev => ({ ...prev, [id]: val }));
  };

  // Date Formatting Helper
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const d = new Date(dateString);
    return isNaN(d.getTime()) ? "N/A" : d.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric"
    });
  };

  if (loading && admins.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-900 text-white">
        <Loader2 className="animate-spin text-indigo-500 mb-4" size={40} />
        <p className="text-slate-400 font-bold text-sm tracking-wide">Loading System Directory...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 antialiased font-sans pb-12">
      
      {/* Navigation Header */}
      <header className="bg-slate-800/60 backdrop-blur-md border-b border-slate-700/50 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-indigo-600 rounded-xl flex items-center justify-center shadow-md">
              <Building className="text-white" size={18} />
            </div>
            <span className="font-black text-lg text-white">
              Lib<span className="text-indigo-400">Sync Central</span>
            </span>
            <span className="bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-[10px] font-black px-2 py-0.5 rounded-md uppercase tracking-wider hidden sm:inline-block">
              Super Admin Control Center
            </span>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <p className="text-xs font-bold text-white leading-none mb-0.5">{adminProfile.name || "Root Admin"}</p>
              <p className="text-[10px] text-slate-400 font-medium">System Director</p>
            </div>
            <button 
              onClick={handleLogout}
              className="flex items-center gap-2 bg-slate-700 hover:bg-red-500/20 hover:text-red-400 text-slate-300 font-bold px-4 py-2 rounded-xl text-xs transition-all border border-slate-600"
            >
              <LogOut size={14} /> Sign Out
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 mt-8">
        
        {/* Main Title Actions */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-black text-white tracking-tight">Access & Subscription Enquiries</h1>
            <p className="text-slate-400 text-sm mt-1">Review operational durations and timeline parameters for branch registers.</p>
          </div>
          <button 
            onClick={fetchAllRequests} 
            disabled={loading}
            className="flex items-center gap-2 text-xs font-bold text-indigo-400 hover:text-white bg-slate-800 px-4 py-2.5 rounded-xl border border-slate-700 shadow-sm transition-all disabled:opacity-50"
          >
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} /> Refresh Requests List
          </button>
        </div>

        {/* Primary Container Stacks */}
        <div className="space-y-4">
          <h2 className="text-sm font-black text-slate-400 uppercase tracking-wider px-1">
            Pending Queue ({admins.length})
          </h2>
          
          {admins.length === 0 ? (
            <div className="bg-white/5 border border-slate-700/50 rounded-2xl p-16 text-center shadow-inner">
              <CheckCircle className="mx-auto mb-4 text-slate-600" size={44} />
              <p className="font-bold text-lg text-slate-300">Queue Cleared</p>
              <p className="text-sm text-slate-500 mt-1">There are no administrative subscription request parameters awaiting action.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {admins.map((reqItem) => {
                const isRowProcessing = actionLoading === reqItem._id;
                
                return (
                  <div key={reqItem._id} className="bg-slate-800/40 border border-slate-700/40 p-6 rounded-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-6 hover:border-slate-600/60 transition-all duration-200">
                    
                    {/* User profile parameters block */}
                    <div className="flex gap-4 items-start flex-1">
                      <div className="h-12 w-12 bg-slate-700 text-indigo-400 rounded-xl flex items-center justify-center font-black text-lg uppercase border border-slate-600 shadow-inner shrink-0 mt-1">
                        {reqItem.name?.charAt(0) || "A"}
                      </div>
                      <div className="space-y-2 w-full">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-bold text-white text-base">{reqItem.name}</h3>
                          <span className={`text-[10px] font-black px-2.5 py-0.5 rounded-md ${
                            reqItem.requestType === "Extension" 
                              ? "bg-purple-500/10 text-purple-400 border border-purple-500/20" 
                              : "bg-blue-500/10 text-blue-400 border border-blue-500/20"
                          }`}>
                            {reqItem.requestType || "New_Registration"}
                          </span>
                        </div>
                        <p className="text-sm text-slate-400 font-medium">{reqItem.email}</p>
                        
                        {/* Branch info matrix tags */}
                        <div className="flex items-center gap-2 flex-wrap pt-1">
                          {reqItem.libraryName && (
                            <div className="flex items-center gap-1.5 text-[11px] text-indigo-400 font-bold bg-indigo-500/5 px-2.5 py-1 rounded-lg border border-indigo-500/10">
                              <ExternalLink size={12} />
                              {reqItem.libraryName} Branch
                            </div>
                          )}
                          
                          {/* 👇 TRANSITIONED DATE LAYOUTS */}
                          <div className="flex items-center gap-1.5 text-[11px] text-emerald-400 font-bold bg-emerald-500/5 px-2.5 py-1 rounded-lg border border-emerald-500/10">
                            <Calendar size={12} />
                            Start: {formatDate(reqItem.accessStartDate)}
                          </div>

                          <div className="flex items-center gap-1.5 text-[11px] text-rose-400 font-bold bg-rose-500/5 px-2.5 py-1 rounded-lg border border-rose-500/10">
                            <Calendar size={12} />
                            End: {formatDate(reqItem.accessEndDate)}
                          </div>
                        </div>

                        {/* Inline comment field */}
                        <div className="mt-3 max-w-sm relative">
                          <div className="absolute top-3 left-3 text-slate-500">
                            <MessageSquare size={14} />
                          </div>
                          <input
                            type="text"
                            placeholder="Add approval comments/remarks..."
                            value={remarks[reqItem._id] || ""}
                            onChange={(e) => handleRemarksChange(reqItem._id, e.target.value)}
                            disabled={isRowProcessing}
                            className="w-full bg-slate-900/40 border border-slate-700/60 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 outline-none focus:border-indigo-500 transition-all"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Action buttons */}
                    <div className="w-full md:w-auto flex items-center justify-end shrink-0">
                      <button
                        type="button"
                        disabled={isRowProcessing}
                        onClick={() => handleApprove(reqItem._id)}
                        className="w-full md:w-36 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-700 text-white px-4 py-3 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/10"
                      >
                        {isRowProcessing ? (
                          <Loader2 size={14} className="animate-spin" />
                        ) : (
                          <CheckCircle size={14} />
                        )}
                        Authorize Branch
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
          
          {approveError && (
            <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center gap-2 text-red-400 text-xs font-bold mt-4">
              <AlertTriangle size={14} /> System Execution Error: {approveError}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SuperAdmin;