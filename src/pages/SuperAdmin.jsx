

import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

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
  /** loading | yes | no | unknown */
  const [superAdminCheck, setSuperAdminCheck] = useState("loading");
  const [canApprove, setCanApprove] = useState(false);
  const [devBypassActive, setDevBypassActive] = useState(false);
  const [capabilityLoaded, setCapabilityLoaded] = useState(false);
  /** Set when approve-capability fails with 401/403 (e.g. expired JWT) — not the same as "library admin cannot approve". */
  const [authRejected, setAuthRejected] = useState(false);

  const isSuperAdmin = useMemo(() => readAdminRole() === "super_admin", []);

  const fetchRequests = async () => {
    console.log("📥 Fetching Requests...");

    try {
      setLoading(true);

      const res = await axios.get(`${API_URL}/api/admin-request`, {
      headers: { Authorization: `Bearer ${token}` }
      });

      console.log("✅ Requests:", res.data);

      setRequests(res.data);
      setAuthRejected(false);

    } catch (err) {
      console.error("❌ Fetch Error:", err.response?.data || err.message);
      const s = err.response?.status;
      if (s === 401 || s === 403) setAuthRejected(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  useEffect(() => {
    if (!API_URL) {
      setSuperAdminCheck("unknown");
      return;
    }
    axios
      .get(`${API_URL}/api/admin/has-super-admin`)
      .then((r) => setSuperAdminCheck(r.data?.hasSuperAdmin ? "yes" : "no"))
      .catch(() => setSuperAdminCheck("unknown"));
  }, [API_URL]);

  useEffect(() => {
    if (!API_URL || !token) {
      setCapabilityLoaded(true);
      return;
    }
    axios
      .get(`${API_URL}/api/admin/approve-capability`, {
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
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Pending Requests</h1>

      {!isSuperAdmin && superAdminCheck === "no" && (
        <div className="mb-6 rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-emerald-900 text-sm">
          <p className="font-bold mb-2">No super admin in the database yet</p>
          <p className="mb-3">
            Approve needs a <code className="bg-emerald-100 px-1 rounded">super_admin</code> account. Create the first
            one in the browser (no terminal):
          </p>
          <Link
            to="/setup-super"
            className="inline-block bg-emerald-600 text-white font-bold px-4 py-2 rounded-lg no-underline hover:bg-emerald-700"
          >
            Open first-time super admin setup
          </Link>
          <p className="mt-3 text-emerald-800/90">
            Then use <Link to="/super-admin/login" className="font-semibold underline">Super Admin login</Link> with
            the new email, and return here to approve.
          </p>
        </div>
      )}

      {!isSuperAdmin && superAdminCheck === "unknown" && (
        <div className="mb-6 rounded-lg border border-slate-200 bg-slate-50 p-4 text-slate-700 text-sm">
          <p className="mb-2">Could not verify super admin status. If Approve does nothing or errors, try:</p>
          <ul className="list-disc ml-5 space-y-1">
            <li>
              <Link to="/setup-super" className="text-blue-600 underline font-medium">
                First-time super admin setup
              </Link>{" "}
              (only if no super admin exists yet)
            </li>
            <li>Or promote your account from the backend terminal (see below).</li>
          </ul>
        </div>
      )}

      {devBypassActive && (
        <div className="mb-4 rounded-lg border border-sky-200 bg-sky-50 p-3 text-sky-900 text-sm">
          Dev mode: <code className="bg-sky-100 px-1 rounded">ALLOW_LIBRARY_ADMIN_APPROVE=true</code> in backend{" "}
          <code className="bg-sky-100 px-1 rounded">.env</code> — library admins can approve. Remove this in production.
        </div>
      )}

      {capabilityLoaded && authRejected && (
        <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-red-900 text-sm">
          <p className="font-bold mb-2">Session expired or invalid token</p>
          <p className="mb-3">
            The list of requests may still show, but approving requires a valid login. Your JWT lasts about one day —
            log in again to refresh it.
          </p>
          <Link
            to="/super-admin/login"
            className="inline-block bg-red-700 text-white font-bold px-4 py-2 rounded-lg no-underline hover:bg-red-800"
          >
            Super Admin login
          </Link>
        </div>
      )}

      {capabilityLoaded && !authRejected && !canApprove && superAdminCheck === "yes" && (
        <div className="mb-6 rounded-lg border border-amber-200 bg-amber-50 p-4 text-amber-900 text-sm">
          <p className="font-bold mb-2">Approve is only allowed for super admins</p>
          <p className="mb-2">
            You are logged in as a <strong>library admin</strong>. The Approve button stays off until the server allows
            it.
          </p>
          <p className="mb-2 font-semibold">Quick local fix (development only)</p>
          <p className="mb-2">
            Add to <code className="bg-amber-100 px-1 rounded">backend/.env</code>:{" "}
            <code className="bg-amber-100 px-1 rounded">ALLOW_LIBRARY_ADMIN_APPROVE=true</code> — restart the backend —
            refresh this page. Then Approve works without promoting your user.
          </p>
          <p className="mb-2 font-semibold">Proper fix</p>
          <p className="mb-2">
            Run <code className="bg-amber-100 px-1 rounded">npm run promote:superadmin -- you@email.com</code> in the
            backend folder (your login email), then <strong>log out and log in again</strong>.
          </p>
          <p>Or log in with an account that is already <code className="bg-amber-100 px-1 rounded">super_admin</code>.</p>
        </div>
      )}

      {approveError && (
        <p className="mb-4 text-sm text-red-600">{approveError}</p>
      )}

      {loading ? (
        <p>Loading...</p>
      ) : requests.length === 0 ? (
        <p className="text-slate-500">No pending requests.</p>
      ) : (
        requests.map((r) => (
          <div key={r._id} className="border p-3 mb-2 flex justify-between items-center gap-4">
            <div>
              <p>{r.name}</p>
              <p>{r.email}</p>
              <p>{r.libraryName}</p>
            </div>

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
                  const msg = err.response?.data?.message || err.message;
                  setApproveError(String(msg));
                }
              }}
              className={`px-4 py-2 rounded text-white ${
                approveDisabled ? "bg-slate-400 cursor-not-allowed" : "bg-blue-500 hover:bg-blue-600"
              }`}
            >
              Approve
            </button>
          </div>
        ))
      )}
    </div>
  );
};

export default SuperAdmin;