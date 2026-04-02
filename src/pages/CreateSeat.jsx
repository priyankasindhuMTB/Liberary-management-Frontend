
// ─── CreateSeat.jsx ───────────────────────────────────────────────────────────
import React, { useEffect, useState } from 'react';
import axios from 'axios';
 
 const CreateSeat = () => {
  const [seatNumber, setSeatNumber] = useState('');
  const [message, setMessage] = useState({ text: '', type: '' });
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
 
  const fetchShifts = async () => {
    const res = await axios.get(`${API_URL}/api/shifts/get-shifts`);
    setShifts(res.data);
  };
 
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.post(`${API_URL}/api/seats/createSeat`, { seatNumber, price: priceData });
      setMessage({ text: `Seat #${seatNumber} created successfully!`, type: 'success' });
      setSeatNumber('');
      setPriceData([]);
    } catch (error) {
      setMessage({ text: error.response?.data?.message || 'Error creating seat', type: 'error' });
    } finally {
      setLoading(false);
    }
  };
 
  useEffect(() => { fetchShifts(); }, []);
 
  return (
    <div style={{ minHeight: '100vh', background: '#f8f9fc', fontFamily: "'DM Sans', 'Segoe UI', sans-serif", display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div style={{ width: '100%', maxWidth: 460 }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <div style={{ width: 52, height: 52, borderRadius: 16, background: 'linear-gradient(135deg, #065f46, #10b981)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px', boxShadow: '0 8px 24px rgba(16,185,129,0.3)' }}>
            <svg width={26} height={26} viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" /></svg>
          </div>
          <h1 style={{ fontSize: 24, fontWeight: 800, color: '#1a1d2e', margin: 0 }}>Add New Seat</h1>
          <p style={{ fontSize: 14, color: '#8a8fa8', marginTop: 6 }}>Configure seat number and shift pricing</p>
        </div>
 
        <div style={{ background: '#fff', borderRadius: 20, boxShadow: '0 4px 24px rgba(0,0,0,0.07)', overflow: 'hidden' }}>
          {message.text && (
            <div style={{ padding: '12px 20px', background: message.type === 'success' ? '#ecfdf5' : '#fef2f2', color: message.type === 'success' ? '#059669' : '#dc2626', borderBottom: `1px solid ${message.type === 'success' ? '#d1fae5' : '#fecaca'}`, fontSize: 13, fontWeight: 600 }}>
              {message.type === 'success' ? '✓ ' : '✗ '}{message.text}
            </div>
          )}
 
          <div style={{ padding: 28 }}>
            <form onSubmit={handleSubmit}>
              {/* Seat Number */}
              <div style={{ marginBottom: 20 }}>
                <label style={{ fontSize: 13, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 6 }}>Seat Number</label>
                <input
                  type="number" placeholder="e.g. 101"
                  value={seatNumber} onChange={e => setSeatNumber(e.target.value)} required
                  style={{ width: '100%', padding: '11px 14px', border: '1.5px solid #e5e7eb', borderRadius: 10, fontSize: 18, fontWeight: 700, color: '#1a1d2e', outline: 'none', boxSizing: 'border-box' }}
                />
              </div>
 
              {/* Shift Pricing */}
              {shifts.length > 0 && (
                <div style={{ marginBottom: 20 }}>
                  <label style={{ fontSize: 13, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 10 }}>
                    Shift Pricing <span style={{ color: '#9ca3af', fontWeight: 400 }}>(₹/month)</span>
                  </label>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {shifts.map(shift => (
                      <div key={shift._id} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 4 }}>{shift.name}</div>
                          {shift.startTime && <div style={{ fontSize: 11, color: '#9ca3af' }}>{shift.startTime} – {shift.endTime}</div>}
                        </div>
                        <div style={{ position: 'relative', width: 130 }}>
                          <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', fontWeight: 700, color: '#6b7280' }}>₹</span>
                          <input
                            type="number" placeholder="0"
                            onChange={e => handlePriceChange(shift._id, e.target.value)}
                            style={{ width: '100%', padding: '9px 12px 9px 28px', border: '1.5px solid #e5e7eb', borderRadius: 10, fontSize: 14, fontWeight: 700, color: '#1a1d2e', outline: 'none', boxSizing: 'border-box' }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
 
              <button type="submit" disabled={loading} style={{ width: '100%', padding: 13, background: loading ? '#6ee7b7' : 'linear-gradient(135deg, #065f46, #10b981)', color: '#fff', border: 'none', borderRadius: 12, fontSize: 15, fontWeight: 700, cursor: loading ? 'wait' : 'pointer', boxShadow: '0 4px 16px rgba(16,185,129,0.3)' }}>
                {loading ? 'Creating...' : 'Create Seat'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
export default CreateSeat
 