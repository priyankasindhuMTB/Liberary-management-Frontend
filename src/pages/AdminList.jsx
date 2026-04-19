import React, { useEffect, useState } from "react";
import axios from "axios";
import { Users, Loader2, AlertCircle } from "lucide-react";

const AdminList = () => {
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const API_URL = import.meta.env.VITE_API_URL;
  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchAdmins = async () => {
      try {
        setLoading(true);
        console.log("Fetching from:", `${API_URL}/api/admin/all`);
        
        const res = await axios.get(`${API_URL}/api/admin/all`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        console.log("Data received:", res.data);
        setAdmins(res.data);
      } catch (err) {
        console.error("Fetch Error:", err.response?.data || err.message);
        setError(err.response?.data?.message || "Failed to load admins");
      } finally {
        setLoading(false);
      }
    };

    if (token) fetchAdmins();
    else setError("No token found. Please login again.");
  }, [API_URL, token]);

  if (loading) return (
    <div className="flex flex-col items-center justify-center h-64 text-slate-500">
      <Loader2 className="animate-spin mb-2" size={32} />
      <p>Loading Admins...</p>
    </div>
  );

  if (error) return (
    <div className="m-8 p-4 bg-red-50 border border-red-100 rounded-xl text-red-700 flex items-center gap-3">
      <AlertCircle size={20} /> {error}
    </div>
  );

  return (
    <div className="p-8">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-indigo-100 text-indigo-600 rounded-lg">
          <Users size={24} />
        </div>
        <h1 className="text-2xl font-bold text-slate-800">Approved Library Admins</h1>
      </div>

      {admins.length === 0 ? (
        <div className="bg-white border border-dashed border-slate-300 rounded-2xl p-12 text-center text-slate-500">
          No registered admins found.
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Admin Name</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Email Address</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Library</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {admins.map((adm) => (
                <tr key={adm._id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 font-semibold text-slate-700">{adm.name}</td>
                  <td className="px-6 py-4 text-slate-600 font-mono text-sm">{adm.email}</td>
                  <td className="px-6 py-4">
                    <span className="text-indigo-600 font-medium bg-indigo-50 px-2 py-1 rounded">
                      {adm.libraryId?.name || "No Library Linked"}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center gap-1.5 bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-xs font-bold">
                      <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></div>
                      Active
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AdminList;