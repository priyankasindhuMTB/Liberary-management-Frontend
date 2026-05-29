import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { CheckCircle, AlertTriangle, Loader2, RefreshCw, LogOut, Building, Calendar, XCircle, Clock } from "lucide-react";

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
  const [selectedDuration, setSelectedDuration] = useState({});

  const adminProfile = useMemo(() => {
    try { return JSON.parse(localStorage.getItem("admin")) || {}; } catch { return {}; }
  }, []);

  const fetchAllRequests = async () => {
    try {
      setLoading(true);
      // ✅ LOGIC RESTORED: Sirf Pending Requests fetch karega
      const res = await axios.get(`${API_URL}/api/admin-request`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAdmins(res.data);
      
      const initialDurations = {};
      res.data.forEach(item => {
        initialDurations[item._id] = "3"; 
      });
      setSelectedDuration(initialDurations);
    } catch (err) {
      console.error("Fetch Error:", err.response?.data || err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { 
    if (readAdminRole() !== "super_admin") {
      navigate("/login"); 
      return;
    }
    fetchAllRequests(); 
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("admin");
    navigate("/login"); 
  };

  const handleReject = async (id) => {
    setApproveError("");
    setActionLoading(id);
    try {
      await axios.put(
        `${API_URL}/api/admin-request/reject/${id}`, 
        { superAdminRemarks: "Rejected by Administration" },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      await fetchAllRequests();
    } catch (err) {
      setApproveError(err.response?.data?.message || err.message);
    } finally {
      setActionLoading(null);
    }
  };

  const handleApprove = async (id) => {
    setApproveError("");
    setActionLoading(id);
    try {
      const durationMonths = selectedDuration[id] || "3";
      await axios.put(
        `${API_URL}/api/admin-request/approve/${id}`,
        { 
          superAdminRemarks: "Approved by Administration",
          durationMonths: parseInt(durationMonths)
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      await fetchAllRequests();
    } catch (err) {
      setApproveError(err.response?.data?.message || err.message);
    } finally {
      setActionLoading(null);
    }
  };

  const handleDurationChange = (id, months) => {
    setSelectedDuration(prev => ({ ...prev, [id]: months }));
  };

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
        <p className="text-slate-400 font-bold text-sm tracking-wide">Loading Pending Queue...</p>
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
            <span className="bg-amber-500/10 border border-amber-500/20 text-amber-400 text-[10px] font-black px-2 py-0.5 rounded-md uppercase tracking-wider hidden sm:inline-block">
              Pending Queue Monitor
            </span>
          </div>

          <div className="flex items-center gap-4">
            <button 
              onClick={handleLogout}
              className="flex items-center gap-2 bg-slate-700 hover:bg-red-500/20 hover:text-red-400 text-slate-300 font-bold px-4 py-2 rounded-xl text-xs transition-all border border-slate-600"
            >
              <LogOut size={14} /> Sign Out
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 mt-8">
        
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="text-2xl font-black text-white tracking-tight">Pending Registration Requests</h1>
            <p className="text-slate-400 text-sm mt-1">Review new libraries waiting for access authorization and set expiration times.</p>
          </div>
          <button 
            onClick={fetchAllRequests} 
            className="flex items-center gap-2 text-xs font-bold text-indigo-400 hover:text-white bg-slate-800 px-4 py-2.5 rounded-xl border border-slate-700 shadow-sm transition-all"
          >
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} /> Refresh Queue
          </button>
        </div>

        {/* 📋 PENDING TABLE LIST */}
        <div className="bg-slate-800/40 border border-slate-700/50 rounded-2xl overflow-hidden shadow-xl">
          <div className="grid grid-cols-12 gap-4 bg-slate-800/80 px-6 py-4 border-b border-slate-700/60 text-xs font-black uppercase text-slate-400 tracking-wider">
            <div className="col-span-4">Library / Applicant Details</div>
            <div className="col-span-4">Choose Duration Plan</div>
            <div className="col-span-4 text-right">Actions</div>
          </div>

          {admins.length === 0 ? (
            <div className="p-16 text-center shadow-inner">
              <CheckCircle className="mx-auto mb-4 text-emerald-500" size={44} />
              <p className="font-bold text-lg text-slate-300">Queue is Empty!</p>
              <p className="text-sm text-slate-500 mt-1">No new registration inquiries are pending review right now.</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-700/40">
              {admins.map((reqItem) => {
                const isProcessing = actionLoading === reqItem._id;

                return (
                  <div key={reqItem._id} className="grid grid-cols-12 gap-4 px-6 py-4 items-center hover:bg-slate-800/30">
                    
                    {/* Details */}
                    <div className="col-span-4">
                      <h4 className="font-bold text-sm text-white">{reqItem.libraryName}</h4>
                      <p className="text-xs text-slate-400 font-medium">{reqItem.name} • {reqItem.email}</p>
                    </div>

                    {/* Plan Selector */}
                    <div className="col-span-4 flex items-center gap-2">
                      <Clock size={14} className="text-slate-400" />
                      <select
                        value={selectedDuration[reqItem._id] || "3"}
                        onChange={(e) => handleDurationChange(reqItem._id, e.target.value)}
                        disabled={isProcessing}
                        className="bg-slate-800 border border-slate-700 text-xs font-bold text-slate-200 rounded-xl px-3 py-2 cursor-pointer outline-none focus:border-indigo-500 transition-all"
                      >
                        <option value="1">1 Month</option>
                        <option value="3">3 Months</option>
                        <option value="6">6 Months</option>
                        <option value="12">1 Year</option>
                      </select>
                    </div>

                    {/* Action Buttons */}
                    <div className="col-span-4 text-right flex items-center justify-end gap-2">
                      <button
                        type="button"
                        disabled={isProcessing}
                        onClick={() => handleReject(reqItem._id)}
                        className="bg-slate-800 hover:bg-red-500/10 text-slate-400 hover:text-red-400 border border-slate-700 hover:border-red-500/20 px-3 py-1.5 rounded-xl text-xs font-bold transition-all"
                      >
                        Reject
                      </button>
                      <button
                        type="button"
                        disabled={isProcessing}
                        onClick={() => handleApprove(reqItem._id)}
                        className="bg-indigo-600 hover:bg-indigo-500 text-white px-3 py-1.5 rounded-xl text-xs font-bold transition-all shadow-md"
                      >
                        {isProcessing ? "Approving..." : "Authorize"}
                      </button>
                    </div>

                  </div>
                );
              })}
            </div>
          )}
        </div>

        {approveError && (
          <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center gap-2 text-red-400 text-xs font-bold mt-4">
            <AlertTriangle size={14} /> Fault: {approveError}
          </div>
        )}
      </div>
    </div>
  );
};

export default SuperAdmin;