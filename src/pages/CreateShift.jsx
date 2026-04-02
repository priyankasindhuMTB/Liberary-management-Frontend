import React, { useState } from "react";
import axios from "axios";

const CreateShift = () => {
  const [name, setName] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [message, setMessage] = useState({ text: "", type: "" });
  const [loading, setLoading] = useState(false);
  const API_URL = import.meta.env.VITE_API_URL;
  
  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true);
    setMessage({ text: "", type: "" });

    try {
      await axios.post(`${API_URL}/api/shifts/create-shifts`, {
        name,
        startTime,
        endTime,
      });

      setMessage({ text: "Shift created successfully!", type: "success" });
      setName("");
      setStartTime("");
      setEndTime("");
    } catch (error) {
      setMessage({ 
        text: error.response?.data?.message || "Error creating shift", 
        type: "error" 
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 font-sans">
      <div className="w-full max-w-md">
        
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-14 h-14 bg-gradient-to-br from-purple-700 to-purple-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-purple-200 text-2xl">
            ⏱️
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900">Create Shift</h1>
          <p className="text-slate-500 text-sm mt-1">Define library time slots for members</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/60 overflow-hidden border border-slate-100">
          
          {/* Status Message */}
          {message.text && (
            <div className={`px-6 py-3 flex items-center gap-2 text-sm font-semibold border-b ${
              message.type === 'success' ? 'bg-purple-50 text-purple-700 border-purple-100' : 'bg-red-50 text-red-700 border-red-100'
            }`}>
              <span>{message.type === 'success' ? '✓' : '✕'}</span>
              {message.text}
            </div>
          )}

          <form onSubmit={handleSubmit} className="p-8 space-y-6">
            
            {/* Shift Name */}
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2 ml-1">Shift Name</label>
              <input
                type="text"
                placeholder="e.g. Morning, Evening, Night"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-4 focus:ring-purple-500/10 focus:border-purple-500 transition-all"
              />
            </div>

            {/* Time Slots */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2 ml-1">Start Time</label>
                <input
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  required
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-4 focus:ring-purple-500/10 focus:border-purple-500 transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2 ml-1">End Time</label>
                <input
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  required
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-4 focus:ring-purple-500/10 focus:border-purple-500 transition-all"
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className={`w-full py-4 rounded-xl text-white font-bold text-base shadow-lg transition-all active:scale-[0.98] ${
                loading 
                ? 'bg-purple-300 cursor-wait' 
                : 'bg-gradient-to-r from-purple-700 to-purple-600 hover:shadow-purple-200 hover:brightness-110'
              }`}
            >
              {loading ? 'Creating...' : 'Create Shift'}
            </button>
          </form>
        </div>
        
        {/* Help text */}
        <p className="text-center text-slate-400 text-xs mt-6">
          Shifts created here will be available for selection during member registration.
        </p>
      </div>
    </div>
  );
};

export default CreateShift;