import React, { useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import { Mail, Lock, LogIn, Loader2, AlertCircle, ShieldCheck } from "lucide-react";

const Login = () => {
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

      const res = await axios.post(`${API_URL}/api/admin/login`, form);
      const { admin, token } = res.data;

      localStorage.setItem("token", token);
      localStorage.setItem("admin", JSON.stringify(admin));

      if (admin.role === "super_admin") {
        navigate("/super-admin");
      } else {
        navigate("/users");
      }
    } catch (err) {
      const data = err.response?.data;
      setError(data?.message || "Login failed");
      setErrorCode(data?.code || "");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        {/* Simple Branding / Icon */}
        <div className="flex justify-center mb-4 text-blue-600">
          <ShieldCheck size={48} />
        </div>
        <h2 className="text-center text-3xl font-extrabold text-slate-900 tracking-tight">
          Library Admin Login
        </h2>
        <p className="mt-2 text-center text-sm text-slate-600">
          Daily library work — members, seats, shifts.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 shadow-xl shadow-slate-200/60 rounded-xl border border-slate-100">
          <form className="space-y-6" onSubmit={handleLogin}>
            
            {/* Error Handling UI */}
            {error && (
              <div className="p-4 rounded-lg bg-red-50 border border-red-100 text-sm text-red-700 animate-in fade-in duration-300">
                <div className="flex items-center mb-2">
                  <AlertCircle size={18} className="mr-2" />
                  <span className="font-semibold">{error}</span>
                </div>
                
                <div className="space-y-2 ml-6 text-xs leading-relaxed">
                  {error.includes("Super admins must use") && (
                    <Link to="/super-admin/login" className="block text-blue-600 hover:underline font-medium">
                      → Open Super Admin login
                    </Link>
                  )}
                  {errorCode === "PENDING_APPROVAL" && (
                    <p className="text-slate-600">
                      Ask your super admin to approve your request in the <strong>Super Admin</strong> panel.
                    </p>
                  )}
                  {(errorCode === "NO_ADMIN" || errorCode === "PENDING_APPROVAL") && (
                    <Link to="/request" className="block text-blue-600 hover:underline font-medium">
                      → Submit a library admin request
                    </Link>
                  )}
                </div>
              </div>
            )}

            {/* Email Input */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Email Address</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Mail size={18} />
                </div>
                <input
                  name="email"
                  type="email"
                  required
                  value={form.email}
                  onChange={handleChange}
                  className="block w-full pl-10 pr-3 py-2.5 border border-slate-300 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-all"
                  placeholder="admin@library.com"
                />
              </div>
            </div>

            {/* Password Input */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Lock size={18} />
                </div>
                <input
                  name="password"
                  type="password"
                  required
                  value={form.password}
                  onChange={handleChange}
                  className="block w-full pl-10 pr-3 py-2.5 border border-slate-300 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-all"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button
              disabled={loading}
              type="submit"
              className="w-full flex justify-center items-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-70 transition-all duration-200"
            >
              {loading ? (
                <><Loader2 className="animate-spin mr-2" size={18} /> Logging in...</>
              ) : (
                <><LogIn className="mr-2" size={18} /> Login</>
              )}
            </button>
          </form>

          {/* Footer Links */}
          <div className="mt-8 pt-6 border-t border-slate-100">
            <div className="grid grid-cols-1 gap-2 text-center text-xs">
              <Link to="/super-admin/login" className="text-blue-600 hover:text-blue-800 font-medium transition-colors">
                Super Admin Portal
              </Link>
              <div className="flex justify-center items-center gap-2 text-slate-400">
                <Link to="/setup-super" className="hover:text-slate-600 transition-colors">Setup</Link>
                <span>•</span>
                <Link to="/request" className="hover:text-slate-600 transition-colors">Request Access</Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;