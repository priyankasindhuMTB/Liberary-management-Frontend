import React, { useEffect, useState } from "react";
import axios from "axios";

const CreateShift = () => {
  const [name, setName]           = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime]     = useState("");
  const [shifts, setShifts]       = useState([]);
  const [message, setMessage]     = useState({ text: "", type: "" });
  const [loading, setLoading]     = useState(false);
  const [editShift, setEditShift] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const API_URL = import.meta.env.VITE_API_URL;

  const authHeaders = () => {
    const token = localStorage.getItem("token");
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  const fetchShifts = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/shifts/get-shifts`, {
        headers: authHeaders()
      });
      if (res.status === 200) setShifts(res.data);
    } catch (err) {
      console.error("Error fetching shifts", err);
    }
  };

  useEffect(() => { fetchShifts(); }, []);

  const resetForm = () => {
    setName(""); setStartTime(""); setEndTime("");
    setMessage({ text: "", type: "" });
    setEditShift(null);
  };

  const openAdd = () => { resetForm(); setShowModal(true); };

  const openEdit = (shift) => {
    setEditShift(shift);
    setName(shift.name);
    setStartTime(shift.startTime || "");
    setEndTime(shift.endTime || "");
    setMessage({ text: "", type: "" });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ text: "", type: "" });

    try {
      if (editShift) {
        await axios.put(
          `${API_URL}/api/shifts/update/${editShift._id}`,
          { name, startTime, endTime },
          { headers: authHeaders() }
        );
        setMessage({ text: "Shift updated successfully!", type: "success" });
      } else {
        await axios.post(
          `${API_URL}/api/shifts/create-shifts`,
          { name, startTime, endTime },
          { headers: authHeaders() }
        );
        setMessage({ text: "Shift created successfully!", type: "success" });
      }
      await fetchShifts();
      setTimeout(() => { setShowModal(false); resetForm(); }, 800);
    } catch (error) {
      setMessage({
        text: error.response?.data?.message || "Something went wrong",
        type: "error"
      });
    } finally {
      setLoading(false);
    }
  };

  // Format time 24hr → 12hr
  const formatTime = (t) => {
    if (!t) return "";
    const [h, m] = t.split(":");
    const hr = parseInt(h);
    const ampm = hr >= 12 ? "PM" : "AM";
    const hr12 = hr % 12 || 12;
    return `${hr12}:${m} ${ampm}`;
  };

  // Duration calculator
  const getDuration = (start, end) => {
    if (!start || !end) return null;
    const [sh, sm] = start.split(":").map(Number);
    const [eh, em] = end.split(":").map(Number);
    let mins = (eh * 60 + em) - (sh * 60 + sm);
    if (mins < 0) mins += 24 * 60;
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    return h > 0 ? `${h}h ${m > 0 ? m + "m" : ""}`.trim() : `${m}m`;
  };

  const shiftColors = [
    { bg: "#eef3fe", accent: "#4285f4", dot: "#4285f4" },
    { bg: "#fef3e8", accent: "#f2994a", dot: "#f2994a" },
    { bg: "#f3eefe", accent: "#9b51e0", dot: "#9b51e0" },
    { bg: "#e8f5ec", accent: "#34a853", dot: "#34a853" },
    { bg: "#fee8e8", accent: "#ea4335", dot: "#ea4335" },
  ];

  return (
    <div className="min-h-screen p-4 md:p-8 font-sans" style={{ background: "#f0f2f5" }}>

      {/* ── Header ── */}
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900">Shifts</h1>
          <p className="text-slate-400 text-sm mt-1">{shifts.length} shifts configured</p>
        </div>
        <button
          onClick={openAdd}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white
            font-bold px-5 py-3 rounded-2xl shadow-lg shadow-indigo-200 transition-all
            active:scale-95 text-sm w-fit"
        >
          <span className="text-lg leading-none">+</span> Add Shift
        </button>
      </div>

      {/* ── Stat Cards ── */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {[
          {
            label: "Total Shifts", icon: "⏰",
            value: shifts.length, sub: "configured",
            color: "#4285f4"
          },
          {
            label: "Full Day", icon: "🌞",
            value: shifts.filter(s =>
              s.name?.toLowerCase().includes("full")).length,
            sub: "full day shifts", color: "#f2994a"
          },
          {
            label: "Part Day", icon: "🌙",
            value: shifts.filter(s =>
              !s.name?.toLowerCase().includes("full")).length,
            sub: "morning / evening / night", color: "#9b51e0"
          },
        ].map(card => (
          <div key={card.label}
            className="bg-white rounded-2xl p-5 shadow-sm border border-white
              relative overflow-hidden">
            <div className="absolute top-4 right-4 text-2xl opacity-20">{card.icon}</div>
            <p className="text-[11px] font-bold uppercase tracking-widest mb-2"
              style={{ color: card.color }}>{card.label}</p>
            <p className="text-2xl font-black text-slate-900 mb-1">{card.value}</p>
            <p className="text-xs font-semibold text-slate-400">{card.sub}</p>
            <div className="absolute bottom-0 left-0 right-0 h-1 rounded-b-2xl"
              style={{ background: card.color }} />
          </div>
        ))}
      </div>

      {/* ── Shifts List ── */}
      {shifts.length === 0 ? (
        <div className="bg-white rounded-3xl p-16 text-center shadow-sm border border-slate-100">
          <div className="text-5xl mb-4">⏰</div>
          <p className="text-slate-800 font-bold text-lg mb-1">No shifts yet</p>
          <p className="text-slate-400 text-sm mb-6">
            Create your first shift to get started
          </p>
          <button onClick={openAdd}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold
              px-6 py-3 rounded-2xl text-sm transition active:scale-95">
            + Add Shift
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {shifts.map((shift, i) => {
            const color = shiftColors[i % shiftColors.length];
            const duration = getDuration(shift.startTime, shift.endTime);
            return (
              <div key={shift._id}
                className="bg-white rounded-2xl p-5 shadow-sm border border-white
                  hover:shadow-md transition-all group">

                {/* Top row */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-xl flex items-center justify-center
                      text-xl flex-shrink-0"
                      style={{ background: color.bg }}>
                      ⏰
                    </div>
                    <div>
                      <h3 className="font-black text-slate-800 text-sm capitalize">
                        {shift.name}
                      </h3>
                      {duration && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                          style={{ background: color.bg, color: color.accent }}>
                          {duration}
                        </span>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => openEdit(shift)}
                    className="opacity-0 group-hover:opacity-100 transition-all
                      bg-slate-100 hover:bg-indigo-50 hover:text-indigo-600
                      text-slate-500 text-xs font-bold px-3 py-1.5 rounded-lg"
                  >
                    Edit
                  </button>
                </div>

                {/* Time display */}
                <div className="flex items-center gap-2 p-3 rounded-xl"
                  style={{ background: color.bg }}>
                  <div className="flex-1 text-center">
                    <p className="text-[10px] font-bold uppercase tracking-wider mb-1"
                      style={{ color: color.accent }}>Start</p>
                    <p className="text-lg font-black text-slate-800">
                      {formatTime(shift.startTime) || "—"}
                    </p>
                  </div>
                  <div className="flex flex-col items-center gap-1">
                    <div className="w-6 h-px bg-slate-300"/>
                    <div className="w-2 h-2 rounded-full"
                      style={{ background: color.dot }}/>
                    <div className="w-6 h-px bg-slate-300"/>
                  </div>
                  <div className="flex-1 text-center">
                    <p className="text-[10px] font-bold uppercase tracking-wider mb-1"
                      style={{ color: color.accent }}>End</p>
                    <p className="text-lg font-black text-slate-800">
                      {formatTime(shift.endTime) || "—"}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── Add / Edit Modal ── */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center
          justify-center z-50 p-4">
          <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden">

            {/* Modal Header */}
            <div className="px-7 py-6 text-white relative overflow-hidden"
              style={{ background: "linear-gradient(135deg, #4f46e5, #7c3aed)" }}>
              <div className="absolute -top-8 -right-8 w-28 h-28 rounded-full bg-white/10"/>
              <div className="absolute -bottom-6 -left-4 w-20 h-20 rounded-full bg-white/10"/>
              <div className="relative">
                <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center
                  justify-center mb-3 text-xl">⏰</div>
                <h2 className="text-xl font-black">
                  {editShift ? `Edit — ${editShift.name}` : "New Shift"}
                </h2>
                <p className="text-white/60 text-sm mt-0.5">
                  {editShift
                    ? "Update shift timing details"
                    : "Define a new library time slot"}
                </p>
              </div>
              <button onClick={() => { setShowModal(false); resetForm(); }}
                className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center
                  bg-white/20 hover:bg-white/30 rounded-full text-white transition text-sm">
                ✕
              </button>
            </div>

            {/* Message */}
            {message.text && (
              <div className={`px-6 py-3 flex items-center gap-2 text-sm font-semibold
                ${message.type === "success"
                  ? "bg-emerald-50 text-emerald-700"
                  : "bg-red-50 text-red-600"}`}>
                <span className={`w-5 h-5 rounded-full flex items-center justify-center
                  text-white text-xs font-black flex-shrink-0
                  ${message.type === "success" ? "bg-emerald-500" : "bg-red-500"}`}>
                  {message.type === "success" ? "✓" : "✕"}
                </span>
                {message.text}
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-7 space-y-5">

              {/* Shift Name */}
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase
                  tracking-widest mb-1.5">Shift Name</label>
                <input
                  type="text"
                  placeholder="e.g. Morning, Evening, Full Day"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  required
                  className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-200
                    rounded-xl text-slate-900 placeholder:text-slate-300 outline-none
                    focus:border-indigo-400 focus:bg-white transition-all text-sm font-medium"
                />
              </div>

              {/* Time Grid */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase
                    tracking-widest mb-1.5">Start Time</label>
                  <input
                    type="time"
                    value={startTime}
                    onChange={e => setStartTime(e.target.value)}
                    required
                    className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-200
                      rounded-xl text-slate-900 outline-none focus:border-indigo-400
                      focus:bg-white transition-all text-sm font-medium"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase
                    tracking-widest mb-1.5">End Time</label>
                  <input
                    type="time"
                    value={endTime}
                    onChange={e => setEndTime(e.target.value)}
                    required
                    className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-200
                      rounded-xl text-slate-900 outline-none focus:border-indigo-400
                      focus:bg-white transition-all text-sm font-medium"
                  />
                </div>
              </div>

              {/* Duration Preview */}
              {startTime && endTime && (
                <div className="flex items-center gap-2 px-4 py-3 bg-indigo-50
                  rounded-xl border-2 border-indigo-100">
                  <span className="text-indigo-500 text-lg">⏱️</span>
                  <div>
                    <p className="text-xs font-bold text-indigo-400 uppercase tracking-wider">
                      Duration
                    </p>
                    <p className="text-sm font-black text-indigo-700">
                      {getDuration(startTime, endTime)}
                      <span className="font-normal text-indigo-400 ml-2">
                        ({formatTime(startTime)} → {formatTime(endTime)})
                      </span>
                    </p>
                  </div>
                </div>
              )}

              {/* Buttons */}
              <div className="grid grid-cols-2 gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => { setShowModal(false); resetForm(); }}
                  className="py-3 rounded-xl font-bold text-slate-500 bg-slate-100
                    hover:bg-slate-200 transition text-sm">
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className={`py-3 rounded-xl font-bold text-white text-sm transition
                    active:scale-[0.98]
                    ${loading
                      ? "opacity-60 cursor-wait bg-indigo-400"
                      : "bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-200"}`}>
                  {loading
                    ? (editShift ? "Saving..." : "Creating...")
                    : (editShift ? "Save Changes" : "Create Shift")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CreateShift;