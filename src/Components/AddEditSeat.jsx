import React, { useEffect, useState } from 'react';
import axios from 'axios';

const AddEditSeat = ({ seat = null, shifts, rooms, onClose, onSuccess }) => {
  // agar seat prop hai → edit mode, nahi hai → add mode
  const isEdit = Boolean(seat);

  const [seatNumber, setSeatNumber] = useState('');
  const [selectedRoom, setSelectedRoom] = useState('');
  const [priceData, setPriceData]   = useState([]);
  const [loading, setLoading]       = useState(false);
  const [message, setMessage]       = useState({ text: '', type: '' });

  const API_URL = import.meta.env.VITE_API_URL;

  const authHeaders = () => {
    const token = localStorage.getItem("token");
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  // Edit mode mein prefill karo
  useEffect(() => {
    if (isEdit && seat) {
      setSeatNumber(seat.seatNumber || '');

        const roomIdValue = seat.roomId?._id
      ? String(seat.roomId._id)
      : seat.roomId
        ? String(seat.roomId)
        : '';
     setSelectedRoom(roomIdValue);
      const prices = shifts.map(shift => {
        const existing = seat.price?.find(
          p => String(p.shiftId) === String(shift._id)
        );
        return { shiftId: shift._id, amount: existing ? existing.amount : 0 };
      });
      setPriceData(prices);
    } else {
      // Add mode — empty state
      setSeatNumber('');
      setSelectedRoom('');
      setPriceData(shifts.map(s => ({ shiftId: s._id, amount: 0 })));
    }
  }, [seat, shifts]);

  const handlePriceChange = (shiftId, value) => {
    setPriceData(prev =>
      prev.map(p => p.shiftId === shiftId ? { ...p, amount: Number(value) } : p)
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ text: '', type: '' });

    const validPrices = priceData.filter(p => p.amount > 0);
    if (validPrices.length === 0) {
      setMessage({ text: "Enter at least one shift price", type: "error" });
      setLoading(false);
      return;
    }

    try {
      if (isEdit) {
        // ── UPDATE ──
        await axios.put(
          `${API_URL}/api/seats/updateSeat/${seat._id}`,
          { price: priceData, roomId: selectedRoom || null },
          { headers: authHeaders() }
        );
        setMessage({ text: `Seat #${seat.seatNumber} updated!`, type: 'success' });
      } else {
        // ── CREATE ──
        const token = localStorage.getItem("token");
        await axios.post(
          `${API_URL}/api/seats/createSeat`,
          {
            seatNumber: Number(seatNumber),
            price: validPrices,
            roomId: selectedRoom || null
          },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setMessage({ text: `Seat #${seatNumber} created!`, type: 'success' });
      }
      setTimeout(() => onSuccess(), 700);
    } catch (error) {
      setMessage({
        text: error.response?.data?.message || 'Something went wrong',
        type: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center
      justify-center z-50 p-4">
      <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden
        max-h-[92vh] overflow-y-auto">

        {/* ── Header ── */}
        <div className="px-7 py-6 text-white relative overflow-hidden"
          style={{
            background: isEdit
              ? 'linear-gradient(135deg, #0f172a, #1e293b)'
              : 'linear-gradient(135deg, #1d4ed8, #4f46e5)'
          }}>
          <div className="absolute -top-8 -right-8 w-28 h-28 rounded-full bg-white/10"/>
          <div className="absolute -bottom-6 -left-4 w-20 h-20 rounded-full bg-white/10"/>
          <div className="relative">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 text-xl
              ${isEdit ? 'bg-white/10 border border-white/20' : 'bg-white/20'}`}>
              {isEdit ? '✏️' : '💺'}
            </div>
            <h2 className="text-xl font-black">
              {isEdit ? `Edit Seat #${seat.seatNumber}` : 'Add New Seat'}
            </h2>
            <p className="text-white/60 text-sm mt-0.5">
              {isEdit
                ? seat.roomId?.name ? `Currently in 🏢 ${seat.roomId?.name}` : 'No room assigned'
                : 'Configure seat number, room & pricing'}
            </p>
          </div>
          <button onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center
              bg-white/20 hover:bg-white/30 rounded-full text-white transition text-sm">
            ✕
          </button>
        </div>

        {/* ── Message ── */}
        {message.text && (
          <div className={`px-6 py-3 flex items-center gap-2 text-sm font-semibold
            ${message.type === 'success'
              ? 'bg-emerald-50 text-emerald-700'
              : 'bg-red-50 text-red-600'}`}>
            <span className={`w-5 h-5 rounded-full flex items-center justify-center
              text-white text-xs font-black flex-shrink-0
              ${message.type === 'success' ? 'bg-emerald-500' : 'bg-red-500'}`}>
              {message.type === 'success' ? '✓' : '✕'}
            </span>
            {message.text}
          </div>
        )}

        {/* ── Form ── */}
        <form onSubmit={handleSubmit} className="p-7 space-y-5">

          {/* Seat Number — sirf add mode mein editable */}
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase
              tracking-widest mb-1.5">Seat Number</label>
            <input
              type="number"
              placeholder="e.g. 101"
              value={seatNumber}
              onChange={e => setSeatNumber(e.target.value)}
              disabled={isEdit}  // edit mein seat number change nahi hoga
              required={!isEdit}
              className={`w-full px-4 py-3 border-2 rounded-xl text-xl font-bold
                text-slate-800 outline-none transition-all
                ${isEdit
                  ? 'bg-slate-100 border-slate-200 cursor-not-allowed text-slate-400'
                  : 'bg-slate-50 border-slate-200 focus:border-indigo-500 focus:bg-white'}`}
            />
            {isEdit && (
              <p className="text-[11px] text-slate-400 mt-1 ml-1">
                Seat number cannot be changed after creation
              </p>
            )}
          </div>

          {/* Room */}
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase
              tracking-widest mb-1.5">
              Room
              <span className="normal-case font-normal text-slate-400 ml-1">— optional</span>
            </label>
            <div className="relative">
              <select
                value={selectedRoom}
                onChange={e => setSelectedRoom(e.target.value)}
                className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl
                  text-slate-900 outline-none focus:border-indigo-400 focus:bg-white
                  transition-all appearance-none cursor-pointer text-sm font-medium">
                <option value="">No Room (General)</option>
                {rooms.map(room => (
                  <option key={room._id} value={room._id}>{room.name}</option>
                ))}
              </select>
              <svg className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400
                pointer-events-none" width="14" height="14" viewBox="0 0 24 24"
                fill="none" stroke="currentColor" strokeWidth="2.5">
                <polyline points="6 9 12 15 18 9"/>
              </svg>
            </div>
          </div>

          {/* Shift Pricing */}
          {shifts.length > 0 && (
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase
                tracking-widest mb-3">
                Shift Pricing
                <span className="text-slate-400 normal-case font-normal ml-1">(₹/month)</span>
              </label>
              <div className="space-y-2">
                {shifts.map(shift => {
                  const current = priceData.find(p => p.shiftId === shift._id);
                  return (
                    <div key={shift._id}
                      className="flex items-center gap-3 p-3 bg-slate-50 border-2
                        border-slate-200 rounded-xl">
                      <div className="w-2 h-2 rounded-full bg-indigo-500 flex-shrink-0"/>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-bold text-slate-800 truncate">
                          {shift.name}
                        </div>
                        {shift.startTime && (
                          <div className="text-xs text-slate-400">
                            {shift.startTime} – {shift.endTime}
                          </div>
                        )}
                      </div>
                      <div className="relative w-28 flex-shrink-0">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2
                          text-slate-400 font-bold text-sm">₹</span>
                        <input
                          type="number" placeholder="0"
                          value={current?.amount || ''}
                          onChange={e => handlePriceChange(shift._id, e.target.value)}
                          className="w-full pl-7 pr-3 py-2 border-2 border-slate-200 rounded-lg
                            text-sm font-bold text-slate-800 outline-none
                            focus:border-indigo-500 bg-white transition-all"
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Buttons */}
          <div className="grid grid-cols-2 gap-3 pt-2">
            <button type="button" onClick={onClose}
              className="py-3 rounded-xl font-bold text-slate-500 bg-slate-100
                hover:bg-slate-200 transition text-sm">
              Cancel
            </button>
            <button type="submit" disabled={loading}
              className={`py-3 rounded-xl font-bold text-white text-sm transition
                active:scale-[0.98]
                ${loading
                  ? 'opacity-60 cursor-wait bg-indigo-400'
                  : 'bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-200'}`}>
              {loading
                ? (isEdit ? 'Saving...' : 'Creating...')
                : (isEdit ? 'Save Changes' : 'Create Seat')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddEditSeat;