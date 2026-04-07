
// // ─── CreateSeat.jsx ───────────────────────────────────────────────────────────
// import React, { useEffect, useState } from 'react';
// import axios from 'axios';

// const CreateSeat = () => {
//   const [seatNumber, setSeatNumber] = useState('');
//   const [message, setMessage] = useState({ text: '', type: '' });
//   const [seats, setSeats] = useState([]);
//   const [shifts, setShifts] = useState([]);
//   const [priceData, setPriceData] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const API_URL = import.meta.env.VITE_API_URL;

//   const handlePriceChange = (shiftId, value) => {
//     setPriceData(prev => {
//       const existing = prev.find(p => p.shiftId === shiftId);
//       if (existing) return prev.map(p => p.shiftId === shiftId ? { ...p, amount: Number(value) } : p);
//       return [...prev, { shiftId, amount: Number(value) }];
//     });
//   };


//   const fetchSeats = async () => {
//     try {
//       const res = await axios.get(`${API_URL}/api/seats/getSeats`);
//       console.log("Seats:", res.data);
//       setSeats(res.data);
//     } catch (err) {
//       console.log(err);
//     }
//   };
//   const fetchShifts = async () => {
//     const res = await axios.get(`${API_URL}/api/shifts/get-shifts`);
//     setShifts(res.data);
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setLoading(true);
//     try {
//       await axios.post(`${API_URL}/api/seats/createSeat`, { seatNumber, price: priceData });
//       fetchSeats();
//       setMessage({ text: `Seat #${seatNumber} created successfully!`, type: 'success' });
//       setSeatNumber('');
//       setPriceData([]);
//     } catch (error) {
//       setMessage({ text: error.response?.data?.message || 'Error creating seat', type: 'error' });
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchShifts();
//     fetchSeats()

//   }, []);

//   return (
//     <div style={{ minHeight: '100vh', background: '#f8f9fc', fontFamily: "'DM Sans', 'Segoe UI', sans-serif", display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
//       <div style={{ width: '100%', maxWidth: 460 }}>
//         {/* Header */}
//         <div style={{ textAlign: 'center', marginBottom: 24 }}>
//           <div style={{ width: 52, height: 52, borderRadius: 16, background: 'linear-gradient(135deg, #065f46, #10b981)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px', boxShadow: '0 8px 24px rgba(16,185,129,0.3)' }}>
//             <svg width={26} height={26} viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" /></svg>
//           </div>
//           <h1 style={{ fontSize: 24, fontWeight: 800, color: '#1a1d2e', margin: 0 }}>Add New Seat</h1>
//           <p style={{ fontSize: 14, color: '#8a8fa8', marginTop: 6 }}>Configure seat number and shift pricing</p>
//         </div>

//         <div style={{ background: '#fff', borderRadius: 20, boxShadow: '0 4px 24px rgba(0,0,0,0.07)', overflow: 'hidden' }}>
//           {message.text && (
//             <div style={{ padding: '12px 20px', background: message.type === 'success' ? '#ecfdf5' : '#fef2f2', color: message.type === 'success' ? '#059669' : '#dc2626', borderBottom: `1px solid ${message.type === 'success' ? '#d1fae5' : '#fecaca'}`, fontSize: 13, fontWeight: 600 }}>
//               {message.type === 'success' ? '✓ ' : '✗ '}{message.text}
//             </div>
//           )}
//           <div>
//             <h3>All Seats</h3>
//             {seats.map((seat) => (
//               <div key={seat._id}>
//                 Seat No: {seat.seatNumber}
//               </div>
//             ))}
//           </div>
//           <div style={{ padding: 28 }}>
//             <form onSubmit={handleSubmit}>
//               {/* Seat Number */}
//               <div style={{ marginBottom: 20 }}>
//                 <label style={{ fontSize: 13, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 6 }}>Seat Number</label>
//                 <input
//                   type="number" placeholder="e.g. 101"
//                   value={seatNumber} onChange={e => setSeatNumber(e.target.value)} required
//                   style={{ width: '100%', padding: '11px 14px', border: '1.5px solid #e5e7eb', borderRadius: 10, fontSize: 18, fontWeight: 700, color: '#1a1d2e', outline: 'none', boxSizing: 'border-box' }}
//                 />
//               </div>

