// import React, { useEffect, useState } from "react";
// import axios from "axios";
// import { 
//   Users, Loader2, AlertCircle, Edit2, X, 
//   UserPlus, User, Mail, Lock, Library, Calendar, Plus 
// } from "lucide-react";
// import { toast } from 'react-hot-toast';

// const AdminList = () => {
//   const [admins, setAdmins] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState("");
//   const [isSuperAdmin, setIsSuperAdmin] = useState(false);

//   // ── MODAL STATES ──
//   const [isModalOpen, setIsModalOpen] = useState(false);
//   const [modalMode, setModalMode] = useState("create"); // "create" or "edit"
//   const [selectedAdminId, setSelectedAdminId] = useState(null);
//   const [modalLoading, setModalLoading] = useState(false);
//   const [modalMessage, setModalMessage] = useState({ text: "", type: "" });

//   const todayStr = new Date().toISOString().split("T")[0];

//   // Form Initial State
//   const initialFormState = {
//     name: "",
//     email: "",
//     password: "",
//     libraryName: "",
//     accessStartDate: todayStr,
//     accessEndDate: ""
//   };
//   const [form, setForm] = useState(initialFormState);

//   const API_URL = import.meta.env.VITE_API_URL;
//   const token = localStorage.getItem("token");

//   const fetchAdmins = async () => {
//     try {
//       setLoading(true);
//       const res = await axios.get(`${API_URL}/api/admin/all`, {
//         headers: { Authorization: `Bearer ${token}` }
//       });
//       console.log("ressssss",res.data)
//       setAdmins(res.data);
//     } catch (err) {
//       setError(err.response?.data?.message || "Failed to load admins directory");
//     } finally {
//       setLoading(false);
//     }
//   };
  

//   useEffect(() => {
//     try {
//       const adminData = JSON.parse(localStorage.getItem("admin"));
//       if (adminData?.role === "super_admin") setIsSuperAdmin(true);
//     } catch (err) {
//       console.error(err);
//     }

//     if (token) fetchAdmins();
//     else setError("No token found. Please login again.");
//   }, [API_URL, token]);

//   // ── OPEN MODAL FOR CREATE ──
//   const openCreateModal = () => {
//     setModalMode("create");
//     setSelectedAdminId(null);
//     setForm(initialFormState);
//     setModalMessage({ text: "", type: "" });
//     setIsModalOpen(true);
//   };

//   // ── OPEN MODAL FOR EDIT (Loads complete data) ──
//   const openEditModal = (adm) => {
//     setModalMode("edit");
//     setSelectedAdminId(adm._id);
//     setModalMessage({ text: "", type: "" });
    
//     // Dates parsing mechanics for calendar values (YYYY-MM-DD)
//     const startDate = adm.accessStartDate ? new Date(adm.accessStartDate).toISOString().split("T")[0] : todayStr;
//     const endDate = adm.accessEndDate ? new Date(adm.accessEndDate).toISOString().split("T")[0] : "";

//     setForm({
//       name: adm.name || "",
//       email: adm.email || "",
//       password: "", // Security reason: Password edit par verify nahi karwayenge blank chhodenge
//       libraryName: adm.libraryId?.name || "",
//       accessStartDate: startDate,
//       accessEndDate: endDate
//     });
//     setIsModalOpen(true);
//   };

//   const handleInputChange = (e) => {
//     const { name, value } = e.target;
//     setForm((prev) => ({ ...prev, [name]: value }));
//   };

//   // ── SUBMIT MODAL (CREATE OR EDIT) ──
//   const handleModalSubmit = async (e) => {
//     e.preventDefault();
    
//     if (new Date(form.accessStartDate) >= new Date(form.accessEndDate)) {
//       setModalMessage({ text: "Access End Date must be after the Start Date.", type: "error" });
//       return;
//     }

//     try {
//       setModalLoading(true);
//       setModalMessage({ text: "", type: "" });
//       const headers = { Authorization: `Bearer ${token}` };

