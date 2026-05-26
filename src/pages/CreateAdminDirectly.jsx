import React, { useState, useEffect } from "react";
import axios from "axios";
import { UserPlus, User, Mail, Lock, Library, Calendar, Loader2 } from "lucide-react";
import { toast } from 'react-hot-toast';

const CreateAdminDirectly = ({ onAdminCreated }) => {
  const API_URL = import.meta.env.VITE_API_URL;
  const token = localStorage.getItem("token");

  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [loading, setLoading] = useState(false);

  const todayStr = new Date().toISOString().split("T")[0];

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    libraryName: "",
    accessStartDate: todayStr,
    accessEndDate: ""
  });

  useEffect(() => {
    try {
      const adminData = JSON.parse(localStorage.getItem("admin"));
      if (adminData?.role === "super_admin") setIsSuperAdmin(true);
    } catch (err) {
      console.error("Failed to parse admin profile context:", err);
    }
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation check: Make sure dates are realistic
    if (form.accessEndDate && new Date(form.accessStartDate) >= new Date(form.accessEndDate)) {
      toast.error("Access End Date must be set after the Start Date.");
      return;
    }

    const toastLoadingId = toast.loading("Initializing admin provisioning profiles...");
    try {
      setLoading(true);

      const headers = { Authorization: `Bearer ${token}` };
      const res = await axios.post(`${API_URL}/api/admin/create-direct`, form, { headers });

      toast.success(res.data.message || "Account profile initialized successfully! 🚀", { id: toastLoadingId });
      
      // Reset back to initial state defaults safely
      setForm({ 
        name: "", 
        email: "", 
        password: "", 
        libraryName: "", 
        accessStartDate: todayStr, 
        accessEndDate: "" 
      });
      
      if (onAdminCreated) onAdminCreated(); 
    } catch (err) {
      const fallbackErr = err.response?.data?.message || "Failed to create administrator account.";
      toast.error(fallbackErr, { id: toastLoadingId });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto my-8 p-8 bg-white rounded-2xl border border-slate-200 shadow-sm">
      
      {/* Header Banner Section */}
      <div className="flex items-center gap-3 mb-6 border-b border-slate-100 pb-4">
        <div className={`p-2.5 rounded-xl ${isSuperAdmin ? "bg-amber-50 text-amber-600" : "bg-indigo-50 text-indigo-600"}`}>
          <UserPlus size={22} />
        </div>
        <div>
          <h2 className="text-lg font-black text-slate-800 tracking-tight">Direct Provisioning</h2>
          <p className="text-xs text-slate-400 mt-0.5">Bypasses public validation queue nodes.</p>
        </div>
      </div>

      {/* Entry Inputs Form Data Wrapper */}
      <form onSubmit={handleSubmit} className="space-y-4">
        
        {/* Full Name Input Field */}
        <div>
          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Full Name</label>
          <div className="relative">
            <User className="absolute left-3 top-2.5 text-slate-400" size={16} />
            <input name="name" type="text" required value={form.name} onChange={handleChange} className="w-full pl-9 pr-3 py-2 border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-indigo-500 rounded-xl text-sm outline-none transition-all text-slate-800" placeholder="Staff Name" />
          </div>
        </div>

        {/* Email Address Input Field */}
        <div>
          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Email Address</label>
          <div className="relative">
            <Mail className="absolute left-3 top-2.5 text-slate-400" size={16} />
            <input name="email" type="email" required value={form.email} onChange={handleChange} className="w-full pl-9 pr-3 py-2 border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-indigo-500 rounded-xl text-sm outline-none transition-all text-slate-800" placeholder="admin@domain.com" />
          </div>
        </div>

        {/* Password Input Field */}
        <div>
          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Account Password</label>
          <div className="relative">
            <Lock className="absolute left-3 top-2.5 text-slate-400" size={16} />
            <input name="password" type="password" required minLength={6} value={form.password} onChange={handleChange} className="w-full pl-9 pr-3 py-2 border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-indigo-500 rounded-xl text-sm outline-none transition-all text-slate-800" placeholder="••••••••" />
          </div>
        </div>

        {/* Library Node Name Input Field */}
        <div>
          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Library Node Name</label>
          <div className="relative">
            <Library className="absolute left-3 top-2.5 text-slate-400" size={16} />
            <input name="libraryName" type="text" required value={form.libraryName} onChange={handleChange} className="w-full pl-9 pr-3 py-2 border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-indigo-500 rounded-xl text-sm outline-none transition-all text-slate-800" placeholder="e.g. City Central Hub" />
          </div>
        </div>

        {/* 📅 Access Timelines Grid Rows */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Start Date</label>
            <div className="relative">
              <Calendar className="absolute left-3 top-2.5 text-slate-400" size={16} />
              <input 
                name="accessStartDate" 
                type="date" 
                required 
                min={todayStr} 
                value={form.accessStartDate} 
                onChange={handleChange} 
                className="w-full pl-9 pr-3 py-2 border border-slate-200 bg-slate-50 text-slate-800 focus:bg-white focus:ring-2 focus:ring-indigo-500 rounded-xl text-xs outline-none transition-all" 
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">End Date</label>
            <div className="relative">
              <Calendar className="absolute left-3 top-2.5 text-slate-400" size={16} />
              <input 
                name="accessEndDate" 
                type="date" 
                required 
                min={form.accessStartDate || todayStr} 
                value={form.accessEndDate} 
                onChange={handleChange} 
                className="w-full pl-9 pr-3 py-2 border border-slate-200 bg-slate-50 text-slate-800 focus:bg-white focus:ring-2 focus:ring-indigo-500 rounded-xl text-xs outline-none transition-all" 
              />
            </div>
          </div>
        </div>

        {/* Submit Initialization Button */}
        <button 
          disabled={loading} 
          type="submit" 
          className={`w-full flex justify-center items-center py-3 rounded-xl font-bold text-white text-sm transition-all active:scale-[0.98] mt-4 disabled:opacity-50 ${
            isSuperAdmin ? "bg-amber-600 hover:bg-amber-700 shadow-lg shadow-amber-600/10" : "bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-600/10"
          }`}
        >
          {loading ? (
            <>
              <Loader2 className="animate-spin mr-2" size={16} /> 
              Finalizing Account Setup...
            </>
          ) : (
            "Initialize Profile"
          )}
        </button>
      </form>
    </div>
  );
};

export default CreateAdminDirectly;