//               {/* Shift Pricing */}
//               {shifts.length > 0 && (
//                 <div style={{ marginBottom: 20 }}>
//                   <label style={{ fontSize: 13, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 10 }}>
//                     Shift Pricing <span style={{ color: '#9ca3af', fontWeight: 400 }}>(₹/month)</span>
//                   </label>
//                   <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
//                     {shifts.map(shift => (
//                       <div key={shift._id} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
//                         <div style={{ flex: 1 }}>
//                           <div style={{ fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 4 }}>{shift.name}</div>
//                           {shift.startTime && <div style={{ fontSize: 11, color: '#9ca3af' }}>{shift.startTime} – {shift.endTime}</div>}
//                         </div>
//                         <div style={{ position: 'relative', width: 130 }}>
//                           <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', fontWeight: 700, color: '#6b7280' }}>₹</span>
//                           <input
//                             type="number" placeholder="0"
//                             onChange={e => handlePriceChange(shift._id, e.target.value)}
//                             style={{ width: '100%', padding: '9px 12px 9px 28px', border: '1.5px solid #e5e7eb', borderRadius: 10, fontSize: 14, fontWeight: 700, color: '#1a1d2e', outline: 'none', boxSizing: 'border-box' }}
//                           />
//                         </div>
//                       </div>
//                     ))}
//                   </div>
//                 </div>
//               )}

//               <button type="submit" disabled={loading} style={{ width: '100%', padding: 13, background: loading ? '#6ee7b7' : 'linear-gradient(135deg, #065f46, #10b981)', color: '#fff', border: 'none', borderRadius: 12, fontSize: 15, fontWeight: 700, cursor: loading ? 'wait' : 'pointer', boxShadow: '0 4px 16px rgba(16,185,129,0.3)' }}>
//                 {loading ? 'Creating...' : 'Create Seat'}
//               </button>
//             </form>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };
// export default CreateSeat
import React, { useEffect, useState } from 'react';
import axios from 'axios';

