import React, { useEffect, useState } from 'react';
import axios from 'axios';
import AddEditSeat from '../Components/AddEditSeat';

const CreateSeat = () => {
  const [seats, setSeats]           = useState([]);
  const [shifts, setShifts]         = useState([]);
  const [rooms, setRooms]           = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editSeat, setEditSeat]     = useState(null);

  const API_URL = import.meta.env.VITE_API_URL;

  const authHeaders = () => {
    const token = localStorage.getItem("token");
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  const fetchSeats = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/seats/getSeats`, { headers: authHeaders() });
      if (res.status === 200 && Array.isArray(res.data)) setSeats(res.data);
    } catch (err) { console.log(err); }
  };

  const fetchShifts = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/shifts/get-shifts`, { headers: authHeaders() });
      setShifts(res.data);
    } catch (err) { console.log(err); }
  };

  const fetchRooms = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/rooms/all`, { headers: authHeaders() });
      setRooms((res.data.rooms || []).filter(r => r.status === "Active"));
    } catch (err) { console.error(err); }
  };

  // ✅ Single useEffect
  useEffect(() => {
    fetchSeats();
    fetchShifts();
    fetchRooms();
  }, []);

  return (
    <div className="bg-slate-100 min-h-screen p-4 md:p-6">
      <div className="max-w-6xl mx-auto">

        {/* ── Header ── */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-black text-slate-900">Seats</h1>
            <p className="text-slate-400 text-sm mt-1">{seats.length} seats configured</p>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white
              font-bold px-5 py-3 rounded-2xl shadow-lg shadow-indigo-200 transition-all
              active:scale-95 text-sm"
          >
            <span className="text-lg leading-none">+</span> Add Seat
          </button>
        </div>

        {/* ── Stat Cards ── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {[
            {
              label: 'Total Seats',
              value: seats.length,
              sub: 'configured',
              color: '#4285f4',
              icon: '💺'
            },
            {
              label: 'With Rooms',
              value: seats.filter(s => s.roomId).length,
              sub: 'assigned to rooms',
              color: '#34a853',
              icon: '🏢'
            },
            {
              label: 'General',
              value: seats.filter(s => !s.roomId).length,
              sub: 'no room assigned',
              color: '#f2994a',
              icon: '📋'
            },
            {
              label: 'Priced Seats',
              value: seats.filter(s => s.price?.some(p => p.amount > 0)).length,
              sub: 'shifts set',
              color: '#9b51e0',
              icon: '⏰'
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

        {/* ── Seats Grid ── */}
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h2 className="text-slate-900 font-bold text-lg">All Seats</h2>
              <p className="text-slate-400 text-xs mt-0.5">
                Click on a seat to edit prices
              </p>
            </div>
            <span className="bg-slate-100 text-slate-500 text-xs font-bold
              px-3 py-1.5 rounded-full">
              {seats.length} total
            </span>
          </div>

          {seats.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
              <div className="text-5xl mb-4">💺</div>
              <p className="text-slate-600 font-semibold text-sm mb-1">No seats yet</p>
              <p className="text-slate-400 text-xs mb-6">
                Add your first seat to get started
              </p>
              <button
                onClick={() => setShowAddModal(true)}
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold
                  px-6 py-3 rounded-2xl text-sm transition active:scale-95">
                + Add Seat
              </button>
            </div>
          ) : (
            <div className="p-6 grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5
              lg:grid-cols-6 gap-3">
              {seats.map(seat => {
                const shiftCount = seat.price?.filter(p => p.amount > 0).length || 0;
                return (
                  <button
                    key={seat._id}
                    onClick={() => setEditSeat(seat)}
                    className="aspect-square flex flex-col items-center justify-center
                      gap-1 rounded-2xl bg-slate-50 border-2 border-slate-200
                      hover:border-indigo-400 hover:bg-indigo-50 transition-all
                      cursor-pointer group p-2"
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
                      stroke="currentColor" strokeWidth="2" strokeLinecap="round"
                      className="text-slate-400 group-hover:text-indigo-500
                        transition-colors flex-shrink-0">
                      <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83
                        0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/>
                      <line x1="7" y1="7" x2="7.01" y2="7"/>
                    </svg>

                    <span className="text-xs font-extrabold text-slate-700
                      group-hover:text-indigo-700 transition-colors">
                      #{seat.seatNumber}
                    </span>

                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full
                      ${shiftCount > 0
                        ? 'bg-indigo-100 text-indigo-600'
                        : 'bg-slate-200 text-slate-400'}`}>
                      {shiftCount}s
                    </span>

                    {/* Room naam */}
                    {seat.roomId && (
                      <span className="text-[9px] font-bold text-indigo-400
                        truncate w-full text-center px-1 leading-tight">
                        🏢 {seat.roomId?.name}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* ── Add Modal ── */}
      {showAddModal && (
        <AddEditSeat
          shifts={shifts}
          rooms={rooms}
          onClose={() => setShowAddModal(false)}
          onSuccess={() => {
            fetchSeats();
            setShowAddModal(false);
          }}
        />
      )}

      {/* ── Edit Modal — seat prop pass hoga toh edit mode ── */}
      {editSeat && (
        <AddEditSeat
          seat={editSeat}
          shifts={shifts}
          rooms={rooms}
          onClose={() => setEditSeat(null)}
          onSuccess={() => {
            fetchSeats();
            setEditSeat(null);
          }}
        />
      )}
    </div>
  );
};

export default CreateSeat;