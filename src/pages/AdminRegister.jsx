import React, { useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import { User, Mail, Lock, Library, Loader2, AlertCircle, CheckCircle2, Sparkles } from "lucide-react";

const AdminRegister = () => {
  const API_URL = import.meta.env.VITE_API_URL;
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    libraryName: "",
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setMessage({ text: "", type: "" });

      const res = await axios.post(`${API_URL}/api/admin/register`, form);

      setMessage({
        text:
          res.data?.message ||
          "Account created! Check your email (and Spam folder) for the 7-day trial welcome message.",
        type: "success",
      });
      setForm({ name: "", email: "", password: "", libraryName: "" });

      setTimeout(() => navigate("/login"), 2000);
    } catch (err) {
      setMessage({
        text: err.response?.data?.message || "Registration failed. Please try again.",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center mb-3 text-indigo-600">
          <Sparkles size={40} />
        </div>
        <h2 className="text-center text-3xl font-extrabold text-slate-900">
          Create your library account
        </h2>
        <p className="mt-2 text-center text-sm text-slate-600">
          Register now and get a <span className="font-semibold text-indigo-600">7-day free trial</span>.
          No approval needed — start managing seats right away.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-xl shadow-slate-200/50 sm:rounded-xl sm:px-10 border border-slate-100">
          <form className="space-y-5" onSubmit={handleSubmit}>
            {message.text && (
              <div
                className={`p-4 rounded-lg flex items-center gap-3 text-sm ${
                  message.type === "error"
                    ? "bg-red-50 text-red-700 border border-red-100"
                    : "bg-emerald-50 text-emerald-700 border border-emerald-100"
                }`}
              >
                {message.type === "error" ? <AlertCircle size={18} /> : <CheckCircle2 size={18} />}
                {message.text}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-slate-700">Full Name</label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <User size={18} />
                </div>
                <input
                  name="name"
                  type="text"
                  required
                  value={form.name}
                  onChange={handleChange}
                  className="block w-full pl-10 pr-3 py-2 border border-slate-300 rounded-md bg-white placeholder-slate-400 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  placeholder="John Doe"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700">Email Address</label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Mail size={18} />
                </div>
                <input
                  name="email"
                  type="email"
                  required
                  value={form.email}
                  onChange={handleChange}
                  className="block w-full pl-10 pr-3 py-2 border border-slate-300 rounded-md bg-white placeholder-slate-400 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  placeholder="admin@example.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700">Password</label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Lock size={18} />
                </div>
                <input
                  name="password"
                  type="password"
                  required
                  minLength={6}
                  value={form.password}
                  onChange={handleChange}
                  className="block w-full pl-10 pr-3 py-2 border border-slate-300 rounded-md bg-white placeholder-slate-400 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700">Library Name</label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Library size={18} />
                </div>
                <input
                  name="libraryName"
                  type="text"
                  required
                  value={form.libraryName}
                  onChange={handleChange}
                  className="block w-full pl-10 pr-3 py-2 border border-slate-300 rounded-md bg-white placeholder-slate-400 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  placeholder="Central Study Hall"
                />
              </div>
            </div>

            <button
              disabled={loading}
              type="submit"
              className="w-full flex justify-center items-center py-2.5 px-4 border border-transparent rounded-md shadow-sm text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin mr-2" size={18} /> Creating account...
                </>
              ) : (
                "Start free trial"
              )}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-500">
            Already have an account?{" "}
            <Link to="/login" className="font-semibold text-indigo-600 hover:underline">
              Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default AdminRegister;