const  CreateSeat = () => {
  const [seatNumber, setSeatNumber] = useState('');
  const [message, setMessage] = useState({ text: '', type: '' });
  const [seats, setSeats] = useState([]);
  const [shifts, setShifts] = useState([]);
  const [priceData, setPriceData] = useState([]);
  const [loading, setLoading] = useState(false);
  const API_URL = import.meta.env.VITE_API_URL;

  const handlePriceChange = (shiftId, value) => {
    setPriceData(prev => {
      const existing = prev.find(p => p.shiftId === shiftId);
      if (existing) return prev.map(p => p.shiftId === shiftId ? { ...p, amount: Number(value) } : p);
      return [...prev, { shiftId, amount: Number(value) }];
    });
  };

  const fetchSeats = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/seats/getSeats`);
      setSeats(res.data);
    } catch (err) {
      console.log(err);
    }
  };

  // const fetchShifts = async () => {
  //   const res = await axios.get(`${API_URL}/api/shifts/get-shifts`);
  //   setShifts(res.data);
  // };

  const fetchShifts = async () => {
  try {
    const res = await axios.get(`${API_URL}/api/shifts/get-shifts`);
    setShifts(res.data);
  } catch (err) {
    console.log("Shifts error:", err);
    // Add this so you see it on screen:
    setMessage({ text: 'Server error', type: 'error' });
  }
};

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.post(`${API_URL}/api/seats/createSeat`, { seatNumber, price: priceData });
      fetchSeats();
      setMessage({ text: `Seat #${seatNumber} created successfully!`, type: 'success' });
      setSeatNumber('');
      setPriceData([]);
    } catch (error) {
      setMessage({ text: error.response?.data?.message || 'Error creating seat', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchShifts();
    fetchSeats();
  }, []);

  return (
    <div className="bg-slate-100 p-6">
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-5 gap-6 items-start">

        {/* ── Left: Form (2/5) ── */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm overflow-hidden sticky top-20">

          {/* Form Header */}
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

          {/* Alert */}
          {message.text && (
            <div className={`px-5 py-3 flex items-center gap-2 text-sm font-semibold border-b
              ${message.type === 'success'
                ? 'bg-emerald-50 text-emerald-700 border-emerald-100'
                : 'bg-red-50 text-red-700 border-red-100'}`}>
              <span>{message.type === 'success' ? '✓' : '✗'}</span>
              {message.text}
            </div>
          )}

          {/* Form Body */}
          <div className="p-6">
            <form onSubmit={handleSubmit} className="space-y-5">

              {/* Seat Number */}
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">
                  Seat Number
                </label>
                <input
                  type="number"
                  placeholder="e.g. 101"
                  value={seatNumber}
                  onChange={e => setSeatNumber(e.target.value)}
                  required
                  className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl text-xl font-bold text-slate-800 bg-slate-50 outline-none focus:border-indigo-500 focus:bg-white transition-all"
                />
              </div>

              {/* Shift Pricing */}
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
                          {shift.startTime && (
                            <div className="text-xs text-slate-400">{shift.startTime} – {shift.endTime}</div>
                          )}
                        </div>
                        <div className="relative w-28 flex-shrink-0">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">₹</span>
                          <input
                            type="number"
                            placeholder="0"
                            onChange={e => handlePriceChange(shift._id, e.target.value)}
                            className="w-full pl-7 pr-3 py-2 border-2 border-slate-200 rounded-lg text-sm font-bold text-slate-800 outline-none focus:border-indigo-500 bg-white transition-all"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className={`w-full py-3.5 rounded-xl text-white font-bold text-sm transition-all
                  ${loading
                    ? 'bg-indigo-300 cursor-wait'
                    : 'bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-200 active:scale-95'}`}
              >
                {loading ? 'Creating...' : '+ Create Seat'}
              </button>
            </form>
          </div>
        </div>

        {/* ── Right: Seat Grid (3/5) ── */}
        <div className="lg:col-span-3 bg-white rounded-2xl shadow-sm overflow-hidden">

          {/* Panel Header */}
          <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
            <h2 className="text-slate-900 font-bold text-lg m-0">All Seats</h2>
            <span className="bg-slate-100 text-slate-500 text-xs font-bold px-3 py-1.5 rounded-full">
              {seats.length} total
            </span>
          </div>

          {/* Empty State */}
          {seats.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
              <div className="w-14 h-14 bg-slate-100 rounded-2xl flex items-center justify-center mb-4">
                <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round">
                  <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                  <polyline points="9 22 9 12 15 12 15 22" />
                </svg>
              </div>
              <p className="text-slate-600 font-semibold text-sm mb-1">No seats yet</p>
              <p className="text-slate-400 text-xs">Create your first seat using the form</p>
            </div>
          ) : (
            <div className="p-6 grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
              {seats.map(seat => (
                <div
                  key={seat._id}
                  className="aspect-square flex flex-col items-center justify-center gap-1.5 rounded-2xl bg-slate-50 border-2 border-slate-200 hover:border-indigo-400 hover:bg-indigo-50 transition-all cursor-default group"
                >
                  <svg
                    width="22" height="22"
                    viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" strokeWidth="2" strokeLinecap="round"
                    className="text-slate-400 group-hover:text-indigo-500 transition-colors"
                  >
                    <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
                    <line x1="7" y1="7" x2="7.01" y2="7" />
                  </svg>
                  <span className="text-xs font-extrabold text-slate-700 group-hover:text-indigo-700 transition-colors">
                    #{seat.seatNumber}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default CreateSeat;