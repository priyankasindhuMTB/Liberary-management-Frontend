import React, { useEffect, useState } from 'react';
import axios from 'axios';

const CreateSeat = () => {
  const [seatNumber, setSeatNumber] = useState('');
  const [message, setMessage] = useState({ text: '', type: '' });
  const [seats, setSeats] = useState([]);
  const [shifts, setShifts] = useState([]);
  const [priceData, setPriceData] = useState([]);
  const [loading, setLoading] = useState(false);

  // ── Edit modal state ──
  const [editSeat, setEditSeat] = useState(null);       // jo seat edit ho rahi hai
  const [editPrices, setEditPrices] = useState([]);     // us seat ki current prices
  const [editLoading, setEditLoading] = useState(false);
  const [editMessage, setEditMessage] = useState({ text: '', type: '' });

  const API_URL = import.meta.env.VITE_API_URL;

  const authHeaders = () => {
    const token = localStorage.getItem("token");
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  // ── Create form price handler ──
  const handlePriceChange = (shiftId, value) => {
    setPriceData(prev => {
      const existing = prev.find(p => p.shiftId === shiftId);
      if (existing) return prev.map(p => p.shiftId === shiftId ? { ...p, amount: Number(value) } : p);
      return [...prev, { shiftId, amount: Number(value) }];
    });
  };

  const fetchSeats = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/seats/getSeats`, { headers: authHeaders() });
      if (res.status === 200 && Array.isArray(res.data)) setSeats(res.data);
    } catch (err) {
      console.log(err);
    }
  };

  const fetchShifts = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/shifts/get-shifts`, { headers: authHeaders() });
      setShifts(res.data);
    } catch (err) {
      console.log("Shifts error:", err);
    }
  };

  // ── Create seat ──
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ text: '', type: '' });

    const token = localStorage.getItem("token");
    if (!token) { setMessage({ text: "Please login first", type: "error" }); setLoading(false); return; }

    const validPrice = priceData.filter(p => p.amount > 0);
    if (validPrice.length === 0) { setMessage({ text: "Enter at least one shift price", type: "error" }); setLoading(false); return; }

    try {
      await axios.post(
        `${API_URL}/api/seats/createSeat`,
        { seatNumber: Number(seatNumber), price: validPrice },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchSeats();
      setMessage({ text: `Seat #${seatNumber} created!`, type: 'success' });
      setSeatNumber('');
      setPriceData([]);
    } catch (error) {
      setMessage({ text: error.response?.data?.message || 'Error creating seat', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  // ── Open edit modal — seat card pe click ──
  const openEditModal = (seat) => {
    setEditSeat(seat);
    setEditMessage({ text: '', type: '' });

    // Har shift ke liye existing price dhoondo, nahi mila toh 0
    const prices = shifts.map(shift => {
      const existing = seat.price?.find(p => String(p.shiftId) === String(shift._id));
      return {
        shiftId: shift._id,
        amount: existing ? existing.amount : 0
      };
    });
    setEditPrices(prices);
  };

  const handleEditPriceChange = (shiftId, value) => {
    setEditPrices(prev =>
      prev.map(p => p.shiftId === shiftId ? { ...p, amount: Number(value) } : p)
    );
  };

  // ── Save edited prices ──
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setEditLoading(true);
    setEditMessage({ text: '', type: '' });

    const validPrices = editPrices.filter(p => p.amount > 0);
    if (validPrices.length === 0) {
      setEditMessage({ text: "Kam se kam ek shift ki price daalein", type: "error" });
      setEditLoading(false);
      return;
    }

    try {
      await axios.put(
        `${API_URL}/api/seats/updateSeat/${editSeat._id}`,
        { price: editPrices },
        { headers: authHeaders() }
      );
      setEditMessage({ text: `Seat #${editSeat.seatNumber} updated!`, type: 'success' });
      fetchSeats();
      setTimeout(() => setEditSeat(null), 1000); // 1 second baad modal band
    } catch (error) {
      setEditMessage({ text: error.response?.data?.message || 'Update failed', type: 'error' });
    } finally {
      setEditLoading(false);
    }
  };

  useEffect(() => { fetchShifts(); fetchSeats(); }, []);

  return (
    <div className="bg-slate-100 p-6">
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-5 gap-6 items-start">

        {/* ── Left: Create Form ── */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm overflow-hidden sticky top-20">
          <div className="bg-slate-900 px-6 py-5 flex items-center gap-4">
            <div className="w-11 h-11 bg-indigo-500/20 border border-indigo-500/30 rounded-xl flex items-center justify-center flex-shrink-0">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#818cf8" strokeWidth="2.5" strokeLinecap="round">
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                <polyline points="9 22 9 12 15 12 15 22" />
              </svg>
            </div>
            <div>
              <h2 className="text-white font-bold text-base m-0">Add New Seat</h2>
              <p className="text-white/40 text-xs mt-0.5 m-0">Configure seat & shift pricing</p>
            </div>
          </div>

          {message.text && (
            <div className={`px-5 py-3 flex items-center gap-2 text-sm font-semibold border-b
              ${message.type === 'success' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-red-50 text-red-700 border-red-100'}`}>
              <span>{message.type === 'success' ? '✓' : '✗'}</span>
              {message.text}
            </div>
          )}

          <div className="p-6">
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Seat Number</label>
                <input
                  type="number" placeholder="e.g. 101"
                  value={seatNumber} onChange={e => setSeatNumber(e.target.value)} required
                  className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl text-xl font-bold text-slate-800 bg-slate-50 outline-none focus:border-indigo-500 focus:bg-white transition-all"
                />
              </div>

              {shifts.length > 0 && (
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">
                    Shift Pricing <span className="text-slate-400 normal-case font-normal">(₹/month)</span>
                  </label>
                  <div className="space-y-2">
                    {shifts.map(shift => (
                      <div key={shift._id} className="flex items-center gap-3 p-3 bg-slate-50 border-2 border-slate-200 rounded-xl">
                        <div className="w-2 h-2 rounded-full bg-indigo-500 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-bold text-slate-800 truncate">{shift.name}</div>
                          {shift.startTime && <div className="text-xs text-slate-400">{shift.startTime} – {shift.endTime}</div>}
                        </div>
                        <div className="relative w-28 flex-shrink-0">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">₹</span>
                          <input
                            type="number" placeholder="0"
                            value={priceData.find(p => p.shiftId === shift._id)?.amount || ''}
                            onChange={e => handlePriceChange(shift._id, e.target.value)}
                            className="w-full pl-7 pr-3 py-2 border-2 border-slate-200 rounded-lg text-sm font-bold text-slate-800 outline-none focus:border-indigo-500 bg-white transition-all"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <button type="submit" disabled={loading}
                className={`w-full py-3.5 rounded-xl text-white font-bold text-sm transition-all
                  ${loading ? 'bg-indigo-300 cursor-wait' : 'bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-200 active:scale-95'}`}>
                {loading ? 'Creating...' : '+ Create Seat'}
              </button>
            </form>
          </div>
        </div>

        {/* ── Right: Seat Grid ── */}
        <div className="lg:col-span-3 bg-white rounded-2xl shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h2 className="text-slate-900 font-bold text-lg m-0">All Seats</h2>
              <p className="text-slate-400 text-xs mt-0.5">Kisi seat pe click karo prices edit karne ke liye</p>
            </div>
            <span className="bg-slate-100 text-slate-500 text-xs font-bold px-3 py-1.5 rounded-full">
              {seats.length} total
            </span>
          </div>

          {seats.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
              <p className="text-slate-600 font-semibold text-sm mb-1">No seats yet</p>
              <p className="text-slate-400 text-xs">Create your first seat using the form</p>
            </div>
          ) : (
            <div className="p-6 grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
              {seats.map(seat => {
                const shiftCount = seat.price?.filter(p => p.amount > 0).length || 0;
                return (
                  <button
                    key={seat._id}
                    onClick={() => openEditModal(seat)}
                    className="aspect-square flex flex-col items-center justify-center gap-1 rounded-2xl bg-slate-50 border-2 border-slate-200 hover:border-indigo-400 hover:bg-indigo-50 transition-all cursor-pointer group"
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"
                      className="text-slate-400 group-hover:text-indigo-500 transition-colors">
                      <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
                      <line x1="7" y1="7" x2="7.01" y2="7" />
                    </svg>
                    <span className="text-xs font-extrabold text-slate-700 group-hover:text-indigo-700 transition-colors">
                      #{seat.seatNumber}
                    </span>
                    {/* Kitne shifts assigned hain */}
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                      shiftCount > 0 ? 'bg-indigo-100 text-indigo-600' : 'bg-slate-200 text-slate-400'
                    }`}>
                      {shiftCount} shift{shiftCount !== 1 ? 's' : ''}
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* ── Edit Modal ── */}
      {editSeat && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">

            {/* Modal Header */}
            <div className="bg-slate-900 px-6 py-5 flex items-center justify-between">
              <div>
                <h3 className="text-white font-bold text-base">Edit Seat #{editSeat.seatNumber}</h3>
                <p className="text-white/40 text-xs mt-0.5">Har shift ki price set karo</p>
              </div>
              <button onClick={() => setEditSeat(null)}
                className="w-8 h-8 flex items-center justify-center rounded-lg bg-white/10 text-white hover:bg-white/20 transition font-bold text-sm">
                ✕
              </button>
            </div>

            {editMessage.text && (
              <div className={`px-5 py-3 flex items-center gap-2 text-sm font-semibold border-b
                ${editMessage.type === 'success' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-red-50 text-red-700 border-red-100'}`}>
                <span>{editMessage.type === 'success' ? '✓' : '✗'}</span>
                {editMessage.text}
              </div>
            )}

            <form onSubmit={handleEditSubmit} className="p-6 space-y-3">
              {shifts.map(shift => {
                const currentPrice = editPrices.find(p => p.shiftId === shift._id);
                return (
                  <div key={shift._id} className="flex items-center gap-3 p-3 bg-slate-50 border-2 border-slate-200 rounded-xl">
                    <div className="w-2 h-2 rounded-full bg-indigo-500 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-bold text-slate-800">{shift.name}</div>
                      {shift.startTime && (
                        <div className="text-xs text-slate-400">{shift.startTime} – {shift.endTime}</div>
                      )}
                    </div>
                    <div className="relative w-32 flex-shrink-0">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">₹</span>
                      <input
                        type="number" placeholder="0"
                        value={currentPrice?.amount || ''}
                        onChange={e => handleEditPriceChange(shift._id, e.target.value)}
                        className="w-full pl-7 pr-3 py-2.5 border-2 border-slate-200 rounded-lg text-sm font-bold text-slate-800 outline-none focus:border-indigo-500 bg-white transition-all"
                      />
                    </div>
                  </div>
                );
              })}

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setEditSeat(null)}
                  className="flex-1 py-3 rounded-xl font-bold text-sm text-slate-500 border-2 border-slate-200 hover:bg-slate-50 transition">
                  Cancel
                </button>
                <button type="submit" disabled={editLoading}
                  className={`flex-1 py-3 rounded-xl font-bold text-sm text-white transition-all
                    ${editLoading ? 'bg-indigo-300 cursor-wait' : 'bg-indigo-600 hover:bg-indigo-700 active:scale-95'}`}>
                  {editLoading ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CreateSeat;