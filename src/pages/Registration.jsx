
import { useEffect, useState } from "react";
import axios from "axios";
import React from "react";

const Registration = () => {
  const [formData, setFormData] = useState({ name: "", email: "", password: "", seatId: "", shiftId: "" });
  const [seats, setSeats] = useState([]);
  const [users, setUsers] = useState([]);
  const [message, setMessage] = useState({ text: "", type: "" });
  const [shifts, setShifts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);
   const API_URL = import.meta.env.VITE_API_URL;

  const fetchShifts = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/shifts/get-shifts`);
      setShifts(res.data);
      console.log("resss",res)
    } catch (error) {
      console.error("Error fetching shifts", error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // const occupiedSeatIdsInSelectedSlot = users
  //   .filter(u => u.shiftId?._id === formData.shiftId && u.status === 'Active')
  //   .map(u => u.seatId?._id);

  const occupiedSeatIdsInSelectedSlot = (users || [])
  .filter(u => 
    u.status === 'Active' && 
    (u.shiftId?._id === formData.shiftId || u.shiftId === formData.shiftId)
  )
  .map(u => u.seatId?._id || u.seatId);

  const availableSeats = seats.filter(seat => !occupiedSeatIdsInSelectedSlot.includes(seat._id));
  console.log("AVAILABLE SEATS >>>>>>>>>>>",availableSeats)

const fetchSeats = async () => {
  try {
    const res = await axios.get(`${API_URL}/api/seats/getSeats`);
    console.log("Seats:", res.data);
    setSeats(res.data);
  } catch (err) {
    console.log(err);
  }
};
  const fetchUsers = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/users/all`);
      setUsers(res.data.users);
    } catch (error) { console.log("error", error); }
  };

  useEffect(() => {
    fetchSeats();
    fetchUsers();
    fetchShifts();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.post(`${API_URL}/api/users/register`, formData);
      setMessage({ text: "Member registered successfully!", type: "success" });
      setFormData({ name: "", email: "", password: "", seatId: "", shiftId: "" });
      fetchSeats();
      fetchUsers();
    } catch (error) {
      setMessage({ text: error.response?.data?.message || "Registration failed", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  const selectedShift = shifts.find(s => s._id === formData.shiftId);

  return (
    <div className="bg-slate-50 flex items-center justify-center p-6 font-sans">
      <div className="w-full max-w-md">
        
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-14 h-14 bg-gradient-to-br from-blue-700 to-blue-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-blue-200">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM19 8v6M22 11h-6" />
            </svg>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900">New Member</h1>
          <p className="text-slate-500 text-sm mt-1">Register a new library seat holder</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/60 overflow-hidden border border-slate-100">
          
          {/* Status Message */}
          {message.text && (
            <div className={`px-6 py-3 flex items-center gap-2 text-sm font-semibold border-b ${
              message.type === 'success' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-red-50 text-red-700 border-red-100'
            }`}>
              <span>{message.type === 'success' ? '✓' : '✕'}</span>
              {message.text}
            </div>
          )}

          <form onSubmit={handleSubmit} className="p-8 space-y-5">
            
            {/* Full Name */}
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1.5 ml-1">Full Name</label>
              <input
                type="text" name="name" placeholder="e.g. Rahul Sharma"
                value={formData.name} onChange={handleChange} required
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all"
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1.5 ml-1">Email Address</label>
              <input
                type="email" name="email" placeholder="rahul@example.com"
                value={formData.email} onChange={handleChange} required
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all"
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1.5 ml-1">Password</label>
              <div className="relative">
                <input
                  type={showPass ? "text" : "password"} name="password"
                  placeholder="Min. 6 characters"
                  value={formData.password} onChange={handleChange} required
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all"
                />
                <button 
                  type="button" 
                  onClick={() => setShowPass(!showPass)} 
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  {showPass ? '🙈' : '👁️'}
                </button>
              </div>
            </div>

            {/* Shift Selection */}
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1.5 ml-1">Shift</label>
              <select
                name="shiftId" value={formData.shiftId} onChange={handleChange} required
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all cursor-pointer appearance-none"
              >
                <option value="">Select a shift</option>
                {shifts.map(shift => (
                  <option key={shift._id} value={shift._id}>
                    {shift.name} {shift.startTime ? `(${shift.startTime}–${shift.endTime})` : ''}
                  </option>
                ))}
              </select>
            </div>

            {/* Seat Selection */}
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1.5 ml-1">Seat</label>
              <select
                name="seatId" value={formData.seatId} onChange={handleChange} required
                disabled={!formData.shiftId}
                className={`w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all appearance-none ${!formData.shiftId ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}`}
              >
                <option value="">
                  {formData.shiftId
                    ? availableSeats.length > 0 ? `${availableSeats.length} seats available` : 'No seats available'
                    : 'Choose a shift first'
                  }
                </option>
                {availableSeats.map(seat => (
                  <option key={seat._id} value={seat._id}>Seat #{seat.seatNumber}</option>
                ))}
              </select>
              {formData.shiftId && (
                <p className="mt-2 text-[12px] text-slate-500 ml-1">
                  {availableSeats.length} of {seats.length} seats free {selectedShift && `in ${selectedShift.name}`}
                </p>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit" 
              disabled={loading}
              className={`w-full py-4 mt-2 rounded-xl text-white font-bold text-base shadow-lg transition-all active:scale-[0.98] ${
                loading 
                ? 'bg-blue-300 cursor-wait' 
                : 'bg-gradient-to-r from-blue-700 to-blue-600 hover:shadow-blue-200 hover:brightness-110'
              }`}
            >
              {loading ? 'Registering...' : 'Register Member'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Registration;