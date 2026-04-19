import { useEffect, useState } from "react";
import axios from "axios";
import React from "react";

const Registration = ({ closeModal, refreshUsers, editUser }) => {
  const [formData, setFormData] = useState({ name: "", email: "", password: "", seatId: "", shiftId: "" });
  const [seats, setSeats] = useState([]);
  const [users, setUsers] = useState([]);
  const [message, setMessage] = useState({ text: "", type: "" });
  const [shifts, setShifts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const API_URL = import.meta.env.VITE_API_URL;

  useEffect(() => {
    if (editUser) {
      setFormData({
        name: editUser.name || "",
        email: editUser.email || "",
        password: "",
        seatId: editUser.seatId?._id || "",
        shiftId: editUser.shiftId?._id || ""
      });
    }
  }, [editUser]);

  const fetchShifts = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(`${API_URL}/api/shifts/get-shifts`, { headers: { Authorization: `Bearer ${token}` } });
      if (res.status === 200) setShifts(res.data);
    } catch (error) { console.error("Error fetching shifts", error); }
  };

  const fetchSeats = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(`${API_URL}/api/seats/getSeats`, { headers: { Authorization: `Bearer ${token}` } });
      setSeats(res.data);
    } catch (err) { console.log(err); }
  };

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(`${API_URL}/api/users/all`, { headers: { Authorization: `Bearer ${token}` } });
      setUsers(Array.isArray(res.data) ? res.data : (res.data.users || []));
    } catch (error) { console.log("error", error); }
  };

  useEffect(() => { fetchSeats(); fetchUsers(); fetchShifts(); }, []);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const occupiedSeatIdsInSelectedSlot = (users || [])
    .filter(u => u.status === 'Active' &&
      (u.shiftId?._id === formData.shiftId || u.shiftId === formData.shiftId) &&
      (editUser ? String(u._id) !== String(editUser._id) : true))
    .map(u => u.seatId?._id || u.seatId);

  const availableSeats = seats.filter(seat => !occupiedSeatIdsInSelectedSlot.includes(seat._id));
  const selectedShift = shifts.find(s => s._id === formData.shiftId);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      if (!editUser && !formData.password.trim()) {
        setMessage({ text: "Password is required", type: "error" });
        setLoading(false);
        return;
      }
      const payload = { name: formData.name, email: formData.email, seatId: formData.seatId, shiftId: formData.shiftId };
      if (formData.password.trim()) payload.password = formData.password;

      if (editUser) {
        await axios.put(`${API_URL}/api/users/update/${editUser._id}`, payload, { headers: { Authorization: `Bearer ${token}` } });
      } else {
        await axios.post(`${API_URL}/api/users/register`, { ...payload, password: formData.password }, { headers: { Authorization: `Bearer ${token}` } });
      }
      refreshUsers();
      closeModal();
    } catch (error) {
      setMessage({ text: error.response?.data?.message || "Something went wrong", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="overflow-hidden rounded-3xl">

      {/* ── Modal Header with gradient ── */}
      <div className="px-7 py-6 text-white relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #1d4ed8, #4f46e5)' }}>
        <div className="absolute -top-8 -right-8 w-28 h-28 rounded-full bg-white/10" />
        <div className="absolute -bottom-6 -left-4 w-20 h-20 rounded-full bg-white/10" />
        <div className="relative">
          <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center mb-3">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round">
              {editUser
                ? <><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></>
                : <><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/><line x1="19" y1="8" x2="19" y2="14"/><line x1="22" y1="11" x2="16" y2="11"/></>
              }
            </svg>
          </div>
          <h2 className="text-xl font-black">{editUser ? "Edit Member" : "New Member"}</h2>
          <p className="text-white/60 text-sm mt-0.5">
            {editUser ? "Update member details below" : "Register a new library seat holder"}
          </p>
        </div>
      </div>

      {/* ── Status Message ── */}
      {message.text && (
        <div className={`px-6 py-3 flex items-center gap-2 text-sm font-semibold ${message.type === 'success' ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-600'}`}>
          <span className={`w-5 h-5 rounded-full flex items-center justify-center text-white text-xs font-black ${message.type === 'success' ? 'bg-emerald-500' : 'bg-red-500'}`}>
            {message.type === 'success' ? '✓' : '✕'}
          </span>
          {message.text}
        </div>
      )}

      {/* ── Form ── */}
      <form onSubmit={handleSubmit} className="p-7 space-y-4">

        {/* Full Name */}
        <div>
          <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5">Full Name</label>
          <input type="text" name="name" placeholder="e.g. Rahul Sharma"
            value={formData.name} onChange={handleChange} required
            className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-300 outline-none focus:border-indigo-400 focus:bg-white transition-all text-sm font-medium"
          />
        </div>

        {/* Email */}
        <div>
          <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5">Email Address</label>
          <input type="email" name="email" placeholder="rahul@example.com"
            value={formData.email} onChange={handleChange} required
            className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-300 outline-none focus:border-indigo-400 focus:bg-white transition-all text-sm font-medium"
          />
        </div>

        {/* Password */}
        <div>
          <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5">
            Password {editUser && <span className="normal-case font-normal text-slate-400 ml-1">— blank = no change</span>}
          </label>
          <div className="relative">
            <input type={showPass ? "text" : "password"} name="password"
              placeholder={editUser ? "Leave blank to keep current" : "Min. 6 characters"}
              value={formData.password} onChange={handleChange} required={!editUser}
              className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-300 outline-none focus:border-indigo-400 focus:bg-white transition-all text-sm font-medium"
            />
            <button type="button" onClick={() => setShowPass(!showPass)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs px-1">
              {showPass ? '🙈' : '👁️'}
            </button>
          </div>
        </div>

        {/* Shift */}
        <div>
          <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5">Shift</label>
          <div className="relative">
            <select name="shiftId" value={formData.shiftId} onChange={handleChange} required
              className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl text-slate-900 outline-none focus:border-indigo-400 focus:bg-white transition-all appearance-none cursor-pointer text-sm font-medium">
              <option value="">Select a shift</option>
              {shifts.map(shift => (
                <option key={shift._id} value={shift._id}>
                  {shift.name}{shift.startTime ? ` (${shift.startTime}–${shift.endTime})` : ''}
                </option>
              ))}
            </select>
            <svg className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="6 9 12 15 18 9"/></svg>
          </div>
        </div>

        {/* Seat */}
        <div>
          <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5">
            Seat
            {formData.shiftId && (
              <span className="normal-case font-normal text-slate-400 ml-2">
                — {availableSeats.length} of {seats.length} available{selectedShift ? ` in ${selectedShift.name}` : ''}
              </span>
            )}
          </label>
          <div className="relative">
            <select name="seatId" value={formData.seatId} onChange={handleChange} required
              disabled={!formData.shiftId}
              className={`w-full px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl text-slate-900 outline-none focus:border-indigo-400 focus:bg-white transition-all appearance-none text-sm font-medium ${!formData.shiftId ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}>
              <option value="">{formData.shiftId ? (availableSeats.length > 0 ? 'Select a seat' : 'No seats available') : 'Choose a shift first'}</option>
              {availableSeats.map(seat => (
                <option key={seat._id} value={seat._id}>Seat #{seat.seatNumber}</option>
              ))}
            </select>
            <svg className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="6 9 12 15 18 9"/></svg>
          </div>
        </div>

        {/* Submit */}
        <button type="submit" disabled={loading}
          className={`w-full py-3.5 rounded-xl font-bold text-sm text-white transition-all active:scale-[0.98] mt-2
            ${loading ? 'opacity-60 cursor-wait' : 'hover:brightness-110 active:scale-95'}`}
          style={{ background: loading ? '#a5b4fc' : 'linear-gradient(135deg, #1d4ed8, #4f46e5)' }}>
          {loading ? "Processing..." : editUser ? "Update Member" : "Register Member"}
        </button>
      </form>
    </div>
  );
};

export default Registration;