//       if (modalMode === "create") {
//         const res = await axios.post(`${API_URL}/api/admin/create-direct`, form, { headers });
//         setForm(initialFormState);
//         setModalMessage({ text: res.data.message || "Admin created successfully!", type: "success" });
//       } else {
//         // Edit flow fields mappings
//         const res = await axios.put(`${API_URL}/api/admin/update-direct/${selectedAdminId}`, {
//           name: form.name,
//           email: form.email,
//           accessStartDate: form.accessStartDate,
//           accessEndDate: form.accessEndDate
//         }, { headers });
//         setModalMessage({ text: res.data.message || "Admin updated successfully!", type: "success" });
//       }

//       fetchAdmins(); // Refresh lists view data grids
//       setTimeout(() => setIsModalOpen(false), 1200); // Popup closes smoothly on success

//     } catch (err) {
//       setModalMessage({ text: err.response?.data?.message || "Operation failed.", type: "error" });
//     } finally {
//       setModalLoading(false);
//     }
//   };

//   // Status Active/Inactive Toggle Trigger Handler
//   const handleToggleStatus = async (id, currentStatus) => {
//     const nextStatus = currentStatus === "Active" ? "Inactive" : "Active";
//     try {
//       await axios.put(`${API_URL}/api/admin/toggle-status/${id}`, { status: nextStatus }, {
//         headers: { Authorization: `Bearer ${token}` }
//       });
//       setAdmins(prev => prev.map(adm => adm._id === id ? { ...adm, status: nextStatus } : adm));
//     } catch (err) {
//       alert(err.response?.data?.message || "Status update failed");
//     }
//   };

//   const formatDateLabel = (dateStr) => {
//     if (!dateStr) return "Not Set";
//     return new Date(dateStr).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
//   };

//   if (loading && admins.length === 0) return (
//     <div className="flex flex-col items-center justify-center h-screen text-slate-500 bg-slate-50">
//       <Loader2 className="animate-spin mb-2 text-indigo-600" size={36} />
//       <p className="font-semibold text-sm">Loading Administration Grid...</p>
//     </div>
//   );

//   console.log("admins",form);

//   return (
//     <div className="p-6 md:p-8 min-h-screen bg-slate-50">
      
//       {/* Top Heading Panel */}
//       <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
//         <div className="flex items-center gap-3">
//           <div className="p-2.5 bg-indigo-600 text-white rounded-xl shadow-lg shadow-indigo-600/10">
//             <Users size={22} />
//           </div>
//           <div>
//             <h1 className="text-2xl font-black text-slate-800 tracking-tight">Approved Library Admins</h1>
//             <p className="text-xs text-slate-500 mt-0.5">Manage operational scopes, timeline allocations, and profiles.</p>
//           </div>
//         </div>

//         <button
//           onClick={openCreateModal}
//           className={`flex items-center gap-2 text-sm font-bold text-white px-4 py-2.5 rounded-xl transition-all active:scale-[0.98] shadow-md ${
//             isSuperAdmin ? "bg-amber-600 hover:bg-amber-700 shadow-amber-600/10" : "bg-indigo-600 hover:bg-indigo-700 shadow-indigo-600/10"
//           }`}
//         >
//           <Plus size={16} /> Add New Admin
//         </button>
//       </div>

