
import React, { useState } from "react";
import axios from "axios";
import { User, Mail, Lock, Library, Send, Loader2, AlertCircle, CheckCircle2, Calendar } from "lucide-react";

const AdminRequest = () => {
  const API_URL = import.meta.env.VITE_API_URL;

  // Set today's date as default baseline string (YYYY-MM-DD)
  const todayStr = new Date().toISOString().split("T")[0];

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    libraryName: "",
    accessStartDate: todayStr,
    accessEndDate: "",
    requestType: "New_Registration"
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (new Date(form.accessStartDate) >= new Date(form.accessEndDate)) {
      setMessage({ text: "Access End Date must fall after the Start Date.", type: "error" });
      return;
    }

    try {
      setLoading(true);
      setMessage({ text: "", type: "" });
      
      await axios.post(`${API_URL}/api/admin-request/request`, form);
      
      setMessage({ text: "Access allocation request submitted successfully!", type: "success" });
      setForm({ 
        name: "", 
        email: "", 
        password: "", 
        libraryName: "", 
        accessStartDate: todayStr, 
        accessEndDate: "", 
        requestType: "New_Registration" 
      });
    } catch (err) {
      setMessage({
        text: err.response?.data?.message || "Failed to send request. Please try again.",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="text-center text-3xl font-extrabold text-slate-900">
          Library Admin Access
        </h2>
        <p className="mt-2 text-center text-sm text-slate-600">
          Submit your details to request administrative credentials and custom access timeline.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-xl shadow-slate-200/50 sm:rounded-xl sm:px-10 border border-slate-100">
          <form className="space-y-5" onSubmit={handleSubmit}>
            
            {/* Status Messages */}
            {message.text && (
              <div className={`p-4 rounded-lg flex items-center gap-3 text-sm ${
                message.type === "error" ? "bg-red-50 text-red-700 border border-red-100" : "bg-emerald-50 text-emerald-700 border border-emerald-100"
              }`}>
                {message.type === "error" ? <AlertCircle size={18} /> : <CheckCircle2 size={18} />}
                {message.text}
              </div>
            )}

            {/* Name Input */}
            <div>
              <label className="block text-sm font-medium text-slate-700">Full Name</label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <User size={18} />
                </div>
                <input
                  name="name" type="text" required
                  value={form.name} onChange={handleChange}
                  className="block w-full pl-10 pr-3 py-2 border border-slate-300 rounded-md bg-white placeholder-slate-400 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition-all"
                  placeholder="John Doe"
                />
              </div>
            </div>

            {/* Email Input */}
            <div>
              <label className="block text-sm font-medium text-slate-700">Email Address</label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Mail size={18} />
                </div>
                <input
                  name="email" type="email" required
                  value={form.email} onChange={handleChange}
                  className="block w-full pl-10 pr-3 py-2 border border-slate-300 rounded-md bg-white placeholder-slate-400 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition-all"
                  placeholder="admin@example.com"
                />
              </div>
            </div>

            {/* Password Input */}
            <div>
              <label className="block text-sm font-medium text-slate-700">Password</label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Lock size={18} />
                </div>
                <input
                  name="password" type="password" required
                  value={form.password} onChange={handleChange}
                  className="block w-full pl-10 pr-3 py-2 border border-slate-300 rounded-md bg-white placeholder-slate-400 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition-all"
                  placeholder="••••••••"
                />
              </div>
            </div>

            {/* Library Name Input */}
            <div>
              <label className="block text-sm font-medium text-slate-700">Library Name</label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Library size={18} />
                </div>
                <input
                  name="libraryName" type="text" required
                  value={form.libraryName} onChange={handleChange}
                  className="block w-full pl-10 pr-3 py-2 border border-slate-300 rounded-md bg-white placeholder-slate-400 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition-all"
                  placeholder="Central Public Library"
                />
              </div>
            </div>

            {/* 👇 UPDATED: Two Date Pickers instead of Plan Option dropdown selector */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700">Access Start Date</label>
                <div className="mt-1 relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Calendar size={18} />
                  </div>
                  <input
                    name="accessStartDate" type="date" required
                    min={todayStr}
                    value={form.accessStartDate} onChange={handleChange}
                    className="block w-full pl-10 pr-3 py-2 border border-slate-300 rounded-md bg-white text-slate-800 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700">Access End Date</label>
                <div className="mt-1 relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Calendar size={18} />
                  </div>
                  <input
                    name="accessEndDate" type="date" required
                    min={form.accessStartDate || todayStr}
                    value={form.accessEndDate} onChange={handleChange}
                    className="block w-full pl-10 pr-3 py-2 border border-slate-300 rounded-md bg-white text-slate-800 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition-all"
                  />
                </div>
              </div>
            </div>

            <button
              disabled={loading} type="submit"
              className="w-full flex justify-center items-center py-2.5 px-4 border border-transparent rounded-md shadow-sm text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-70 disabled:cursor-not-allowed transition-colors duration-200"
            >
              {loading ? (
                <><Loader2 className="animate-spin mr-2" size={18} /> Processing...</>
              ) : (
                <><Send className="mr-2" size={18} /> Submit Request</>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AdminRequest;