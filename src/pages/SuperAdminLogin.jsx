import React, { useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";

/**
 * Super admin only — same API as library login, but only super_admin role is accepted here.
 * Library admins must use /login.
 */
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
        setError("Missing VITE_API_URL — set it in frontend/.env");
        return;
      }

      const res = await axios.post(`${API_URL}/api/admin/login`, form);
      const role = res.data?.admin?.role;

      if (role !== "super_admin") {
        setError(
          "This account is a library admin, not a super admin. Use the library admin login page to manage your library."
        );
        return;
      }

      localStorage.setItem("token", res.data.token);
      localStorage.setItem("admin", JSON.stringify(res.data.admin));
      navigate("/super-admin");
    } catch (err) {
      const data = err.response?.data;
      setError(data?.message || "Login failed");
      setErrorCode(data?.code || "");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-slate-100 p-4">
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden">
        <div className="bg-slate-900 px-5 py-4">
          <h1 className="text-white font-bold text-lg">Super Admin Login</h1>
          <p className="text-white/65 text-xs mt-1">
            Approve library admin requests. Use a different page for daily library work.
          </p>
        </div>
        <form onSubmit={handleLogin} className="p-5 space-y-3">
          {error && (
            <div className="text-sm space-y-2">
              <p className="text-red-600">{error}</p>
              {errorCode === "PENDING_APPROVAL" && (
                <p className="text-slate-600">
                  Wait until a super admin approves your request, or sign in with an existing super admin account.
                </p>
              )}
              {(errorCode === "NO_ADMIN" || errorCode === "PENDING_APPROVAL") && (
                <p>
                  <Link to="/request" className="text-blue-600 underline font-medium">
                    Submit a library admin request
                  </Link>
                </p>
              )}
            </div>
          )}

          <input
            name="email"
            value={form.email}
            onChange={handleChange}
            placeholder="Super admin email"
            className="input w-full"
            type="email"
            autoComplete="username"
          />
          <input
            name="password"
            value={form.password}
            onChange={handleChange}
            type="password"
            placeholder="Password"
            className="input w-full"
            autoComplete="current-password"
          />

          <button
            disabled={loading}
            type="submit"
            className="w-full bg-slate-900 text-white font-bold py-2.5 rounded-lg hover:bg-slate-800 disabled:opacity-50"
          >
            {loading ? "Signing in…" : "Sign in as super admin"}
          </button>

          <p className="text-center text-xs text-slate-500 pt-2 border-t border-slate-100">
            <Link to="/login" className="text-blue-600 underline font-medium">
              Library admin login
            </Link>
            {" · "}
            <Link to="/setup-super" className="text-blue-600 underline">
              First-time setup
            </Link>
            {" · "}
            <Link to="/request" className="text-blue-600 underline">
              Request access
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
};

export default SuperAdminLogin;