//       {/* Main Table Screen View */}
//       <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
//         {error ? (
//           <div className="m-6 p-4 bg-red-50 border border-red-100 rounded-xl text-red-700 flex items-center gap-3 text-sm font-semibold">
//             <AlertCircle size={18} /> {error}
//           </div>
//         ) : admins.length === 0 ? (
//           <div className="p-16 text-center text-slate-400 font-medium text-sm">No registered administrators found.</div>
//         ) : (
//           <div className="overflow-x-auto">
//             <table className="w-full text-left border-collapse">
//               <thead className="bg-slate-50/80 border-b border-slate-200">
//                 <tr>
//                   <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Admin Name</th>
//                   <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Email Address</th>
//                   <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Library Node</th>
//                   <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Access Timeline</th>
//                   <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider text-center">Status</th>
//                   <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider text-right">Actions</th>
//                 </tr>
//               </thead>
//               <tbody className="divide-y divide-slate-100 text-sm">
//                 {admins.map((adm) => {
//                   const isActive = adm.status !== "Inactive";
//                   return (
//                     <tr key={adm._id} className="hover:bg-slate-50/40 transition-colors">
//                       <td className="px-6 py-4 font-semibold text-slate-700">{adm.name}</td>
//                       <td className="px-6 py-4 text-slate-600 font-mono text-xs">{adm.email}</td>
//                       <td className="px-6 py-4">
//                         <span className="text-indigo-600 font-bold bg-indigo-50/60 px-2.5 py-1 rounded-lg text-xs">
//                           {adm.libraryId?.name || "Library Branch"}
//                         </span>
//                       </td>
//                       <td className="px-6 py-4 text-xs text-slate-500 font-medium">
//                         <div className="flex flex-col gap-0.5">
//                           <span><strong className="text-slate-400 text-[10px]">START:</strong> {formatDateLabel(adm.accessStartDate)}</span>
//                           <span><strong className="text-slate-400 text-[10px]">EXPIRY:</strong> {formatDateLabel(adm.accessEndDate)}</span>
//                         </div>
//                       </td>
//                       <td className="px-6 py-4 text-center">
//                         <button
//                           type="button"
//                           onClick={() => handleToggleStatus(adm._id, adm.status || "Active")}
//                           className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-black tracking-wide border transition-all active:scale-95 ${
//                             isActive ? "bg-emerald-50 text-emerald-700 border-emerald-200/60" : "bg-slate-50 text-slate-500 border-slate-200"
//                           }`}
//                         >
//                           <span className={`w-1.5 h-1.5 rounded-full ${isActive ? "bg-emerald-500" : "bg-slate-400"}`}></span>
//                           {adm.status || "Active"}
//                         </button>
//                       </td>
//                       <td className="px-6 py-4 text-right">
//                         <button 
//                           onClick={() => openEditModal(adm)} 
//                           className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
//                         >
//                           <Edit2 size={14} />
//                         </button>
//                       </td>
//                     </tr>
//                   );
//                 })}
//               </tbody>
//             </table>
//           </div>
//         )}
//       </div>

//       {/* ═══════════════════════════════════════
//             DYNAMIC MODAL (POPUP DIALOG HANDLER)
//          ═══════════════════════════════════════ */}
//       {isModalOpen && (
//         <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
//           <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-slate-100 overflow-hidden transform scale-100 transition-all">
            
//             {/* Modal Header */}
//             <div className={`p-5 text-white flex items-center justify-between ${isSuperAdmin ? "bg-amber-600" : "bg-indigo-600"}`}>
//               <div className="flex items-center gap-2.5">
//                 <UserPlus size={18} />
//                 <h2 className="font-bold text-base capitalize">
//                   {modalMode === "create" ? "Add New Administrator" : "Modify Admin Account"}
//                 </h2>
//               </div>
//               <button onClick={() => setIsModalOpen(false)} className="text-white/80 hover:text-white bg-white/10 hover:bg-white/20 p-1.5 rounded-lg transition-all">
//                 <X size={16} />
//               </button>
//             </div>

//             {/* Modal Body Form */}
//             <form onSubmit={handleModalSubmit} className="p-6 space-y-4">
//               {modalMessage.text && (
//                 <div className={`p-3 rounded-xl flex items-center gap-2.5 text-xs font-semibold border ${
//                   modalMessage.type === "error" ? "bg-red-50 text-red-700 border-red-100" : "bg-emerald-50 text-emerald-700 border-emerald-100"
//                 }`}>
//                   <AlertCircle size={16} className="shrink-0" />
//                   <span>{modalMessage.text}</span>
//                 </div>
//               )}

//               <div>
//                 <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Full Name</label>
//                 <div className="relative">
//                   <User className="absolute left-3 top-2.5 text-slate-400" size={16} />
//                   <input name="name" type="text" required value={form.name} onChange={handleInputChange} className="w-full pl-9 pr-3 py-2 border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-indigo-500 rounded-xl text-sm outline-none transition-all text-slate-800" placeholder="John Doe" />
//                 </div>
//               </div>

