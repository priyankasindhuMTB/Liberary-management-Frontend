import React, { useEffect, useState } from "react";
import axios from "axios";

const CreateRoom = () => {
  const API_URL = import.meta.env.VITE_API_URL;
  const [rooms, setRooms] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editRoom, setEditRoom] = useState(null);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    amenities: []
  });
  const [amenityInput, setAmenityInput] = useState("");
  const [message, setMessage] = useState({ text: "", type: "" });

  const amenityOptions = ["AC", "WiFi", "CCTV", "Whiteboard", "Projector", "Lockers", "Water Cooler", "Power Outlets"];

  const authHeaders = () => {
    const token = localStorage.getItem("token");
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  const fetchRooms = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/rooms/all`, { headers: authHeaders() });
      setRooms(res.data.rooms || []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => { fetchRooms(); }, []);

  const openCreate = () => {
    setEditRoom(null);
    setFormData({ name: "", description: "", amenities: [] });
    setAmenityInput("");
    setMessage({ text: "", type: "" });
    setShowModal(true);
  };

  const openEdit = (room) => {
    setEditRoom(room);
    setFormData({
      name: room.name,
      description: room.description || "",
      amenities: room.amenities || []
    });
    setAmenityInput("");
    setMessage({ text: "", type: "" });
    setShowModal(true);
  };

  const toggleAmenity = (a) => {
    setFormData(prev => ({
      ...prev,
      amenities: prev.amenities.includes(a)
        ? prev.amenities.filter(x => x !== a)
        : [...prev.amenities, a]
    }));
  };

  const addCustomAmenity = () => {
    const val = amenityInput.trim();
    if (val && !formData.amenities.includes(val)) {
      setFormData(prev => ({ ...prev, amenities: [...prev.amenities, val] }));
    }
    setAmenityInput("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) return;
    setLoading(true);
    try {
      if (editRoom) {
        await axios.put(`${API_URL}/api/rooms/${editRoom._id}`, formData, { headers: authHeaders() });
      } else {
        await axios.post(`${API_URL}/api/rooms/create`, formData, { headers: authHeaders() });
      }
      fetchRooms();
      setShowModal(false);
    } catch (err) {
      setMessage({ text: err.response?.data?.message || "Something went wrong", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  const toggleStatus = async (room) => {
    const newStatus = room.status === "Active" ? "Inactive" : "Active";
    try {
      await axios.put(`${API_URL}/api/rooms/status/${room._id}`,
        { status: newStatus },
        { headers: authHeaders() }
      );
      fetchRooms();
    } catch (err) { console.error(err); }
  };

  // Stats
  const activeRooms = rooms.filter(r => r.status === "Active").length;
  const totalSeats  = rooms.reduce((acc, r) => acc + (r.seatCount || 0), 0);

  return (
    <div className="min-h-screen p-4 md:p-8 font-sans" style={{ background: "#f0f2f5" }}>

      {/* ── Header ── */}
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900">Rooms</h1>
          <p className="text-slate-400 text-sm mt-1">{rooms.length} rooms configured</p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white
            font-bold px-5 py-3 rounded-2xl shadow-lg shadow-indigo-200 transition-all
            active:scale-95 text-sm"
        >
          <span className="text-lg leading-none">+</span> Add Room
        </button>
      </div>

      {/* ── Stat Cards ── */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {[
          { label: "Total Rooms",   value: rooms.length,  sub: "configured",      color: "#4285f4", icon: "🏢" },
          { label: "Active Rooms",  value: activeRooms,   sub: "currently open",  color: "#34a853", icon: "✅" },
          { label: "Total Seats",   value: totalSeats,    sub: "across all rooms", color: "#9b51e0", icon: "💺" },
        ].map(card => (
          <div key={card.label} className="bg-white rounded-2xl p-5 shadow-sm border border-white relative overflow-hidden">
            <div className="absolute top-4 right-4 text-2xl opacity-20">{card.icon}</div>
            <p className="text-[11px] font-bold uppercase tracking-widest mb-2" style={{ color: card.color }}>{card.label}</p>
            <p className="text-2xl font-black text-slate-900 mb-1">{card.value}</p>
            <p className="text-xs font-semibold text-slate-400">{card.sub}</p>
            <div className="absolute bottom-0 left-0 right-0 h-1 rounded-b-2xl" style={{ background: card.color }} />
          </div>
        ))}
      </div>

      {/* ── Rooms Grid ── */}
      {rooms.length === 0 ? (
        <div className="bg-white rounded-3xl p-16 text-center shadow-sm border border-slate-100">
          <div className="text-5xl mb-4">🏢</div>
          <p className="text-slate-800 font-bold text-lg mb-1">No rooms yet</p>
          <p className="text-slate-400 text-sm mb-6">Add your first room to organise seats</p>
          <button onClick={openCreate}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-6 py-3
              rounded-2xl text-sm transition active:scale-95">
            + Add Room
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {rooms.map(room => (
            <div key={room._id}
              className={`bg-white rounded-2xl p-5 shadow-sm border transition-all
                ${room.status === "Inactive" ? "opacity-60 border-slate-100" : "border-white hover:shadow-md"}`}>

              {/* Card Header */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg
                    ${room.status === "Active" ? "bg-indigo-50" : "bg-slate-100"}`}>
                    🏢
                  </div>
                  <div>
                    <h3 className="font-black text-slate-800 text-sm">{room.name}</h3>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full
                      ${room.status === "Active"
                        ? "bg-emerald-50 text-emerald-600"
                        : "bg-red-50 text-red-500"}`}>
                      ● {room.status}
                    </span>
                  </div>
                </div>

                {/* Toggle */}
                <button onClick={() => toggleStatus(room)}
                  className={`relative w-10 h-5 rounded-full transition-all duration-300 flex-shrink-0
                    ${room.status === "Active" ? "bg-emerald-500" : "bg-slate-200"}`}>
                  <div className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow
                    transition-all duration-300 ${room.status === "Active" ? "translate-x-5" : ""}`} />
                </button>
              </div>

              {/* Description */}
              {room.description && (
                <p className="text-slate-400 text-xs mb-3 line-clamp-2">{room.description}</p>
              )}

              {/* Seat Count */}
              <div className="flex items-center gap-2 mb-3">
                <span className="bg-indigo-50 text-indigo-600 font-black text-xs px-2.5 py-1 rounded-lg">
                  💺 {room.seatCount || 0} Seats
                </span>
              </div>

              {/* Amenities */}
              {room.amenities?.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mb-4">
                  {room.amenities.map(a => (
                    <span key={a}
                      className="bg-slate-100 text-slate-500 text-[10px] font-bold px-2 py-0.5 rounded-lg">
                      {a}
                    </span>
                  ))}
                </div>
              )}

              {/* Edit Button */}
              <button onClick={() => openEdit(room)}
                className="w-full bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold
                  py-2 rounded-xl text-xs transition active:scale-95">
                Edit Room
              </button>
            </div>
          ))}
        </div>
      )}

      {/* ── Add / Edit Modal ── */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center
          justify-center z-50 p-4">
          <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden
            max-h-[92vh] overflow-y-auto">

            {/* Modal Header */}
            <div className="px-7 py-6 text-white relative overflow-hidden"
              style={{ background: "linear-gradient(135deg, #1d4ed8, #4f46e5)" }}>
              <div className="absolute -top-8 -right-8 w-28 h-28 rounded-full bg-white/10" />
              <div className="absolute -bottom-6 -left-4 w-20 h-20 rounded-full bg-white/10" />
              <div className="relative">
                <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center
                  justify-center mb-3 text-xl">🏢</div>
                <h2 className="text-xl font-black">
                  {editRoom ? "Edit Room" : "New Room"}
                </h2>
                <p className="text-white/60 text-sm mt-0.5">
                  {editRoom ? "Update room details" : "Add a new room to your library"}
                </p>
              </div>
              <button onClick={() => setShowModal(false)}
                className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center
                  bg-white/20 hover:bg-white/30 rounded-full text-white text-sm transition">
                ✕
              </button>
            </div>

            {/* Error Message */}
            {message.text && (
              <div className="px-6 py-3 bg-red-50 text-red-600 text-sm font-semibold
                flex items-center gap-2">
                <span className="w-5 h-5 bg-red-500 text-white rounded-full flex items-center
                  justify-center text-xs font-black">✕</span>
                {message.text}
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-7 space-y-5">

              {/* Room Name */}
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase
                  tracking-widest mb-1.5">Room Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Room A, AC Hall, Ground Floor"
                  required
                  className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-200
                    rounded-xl text-slate-900 placeholder:text-slate-300 outline-none
                    focus:border-indigo-400 focus:bg-white transition-all text-sm font-medium"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase
                  tracking-widest mb-1.5">Description
                  <span className="normal-case font-normal text-slate-400 ml-1">— optional</span>
                </label>
                <textarea
                  value={formData.description}
                  onChange={e => setFormData({ ...formData, description: e.target.value })}
                  placeholder="e.g. Quiet zone with AC, suitable for competitive exams"
                  rows={2}
                  className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-200
                    rounded-xl text-slate-900 placeholder:text-slate-300 outline-none
                    focus:border-indigo-400 focus:bg-white transition-all text-sm font-medium
                    resize-none"
                />
              </div>

              {/* Amenities — Quick Select */}
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase
                  tracking-widest mb-2">Amenities</label>
                <div className="flex flex-wrap gap-2 mb-3">
                  {amenityOptions.map(a => (
                    <button
                      key={a}
                      type="button"
                      onClick={() => toggleAmenity(a)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all
                        active:scale-95 border-2
                        ${formData.amenities.includes(a)
                          ? "bg-indigo-600 text-white border-indigo-600"
                          : "bg-slate-50 text-slate-500 border-slate-200 hover:border-indigo-300"}`}
                    >
                      {a}
                    </button>
                  ))}
                </div>

                {/* Custom amenity input */}
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={amenityInput}
                    onChange={e => setAmenityInput(e.target.value)}
                    onKeyDown={e => e.key === "Enter" && (e.preventDefault(), addCustomAmenity())}
                    placeholder="Add custom amenity..."
                    className="flex-1 px-4 py-2.5 bg-slate-50 border-2 border-slate-200
                      rounded-xl text-slate-900 placeholder:text-slate-300 outline-none
                      focus:border-indigo-400 transition-all text-sm font-medium"
                  />
                  <button
                    type="button"
                    onClick={addCustomAmenity}
                    className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white
                      rounded-xl text-sm font-bold transition active:scale-95">
                    + Add
                  </button>
                </div>

                {/* Selected amenities chips */}
                {formData.amenities.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-3">
                    {formData.amenities.map(a => (
                      <span key={a}
                        className="flex items-center gap-1 bg-indigo-50 text-indigo-600
                          text-xs font-bold px-2.5 py-1 rounded-lg">
                        {a}
                        <button
                          type="button"
                          onClick={() => toggleAmenity(a)}
                          className="text-indigo-400 hover:text-red-500 font-black ml-0.5">
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Submit */}
              <div className="grid grid-cols-2 gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
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
                      : "bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-200"}`}
                >
                  {loading ? "Saving..." : editRoom ? "Update Room" : "Create Room"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CreateRoom;