import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";

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
          setMessage({ text: "Set VITE_API_URL in frontend/.env", type: "error" });
          setChecking(false);
          return;
        }
        const res = await axios.get(`${API_URL}/api/admin/has-super-admin`);
        if (!cancelled) {
          setHasSuper(!!res.data?.hasSuperAdmin);
        }
      } catch {
        if (!cancelled) setMessage({ text: "Could not reach the server.", type: "error" });
      } finally {
        if (!cancelled) setChecking(false);
      }
    })();
    return () => {
      cancelled = true;
    };
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
      setMessage({
        text: "Done! Log in on the next page with this email and password.",
        type: "success",
      });
      setTimeout(() => navigate("/super-admin/login"), 2000);
    } catch (err) {
      setMessage({
        text: err.response?.data?.message || "Setup failed",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  if (checking) {
    return (
      <div className="flex justify-center items-center min-h-[60vh] text-slate-600">
        Checking setup…
      </div>
    );
  }

  if (hasSuper) {
    return (
      <div className="max-w-md mx-auto p-6 mt-8 bg-white rounded-xl shadow border border-slate-100">
        <h1 className="text-xl font-bold text-slate-900 mb-2">Super admin already exists</h1>
        <p className="text-slate-600 text-sm mb-4">
          Use the account that has role <code className="bg-slate-100 px-1 rounded">super_admin</code> to
          approve requests. If you only have a library admin, run in the backend folder:{" "}
          <code className="bg-slate-100 px-1 rounded text-xs">npm run promote:superadmin -- you@email.com</code>{" "}
          then log out and log in again.
        </p>
        <Link to="/super-admin/login" className="text-blue-600 font-medium underline">
          Super Admin login
        </Link>
      </div>
    );
  }

  return (
    <div className="flex justify-center items-center min-h-[70vh] p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg border border-slate-100 overflow-hidden">
        <div className="bg-slate-900 px-6 py-5">
          <h1 className="text-white font-bold text-lg">First-time setup</h1>
          <p className="text-white/60 text-sm mt-1">
            Create the first super admin (only works when none exists yet). Then you can approve library
            requests at /super-admin.
          </p>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {message.text && (
            <p
              className={`text-sm p-3 rounded-lg ${
                message.type === "success" ? "bg-emerald-50 text-emerald-800" : "bg-red-50 text-red-700"
              }`}
            >
              {message.text}
            </p>
          )}
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Your name</label>
            <input
              name="name"
              value={form.name}
              onChange={handleChange}
              required
              className="w-full border border-slate-200 rounded-xl px-4 py-3"
              placeholder="e.g. Priya"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Email</label>
            <input
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              required
              className="w-full border border-slate-200 rounded-xl px-4 py-3"
              placeholder="you@email.com"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Password</label>
            <input
              name="password"
              type="password"
              value={form.password}
              onChange={handleChange}
              required
              minLength={6}
              className="w-full border border-slate-200 rounded-xl px-4 py-3"
              placeholder="Min. 6 characters"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-indigo-600 text-white font-bold disabled:opacity-50"
          >
            {loading ? "Creating…" : "Create super admin"}
          </button>
          <p className="text-center text-sm text-slate-500">
            <Link to="/login" className="text-blue-600 underline">
              Cancel — library admin login
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
};

export default SetupFirstSuper;