//               <div>
//                 <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Email Address</label>
//                 <div className="relative">
//                   <Mail className="absolute left-3 top-2.5 text-slate-400" size={16} />
//                   <input name="email" type="email" required value={form.email} onChange={handleInputChange} className="w-full pl-9 pr-3 py-2 border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-indigo-500 rounded-xl text-sm outline-none transition-all text-slate-800" placeholder="admin@domain.com" />
//                 </div>
//               </div>

//               {/* Password field only renders on Create mode */}
//               {modalMode === "create" && (
//                 <div>
//                   <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Account Password</label>
//                   <div className="relative">
//                     <Lock className="absolute left-3 top-2.5 text-slate-400" size={16} />
//                     <input name="password" type="password" required={modalMode === "create"} minLength={6} value={form.password} onChange={handleInputChange} className="w-full pl-9 pr-3 py-2 border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-indigo-500 rounded-xl text-sm outline-none transition-all text-slate-800" placeholder="••••••••" />
//                   </div>
//                 </div>
//               )}

//               {/* Library Name field only renders for Super Admin on Create mode */}
//               {isSuperAdmin && modalMode === "create" && (
//                 <div>
//                   <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Library Node Name</label>
//                   <div className="relative">
//                     <Library className="absolute left-3 top-2.5 text-slate-400" size={16} />
//                     <input name="libraryName" type="text" required={isSuperAdmin && modalMode === "create"} value={form.libraryName} onChange={handleInputChange} className="w-full pl-9 pr-3 py-2 border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-amber-500 rounded-xl text-sm outline-none transition-all text-slate-800" placeholder="e.g. Core Public Hub" />
//                   </div>
//                 </div>
//               )}

//               {/* 📅 START AND END DATE INPUT FIELDS */}
//               <div className="grid grid-cols-2 gap-4">
//                 <div>
//                   <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Start Date</label>
//                   <div className="relative">
//                     <Calendar className="absolute left-3 top-2.5 text-slate-400" size={16} />
//                     <input name="accessStartDate" type="date" required min={modalMode === "create" ? todayStr : ""} value={form.accessStartDate} onChange={handleInputChange} className="w-full pl-9 pr-3 py-2 border border-slate-200 bg-slate-50 text-slate-800 focus:bg-white focus:ring-2 focus:ring-indigo-500 rounded-xl text-xs outline-none transition-all" />
//                   </div>
//                 </div>

//                 <div>
//                   <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">End Date</label>
//                   <div className="relative">
//                     <Calendar className="absolute left-3 top-2.5 text-slate-400" size={16} />
//                     <input name="accessEndDate" type="date" required min={form.accessStartDate || todayStr} value={form.accessEndDate} onChange={handleInputChange} className="w-full pl-9 pr-3 py-2 border border-slate-200 bg-slate-50 text-slate-800 focus:bg-white focus:ring-2 focus:ring-indigo-500 rounded-xl text-xs outline-none transition-all" />
//                   </div>
//                 </div>
//               </div>

//               {/* Action Buttons */}
//               <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-100">
//                 <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-xs font-bold text-slate-500 hover:bg-slate-100 rounded-xl transition-all">Cancel</button>
//                 <button disabled={modalLoading} type="submit" className={`px-5 py-2 rounded-xl text-xs font-bold text-white shadow-md transition-all active:scale-95 ${
//                   isSuperAdmin ? "bg-amber-600 hover:bg-amber-700" : "bg-indigo-600 hover:bg-indigo-700"
//                 }`}>
//                   {modalLoading ? "Saving Changes..." : modalMode === "create" ? "Provision Account" : "Update Profile"}
//                 </button>
//               </div>
//             </form>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default AdminList;

import React, { useEffect, useState } from "react";
import axios from "axios";
import { 
  Users, Loader2, AlertCircle, Edit2, X, 
  UserPlus, User, Mail, Lock, Library, Calendar, Plus 
} from "lucide-react";
import { toast } from 'react-hot-toast';

