import React, { useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import { 
  ShieldAlert, 
  Mail, 
  Lock, 
  LogIn, 
  Loader2, 
  ArrowLeft, 
  Fingerprint 
} from "lucide-react";

const SuperAdminLogin = () => {
  const API_URL = import.meta.env.VITE_API_URL;
  const navigate = useNavigate();

  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [errorCode, setErrorCode] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError("");
      setErrorCode("");

      if (!API_URL) {
        setError("Network Configuration Error: VITE_API_URL is missing.");
        return;
      }

      const res = await axios.post(`${API_URL}/api/admin/login`, form);
      const role = res.data?.admin?.role;

      if (role !== "super_admin") {
        setError("Unauthorized Access: This portal is reserved for Super Administrators.");
        return;
      }

      localStorage.setItem("token", res.data.token);
      localStorage.setItem("admin", JSON.stringify(res.data.admin));
      navigate("/super-admin");
    } catch (err) {
      const data = err.response?.data;
      setError(data?.message || "Authentication failed");
      setErrorCode(data?.code || "");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center mb-6">
          <div className="p-3 bg-indigo-500/10 rounded-2xl border border-indigo-500/20">
            <Fingerprint className="text-indigo-400" size={40} />
          </div>
        </div>
        <h2 className="text-center text-3xl font-extrabold text-white tracking-tight">
          Super Admin Portal
        </h2>
        <p className="mt-2 text-center text-sm text-slate-400">
          Elevated privileges required for access.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-slate-800/50 backdrop-blur-xl py-8 px-6 shadow-2xl rounded-3xl border border-slate-700 sm:px-10">
          <form className="space-y-6" onSubmit={handleLogin}>
            
            {/* Error Notification */}
            {error && (
              <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-sm animate-in fade-in slide-in-from-top-2">
                <div className="flex gap-3">
                  <ShieldAlert className="text-red-400 shrink-0" size={20} />
                  <div className="space-y-2">
                    <p className="text-red-200 font-medium">{error}</p>
                    {errorCode === "PENDING_APPROVAL" && (
                      <p className="text-red-300/70 text-xs">Account awaiting verification.</p>
                    )}
                    {(errorCode === "NO_ADMIN" || errorCode === "PENDING_APPROVAL") && (
                      <Link to="/request" className="block text-indigo-400 hover:text-indigo-300 text-xs font-bold underline">
                        Submit Access Request
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-1">Admin Email</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                  <Mail size={18} />
                </div>
                <input
                  name="email"
                  type="email"
                  required
                  value={form.email}
                  onChange={handleChange}
                  className="block w-full pl-10 pr-3 py-3 bg-slate-900/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all sm:text-sm"
                  placeholder="admin@system.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-1">Secure Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                  <Lock size={18} />
                </div>
                <input
                  name="password"
                  type="password"
                  required
                  value={form.password}
                  onChange={handleChange}
                  className="block w-full pl-10 pr-3 py-3 bg-slate-900/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all sm:text-sm"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button
              disabled={loading}
              type="submit"
              className="w-full flex justify-center items-center py-3.5 px-4 border border-transparent rounded-xl shadow-lg text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-indigo-500 disabled:opacity-50 transition-all active:scale-[0.98]"
            >
              {loading ? (
                <><Loader2 className="animate-spin mr-2" size={18} /> Verifying...</>
              ) : (
                <><LogIn className="mr-2" size={18} /> Authenticate</>
              )}
            </button>
          </form>

          {/* Quick Links */}
          <div className="mt-8 pt-6 border-t border-slate-700/50">
            <div className="flex flex-col items-center gap-4">
              <Link 
                to="/login" 
                className="flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors"
              >
                <ArrowLeft size={14} /> Library Admin Login
              </Link>
              <div className="flex gap-4 text-xs text-slate-500 font-medium">
                <Link to="/setup-super" className="hover:text-indigo-400">System Setup</Link>
                <span className="text-slate-700">|</span>
                <Link to="/request" className="hover:text-indigo-400">Request Access</Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SuperAdminLogin;