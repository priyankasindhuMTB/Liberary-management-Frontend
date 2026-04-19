import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
// Icons for a professional touch
import { 
  Users, 
  CheckCircle, 
  AlertTriangle, 
  ShieldAlert, 
  Loader2, 
  ExternalLink,
  ShieldCheck,
  RefreshCw
} from "lucide-react";

function readAdminRole() {
  try {
    const raw = localStorage.getItem("admin");
    if (!raw) return null;
    return JSON.parse(raw).role ?? null;
  } catch {
    return null;
  }
}

const SuperAdmin = () => {
  const API_URL = import.meta.env.VITE_API_URL;
  const token = localStorage.getItem("token");

  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [approveError, setApproveError] = useState("");
  const [superAdminCheck, setSuperAdminCheck] = useState("loading");
  const [canApprove, setCanApprove] = useState(false);
  const [devBypassActive, setDevBypassActive] = useState(false);
  const [capabilityLoaded, setCapabilityLoaded] = useState(false);
  const [authRejected, setAuthRejected] = useState(false);

  const isSuperAdmin = useMemo(() => readAdminRole() === "super_admin", []);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_URL}/api/admin-request`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setRequests(res.data);
      setAuthRejected(false);
    } catch (err) {
      console.error("Fetch Error:", err.response?.data || err.message);
      const s = err.response?.status;
      if (s === 401 || s === 403) setAuthRejected(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchRequests(); }, []);

  useEffect(() => {
    if (!API_URL) { setSuperAdminCheck("unknown"); return; }
    axios.get(`${API_URL}/api/admin/has-super-admin`)
      .then((r) => setSuperAdminCheck(r.data?.hasSuperAdmin ? "yes" : "no"))
      .catch(() => setSuperAdminCheck("unknown"));
  }, [API_URL]);

  useEffect(() => {
    if (!API_URL || !token) { setCapabilityLoaded(true); return; }
    axios.get(`${API_URL}/api/admin/approve-capability`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((r) => {
        setAuthRejected(false);
        setCanApprove(!!r.data?.canApprove);
        setDevBypassActive(!!r.data?.devBypassActive);
      })
      .catch((err) => {
        setCanApprove(false);
        setDevBypassActive(false);
        const s = err.response?.status;
        setAuthRejected(s === 401 || s === 403);
      })
      .finally(() => setCapabilityLoaded(true));
  }, [API_URL, token]);

  const approveDisabled = capabilityLoaded ? !canApprove : true;

  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">System Administration</h1>
            <p className="text-slate-500 mt-1 flex items-center gap-2">
              <Users size={16} /> Manage pending library access requests
            </p>
          </div>
          <button 
            onClick={fetchRequests} 
            className="flex items-center gap-2 text-sm font-semibold text-indigo-600 hover:text-indigo-700 bg-white px-4 py-2 rounded-lg border border-slate-200 shadow-sm transition-all"
          >
            <RefreshCw size={16} className={loading ? "animate-spin" : ""} /> Refresh Data
          </button>
        </div>

        {/* Informational Banners */}
        <div className="space-y-4 mb-8">
          {/* Dev Bypass Banner */}
          {devBypassActive && (
            <div className="flex items-center gap-3 bg-sky-50 border border-sky-100 p-3 rounded-xl text-sky-800 text-sm">
              <ShieldCheck size={20} className="text-sky-500" />
              <p><strong>Developer Mode:</strong> Bypass active. Any admin can approve requests for testing.</p>
            </div>
          )}

          {/* Setup Required Banner */}
          {!isSuperAdmin && superAdminCheck === "no" && (
            <div className="bg-emerald-50 border border-emerald-100 p-5 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex gap-3">
                <ShieldAlert size={24} className="text-emerald-600 shrink-0" />
                <div>
                  <h3 className="font-bold text-emerald-900">First-time Setup Required</h3>
                  <p className="text-emerald-700 text-sm">No super admin found. Create the primary account to begin.</p>
                </div>
              </div>
              <Link to="/setup-super" className="bg-emerald-600 text-white px-4 py-2 rounded-lg font-bold text-sm hover:bg-emerald-700 transition-colors shadow-sm whitespace-nowrap">
                Initialize System
              </Link>
            </div>
          )}

          {/* Access Restricted Banner */}
          {capabilityLoaded && !authRejected && !canApprove && superAdminCheck === "yes" && (
            <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl flex gap-3 text-amber-900 text-sm shadow-sm">
              <AlertTriangle size={20} className="text-amber-600 shrink-0" />
              <div>
                <p className="font-bold">Insufficient Permissions</p>
                <p className="mt-1">Only super admins can approve. Log in with higher credentials or enable bypass in <code>.env</code>.</p>
              </div>
            </div>
          )}

          {/* Session Expired */}
          {capabilityLoaded && authRejected && (
            <div className="bg-red-50 border border-red-200 p-4 rounded-xl flex items-center justify-between text-red-900 text-sm shadow-sm">
              <div className="flex gap-3">
                <ShieldAlert size={20} className="text-red-600" />
                <p className="font-bold">Session Expired</p>
              </div>
              <Link to="/super-admin/login" className="bg-red-600 text-white px-4 py-2 rounded-lg font-bold text-xs hover:bg-red-700 transition-colors">
                Log In Again
              </Link>
            </div>
          )}
        </div>

        {/* Requests List */}
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-slate-800 px-1">Pending Approval ({requests.length})</h2>
          
          {loading && requests.length === 0 ? (
            <div className="bg-white border border-slate-200 rounded-2xl p-12 flex flex-col items-center justify-center text-slate-400">
              <Loader2 className="animate-spin mb-4" size={32} />
              <p>Fetching database records...</p>
            </div>
          ) : requests.length === 0 ? (
            <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center text-slate-500 shadow-sm">
              <CheckCircle className="mx-auto mb-3 text-slate-300" size={40} />
              <p className="font-medium text-lg text-slate-600">All caught up!</p>
              <p className="text-sm">There are no pending admin requests at this time.</p>
            </div>
          ) : (
            requests.map((r) => (
              <div key={r._id} className="group bg-white border border-slate-200 p-5 rounded-2xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:shadow-md hover:border-indigo-100 transition-all duration-200 shadow-sm">
                <div className="flex gap-4 items-center">
                  <div className="h-12 w-12 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center font-bold text-lg uppercase shadow-inner">
                    {r.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">{r.name}</h3>
                    <p className="text-sm text-slate-500 font-medium">{r.email}</p>
                    <div className="flex items-center gap-1.5 mt-1 text-xs text-indigo-500 font-bold bg-indigo-50/50 w-fit px-2 py-0.5 rounded-md">
                      <ExternalLink size={12} />
                      {r.libraryName}
                    </div>
                  </div>
                </div>

                <div className="w-full sm:w-auto flex flex-col gap-2">
                  <button
                    type="button"
                    disabled={approveDisabled}
                    onClick={async () => {
                      setApproveError("");
                      try {
                        await axios.put(
                          `${API_URL}/api/admin-request/approve/${r._id}`,
                          {},
                          { headers: { Authorization: `Bearer ${token}` } }
                        );
                        fetchRequests();
                      } catch (err) {
                        setApproveError(err.response?.data?.message || err.message);
                      }
                    }}
                    className={`w-full sm:w-32 px-5 py-2.5 rounded-xl font-bold text-sm shadow-sm transition-all flex items-center justify-center gap-2 ${
                      approveDisabled
                        ? "bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200"
                        : "bg-indigo-600 text-white hover:bg-indigo-700 active:scale-95"
                    }`}
                  >
                    {approveDisabled ? <ShieldAlert size={16} /> : <CheckCircle size={16} />}
                    Approve
                  </button>
                </div>
              </div>
            ))
          )}
          
          {approveError && (
            <div className="mt-4 p-3 bg-red-50 border border-red-100 rounded-lg flex items-center gap-2 text-red-600 text-xs font-bold animate-pulse">
              <AlertTriangle size={14} /> {approveError}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SuperAdmin;