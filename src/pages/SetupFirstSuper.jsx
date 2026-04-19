import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import { 
  ShieldCheck, 
  UserPlus, 
  Mail, 
  Lock, 
  Loader2, 
  ArrowRight, 
  ShieldAlert,
  Terminal
} from "lucide-react";

const SetupFirstSuper = () => {
  const API_URL = import.meta.env.VITE_API_URL;
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);
  const [hasSuper, setHasSuper] = useState(true);
  const [message, setMessage] = useState({ text: "", type: "" });

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        if (!API_URL) {
          setMessage({ text: "Environment variable VITE_API_URL is missing.", type: "error" });
          setChecking(false);
          return;
        }
        const res = await axios.get(`${API_URL}/api/admin/has-super-admin`);
        if (!cancelled) setHasSuper(!!res.data?.hasSuperAdmin);
      } catch {
        if (!cancelled) setMessage({ text: "Server unreachable. Check backend connection.", type: "error" });
      } finally {
        if (!cancelled) setChecking(false);
      }
    })();
    return () => { cancelled = true; };
  }, [API_URL]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage({ text: "", type: "" });
    setLoading(true);
    try {
      await axios.post(`${API_URL}/api/admin/setup-first-super`, form);
      setMessage({ text: "Account provisioned! Redirecting to login...", type: "success" });
      setTimeout(() => navigate("/super-admin/login"), 2000);
    } catch (err) {
      setMessage({ text: err.response?.data?.message || "Setup failed", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  if (checking) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen bg-slate-50">
        <Loader2 className="animate-spin text-indigo-600 mb-4" size={40} />
        <p className="text-slate-500 font-medium animate-pulse">Checking system status...</p>
      </div>
    );
  }

  if (hasSuper) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 border border-slate-100 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-amber-50 text-amber-600 mb-6">
            <ShieldAlert size={32} />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mb-3">System Already Initialized</h1>
          <p className="text-slate-600 text-sm mb-6 leading-relaxed">
            A Super Admin already exists. For security reasons, this setup page is now locked. 
            To upgrade an existing account, use the terminal:
          </p>
          <div className="bg-slate-900 text-slate-300 p-3 rounded-lg text-xs font-mono mb-6 flex items-center gap-2">
            <Terminal size={14} className="text-emerald-400" />
            <span>npm run promote:superadmin -- {form.email || 'user@email.com'}</span>
          </div>
          <Link 
            to="/super-admin/login" 
            className="flex items-center justify-center gap-2 text-indigo-600 font-bold hover:text-indigo-700 transition-colors"
          >
            Go to Login <ArrowRight size={18} />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center mb-6">
          <div className="bg-indigo-600 p-3 rounded-2xl shadow-lg shadow-indigo-200">
            <ShieldCheck className="text-white" size={32} />
          </div>
        </div>
        <h2 className="text-center text-3xl font-extrabold text-slate-900">System Setup</h2>
        <p className="mt-2 text-center text-sm text-slate-600">
          Create the root administrator account.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-10 px-6 shadow-2xl shadow-slate-200/50 rounded-3xl border border-slate-100 sm:px-10">
          <form className="space-y-6" onSubmit={handleSubmit}>
            
            {message.text && (
              <div className={`p-4 rounded-xl text-sm font-medium border animate-in fade-in slide-in-from-top-2 ${
                message.type === "success" 
                ? "bg-emerald-50 text-emerald-800 border-emerald-100" 
                : "bg-red-50 text-red-700 border-red-100"
              }`}>
                {message.text}
              </div>
            )}

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Full Name</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <UserPlus size={18} />
                </div>
                <input
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  required
                  className="block w-full pl-10 pr-3 py-3 border border-slate-200 rounded-xl bg-slate-50 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all sm:text-sm"
                  placeholder="System Administrator"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Email Address</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Mail size={18} />
                </div>
                <input
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={handleChange}
                  required
                  className="block w-full pl-10 pr-3 py-3 border border-slate-200 rounded-xl bg-slate-50 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all sm:text-sm"
                  placeholder="admin@library.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Root Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Lock size={18} />
                </div>
                <input
                  name="password"
                  type="password"
                  value={form.password}
                  onChange={handleChange}
                  required
                  minLength={6}
                  className="block w-full pl-10 pr-3 py-3 border border-slate-200 rounded-xl bg-slate-50 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all sm:text-sm"
                  placeholder="Min. 6 characters"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center items-center py-3.5 px-4 border border-transparent rounded-xl shadow-lg shadow-indigo-100 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 transition-all active:scale-[0.98]"
            >
              {loading ? (
                <><Loader2 className="animate-spin mr-2" size={18} /> Finalizing...</>
              ) : (
                "Initialize System"
              )}
            </button>

            <div className="text-center">
              <Link to="/login" className="text-sm text-slate-400 hover:text-slate-600 transition-colors">
                Cancel and return to login
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SetupFirstSuper;