const AdminList = () => {
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);

  // ── MODAL STATES ──
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState("create"); // "create" or "edit"
  const [selectedAdminId, setSelectedAdminId] = useState(null);
  const [modalLoading, setModalLoading] = useState(false);

  const todayStr = new Date().toISOString().split("T")[0];

  // Form Initial State
  const initialFormState = {
    name: "",
    email: "",
    password: "",
    libraryName: "",
    accessStartDate: todayStr,
    accessEndDate: ""
  };
  const [form, setForm] = useState(initialFormState);

  const API_URL = import.meta.env.VITE_API_URL;
  const token = localStorage.getItem("token");

  // ── FETCH ALL ADMINS WITH TOAST LOADING ──
  const fetchAdmins = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_URL}/api/admin/all`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAdmins(res.data);
    } catch (err) {
      const errorMsg = err.response?.data?.message || "Failed to load admins directory";
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    try {
      const adminData = JSON.parse(localStorage.getItem("admin"));
      if (adminData?.role === "super_admin") setIsSuperAdmin(true);
    } catch (err) {
      console.error(err);
    }

    if (token) {
      fetchAdmins();
    } else {
      setError("No token found. Please login again.");
      toast.error("Authentication token missing!");
    }
  }, [API_URL, token]);

  // ── OPEN MODAL FOR CREATE ──
  const openCreateModal = () => {
    setModalMode("create");
    setSelectedAdminId(null);
    setForm(initialFormState);
    setIsModalOpen(true);
  };

  // ── OPEN MODAL FOR EDIT (Loads all active fields) ──
  const openEditModal = (adm) => {
    setModalMode("edit");
    setSelectedAdminId(adm._id);
    
    const startDate = adm.accessStartDate ? new Date(adm.accessStartDate).toISOString().split("T")[0] : todayStr;
    const endDate = adm.accessEndDate ? new Date(adm.accessEndDate).toISOString().split("T")[0] : "";

    setForm({
      name: adm.name || "",
      email: adm.email || "",
      password: "", // Left blank for security profiles
      libraryName: adm.libraryId?.name || "Library Branch", // Added back safely for Edit View tracking
      accessStartDate: startDate,
      accessEndDate: endDate
    });
    setIsModalOpen(true);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  // ── SUBMIT FORM (CREATE OR EDIT) WITH REFRESH & TOASTS ──
  const handleModalSubmit = async (e) => {
    e.preventDefault();
    
    if (form.accessEndDate && new Date(form.accessStartDate) >= new Date(form.accessEndDate)) {
      toast.error("Access End Date must be after the Start Date.");
      return;
    }

    const toastLoadingId = toast.loading(modalMode === "create" ? "Provisioning new account..." : "Updating admin profile...");

    try {
      setModalLoading(true);
      const headers = { Authorization: `Bearer ${token}` };

      if (modalMode === "create") {
        const res = await axios.post(`${API_URL}/api/admin/create-direct`, form, { headers });
        setForm(initialFormState);
        toast.success(res.data.message || "Admin registered successfully! 🎉", { id: toastLoadingId });
      } else {
        const res = await axios.put(`${API_URL}/api/admin/update-direct/${selectedAdminId}`, {
          name: form.name,
          email: form.email,
          libraryName: form.libraryName, // Ensure the admin edits fields correctly
          accessStartDate: form.accessStartDate,
          accessEndDate: form.accessEndDate
        }, { headers });
        toast.success(res.data.message || "Admin profile updated! ✨", { id: toastLoadingId });
      }

      setIsModalOpen(false); // Closes popup instantly and smoothly
      fetchAdmins(); // Soft refresh target grid tracking logs
    } catch (err) {
      const fallbackErr = err.response?.data?.message || "Operation failed.";
      toast.error(fallbackErr, { id: toastLoadingId });
    } finally {
      setModalLoading(false);
    }
  };

  // ── STATUS TOGGLE TRACKING SYSTEM WITH TOAST FEEDBACK ──
  const handleToggleStatus = async (id, currentStatus) => {
    const nextStatus = currentStatus === "Active" ? "Inactive" : "Active";
    const statusToastId = toast.loading(`Updating status to ${nextStatus}...`);
    
    try {
      await axios.put(`${API_URL}/api/admin/toggle-status/${id}`, { status: nextStatus }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setAdmins(prev => prev.map(adm => adm._id === id ? { ...adm, status: nextStatus } : adm));
      toast.success(`Account status is now ${nextStatus}!`, { id: statusToastId });
    } catch (err) {
      const apiErr = err.response?.data?.message || "Status update failed";
      toast.error(apiErr, { id: statusToastId });
    }
  };

  const formatDateLabel = (dateStr) => {
    if (!dateStr) return "Not Set";
    return new Date(dateStr).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  };

  if (loading && admins.length === 0) return (
    <div className="flex flex-col items-center justify-center h-screen text-slate-500 bg-slate-50">
      <Loader2 className="animate-spin mb-2 text-indigo-600" size={36} />
      <p className="font-semibold text-sm">Loading Administration Grid...</p>
    </div>
  );

  return (
    <div className="p-6 md:p-8 min-h-screen bg-slate-50">
      
      {/* Top Heading Panel */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-indigo-600 text-white rounded-xl shadow-lg shadow-indigo-600/10">
            <Users size={22} />
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-800 tracking-tight">Approved Library Admins</h1>
            <p className="text-xs text-slate-500 mt-0.5">Manage operational scopes, timeline allocations, and profiles.</p>
          </div>
        </div>

        <button
          onClick={openCreateModal}
          className={`flex items-center gap-2 text-sm font-bold text-white px-4 py-2.5 rounded-xl transition-all active:scale-[0.98] shadow-md ${
            isSuperAdmin ? "bg-amber-600 hover:bg-amber-700 shadow-amber-600/10" : "bg-indigo-600 hover:bg-indigo-700 shadow-indigo-600/10"
          }`}
        >
          <Plus size={16} /> Add New Admin
        </button>
      </div>

      {/* Main Table Screen View */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        {error ? (
          <div className="m-6 p-4 bg-red-50 border border-red-100 rounded-xl text-red-700 flex items-center gap-3 text-sm font-semibold">
            <AlertCircle size={18} /> {error}
          </div>
        ) : admins.length === 0 ? (
          <div className="p-16 text-center text-slate-400 font-medium text-sm">No registered administrators found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-slate-50/80 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Admin Name</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Email Address</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Library Node</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Access Timeline</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider text-center">Status</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {admins.map((adm) => {
                  const isActive = adm.status !== "Inactive";
                  return (
                    <tr key={adm._id} className="hover:bg-slate-50/40 transition-colors">
                      <td className="px-6 py-4 font-semibold text-slate-700">{adm.name}</td>
                      <td className="px-6 py-4 text-slate-600 font-mono text-xs">{adm.email}</td>
                      <td className="px-6 py-4">
                        <span className="text-indigo-600 font-bold bg-indigo-50/60 px-2.5 py-1 rounded-lg text-xs">
                          {adm.libraryId?.name || "Library Branch"}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-xs text-slate-500 font-medium">
                        <div className="flex flex-col gap-0.5">
                          <span><strong className="text-slate-400 text-[10px]">START:</strong> {formatDateLabel(adm.accessStartDate)}</span>
                          <span><strong className="text-slate-400 text-[10px]">EXPIRY:</strong> {formatDateLabel(adm.accessEndDate)}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <button
                          type="button"
                          onClick={() => handleToggleStatus(adm._id, adm.status || "Active")}
                          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-black tracking-wide border transition-all active:scale-95 ${
                            isActive ? "bg-emerald-50 text-emerald-700 border-emerald-200/60" : "bg-slate-50 text-slate-500 border-slate-200"
                          }`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${isActive ? "bg-emerald-500" : "bg-slate-400"}`}></span>
                          {adm.status || "Active"}
                        </button>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button 
                          onClick={() => openEditModal(adm)} 
                          className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                        >
                          <Edit2 size={14} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── DYNAMIC DIALOG MODAL ── */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-slate-100 overflow-hidden transform scale-100 transition-all">
            
            {/* Modal Header */}
            <div className={`p-5 text-white flex items-center justify-between ${isSuperAdmin ? "bg-amber-600" : "bg-indigo-600"}`}>
              <div className="flex items-center gap-2.5">
                <UserPlus size={18} />
                <h2 className="font-bold text-base capitalize">
                  {modalMode === "create" ? "Add New Administrator" : "Modify Admin Account"}
                </h2>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="text-white/80 hover:text-white bg-white/10 hover:bg-white/20 p-1.5 rounded-lg transition-all">
                <X size={16} />
              </button>
            </div>

            {/* Modal Body Form */}
            <form onSubmit={handleModalSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Full Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-2.5 text-slate-400" size={16} />
                  <input name="name" type="text" required value={form.name} onChange={handleInputChange} className="w-full pl-9 pr-3 py-2 border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-indigo-500 rounded-xl text-sm outline-none transition-all text-slate-800" placeholder="John Doe" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-2.5 text-slate-400" size={16} />
                  <input name="email" type="email" required value={form.email} onChange={handleInputChange} className="w-full pl-9 pr-3 py-2 border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-indigo-500 rounded-xl text-sm outline-none transition-all text-slate-800" placeholder="admin@domain.com" />
                </div>
              </div>

              {/* Password field: ONLY shows during account creation */}
              {modalMode === "create" && (
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Account Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-2.5 text-slate-400" size={16} />
                    <input name="password" type="password" required={modalMode === "create"} minLength={6} value={form.password} onChange={handleInputChange} className="w-full pl-9 pr-3 py-2 border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-indigo-500 rounded-xl text-sm outline-none transition-all text-slate-800" placeholder="••••••••" />
                  </div>
                </div>
              )}

              {/* Library Node Name: Editable always, required fields checked */}
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Library Node Name</label>
                <div className="relative">
                  <Library className="absolute left-3 top-2.5 text-slate-400" size={16} />
                  <input 
                    name="libraryName" 
                    type="text" 
                    required 
                    value={form.libraryName} 
                    onChange={handleInputChange} 
                    className="w-full pl-9 pr-3 py-2 border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-indigo-500 rounded-xl text-sm outline-none transition-all text-slate-800" 
                    placeholder="e.g. Core Public Hub" 
                  />
                </div>
              </div>

              {/* Access Timelines Dates Grid */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Start Date</label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-2.5 text-slate-400" size={16} />
                    <input name="accessStartDate" type="date" required min={modalMode === "create" ? todayStr : ""} value={form.accessStartDate} onChange={handleInputChange} className="w-full pl-9 pr-3 py-2 border border-slate-200 bg-slate-50 text-slate-800 focus:bg-white focus:ring-2 focus:ring-indigo-500 rounded-xl text-xs outline-none transition-all" />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">End Date</label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-2.5 text-slate-400" size={16} />
                    <input name="accessEndDate" type="date" required min={form.accessStartDate || todayStr} value={form.accessEndDate} onChange={handleInputChange} className="w-full pl-9 pr-3 py-2 border border-slate-200 bg-slate-50 text-slate-800 focus:bg-white focus:ring-2 focus:ring-indigo-500 rounded-xl text-xs outline-none transition-all" />
                  </div>
                </div>
              </div>

              {/* Footer Control Actions Buttons */}
              <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-100">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-xs font-bold text-slate-500 hover:bg-slate-100 rounded-xl transition-all">Cancel</button>
                <button disabled={modalLoading} type="submit" className={`px-5 py-2 rounded-xl text-xs font-bold text-white shadow-md transition-all active:scale-95 ${
                  isSuperAdmin ? "bg-amber-600 hover:bg-amber-700" : "bg-indigo-600 hover:bg-indigo-700"
                }`}>
                  {modalLoading ? "Saving Changes..." : modalMode === "create" ? "Provision Account" : "Update Profile"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminList;