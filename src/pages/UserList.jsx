import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Registration from './Registration';

export default function UserList() {
    const [showModal, setShowModal] = useState(false);
    const [editUser, setEditUser] = useState(null);
    const [users, setUsers] = useState([]);
    const [payments, setPayments] = useState({});
    const [selectedUser, setSelectedUser] = useState(null);
    const [amount, setAmount] = useState("");
    const [filter, setFilter] = useState("All");
    const [search, setSearch] = useState("");
    const API_URL = import.meta.env.VITE_API_URL;
    
    // ── Loading States ──
    const [loading, setLoading] = useState(true); // Main data fetch
    const [isSubmitting, setIsSubmitting] = useState(false); // Pay Button modal
    const [togglingUserId, setTogglingUserId] = useState(null); // Row-specific status switch toggle

    const authHeaders = () => {
        const token = localStorage.getItem("token");
        return token ? { Authorization: `Bearer ${token}` } : {};
    };

    const fetchUsers = async () => {
        try {
            const res = await axios.get(`${API_URL}/api/users/all`, { headers: authHeaders() });
            const userData = Array.isArray(res.data) ? res.data : (res.data.users || []);
            setUsers(userData);

            const paymentData = {};
            await Promise.all(userData.map(async (user) => {
                if (!user?._id) return;
                try {
                    const pRes = await axios.get(`${API_URL}/api/payment/user-payment/${user._id}`, { headers: authHeaders() });
                    paymentData[user._id] = pRes.data;
                } catch {
                    paymentData[user._id] = { seatPrice: 0, totalPaid: 0, pending: 0 };
                }
            }));
            setPayments(paymentData);
        } catch (error) {
            console.error("Error fetching users:", error);
            setUsers([]);
        } finally {
            setLoading(false); // Turning off loading screen
        }
    };

    const handlePayment = async () => {
        if (!amount || amount <= 0) return;
        try {
            setIsSubmitting(true); // Start modal loading animation
            await axios.post(`${API_URL}/api/payment/pay`,
                { userId: selectedUser._id, seatId: selectedUser.seatId?._id, amount: Number(amount) },
                { headers: authHeaders() }
            );
            setAmount(""); 
            setSelectedUser(null); 
            await fetchUsers();
        } catch (error) { 
            console.error(error); 
        } finally {
            setIsSubmitting(false); // Stop modal loading animation
        }
    };

    const toggleStatus = async (user) => {
        try {
            setTogglingUserId(user._id); // Sets row-specific toggle to loading state
            await axios.put(`${API_URL}/api/users/status/${user._id}`,
                { status: user.status === "Active" ? "Inactive" : "Active" },
                { headers: authHeaders() }
            );
            await fetchUsers();
        } catch (error) { 
            console.error(error); 
        } finally {
            setTogglingUserId(null); // Clear row-specific loading state
        }
    };

    useEffect(() => { 
        fetchUsers(); 
    }, []);

    const stats = Object.values(payments).reduce((acc, curr) => ({
        revenue: acc.revenue + (curr?.totalPaid || 0),
        pending: acc.pending + (curr?.pending || 0)
    }), { revenue: 0, pending: 0 });

    const filteredUsers = users.filter(u => {
        if (!u) return false;
        const matchStatus = filter === "All" || u.status === filter;
        const matchSearch = !search ||
            u.name?.toLowerCase().includes(search.toLowerCase()) ||
            u.email?.toLowerCase().includes(search.toLowerCase());
        return matchStatus && matchSearch;
    });

    const avatarColors = ['#4285f4','#34a853','#ea4335','#9b51e0','#f2994a','#0f9d58'];
    const getAvatarColor = (name) => avatarColors[(name?.charCodeAt(0) || 0) % avatarColors.length];

    // ── Global Full Screen Loader ──
    if (loading) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50">
                <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                <p className="mt-4 text-slate-500 font-bold text-sm tracking-wide">Syncing member records...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen p-4 md:p-8 font-sans" style={{ background: '#f0f2f5' }}>

            {/* ── Page Header ── */}
            <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-slate-900">Members</h1>
                    <p className="text-slate-400 text-sm mt-1">{users.length} registered members</p>
                </div>
                <button
                    onClick={() => { setEditUser(null); setShowModal(true); }}
                    className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-5 py-3 rounded-2xl shadow-lg shadow-indigo-200 transition-all active:scale-95 text-sm"
                >
                    <span className="text-lg leading-none">+</span> Add Member
                </button>
            </div>

            {/* ── Stat Cards ── */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                {[
                    { label: 'Total Members', value: users.length, sub: `${users.filter(u => u?.status === 'Active').length} active`, color: '#4285f4', icon: '👥' },
                    { label: 'Active', value: users.filter(u => u?.status === 'Active').length, sub: 'currently enrolled', color: '#34a853', icon: '✅' },
                    { label: 'Revenue', value: `₹${stats.revenue}`, sub: 'total collected', color: '#9b51e0', icon: '💰' },
                    { label: 'Pending', value: `₹${stats.pending}`, sub: 'to be collected', color: '#f2994a', icon: '⏳' },
                ].map((card) => (
                    <div key={card.label} className="bg-white rounded-2xl p-5 shadow-sm border border-white relative overflow-hidden">
                        <div className="absolute top-4 right-4 text-2xl opacity-20">{card.icon}</div>
                        <p className="text-[11px] font-bold uppercase tracking-widest mb-2" style={{ color: card.color }}>{card.label}</p>
                        <p className="text-2xl font-black text-slate-900 mb-1">{card.value}</p>
                        <p className="text-xs font-semibold text-slate-400">{card.sub}</p>
                        <div className="absolute bottom-0 left-0 right-0 h-1 rounded-b-2xl" style={{ background: card.color }} />
                    </div>
                ))}
            </div>

            {/* ── Table Card ── */}
            <div className="bg-white rounded-3xl shadow-sm overflow-hidden border border-slate-100">

                {/* Table Toolbar */}
                <div className="p-5 border-b border-slate-100 flex flex-col md:flex-row justify-between items-center gap-3">
                    <div className="relative w-full max-w-sm">
                        <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
                        <input
                            type="text" value={search} onChange={e => setSearch(e.target.value)}
                            placeholder="Search by name or email..."
                            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 rounded-xl outline-none text-sm border-2 border-transparent focus:border-indigo-300 transition-all"
                        />
                    </div>
                    <div className="flex gap-1.5 bg-slate-100 p-1 rounded-xl">
                        {["All", "Active", "Inactive"].map(t => (
                            <button key={t} onClick={() => setFilter(t)}
                                className={`px-5 py-1.5 rounded-lg text-sm font-bold transition-all ${filter === t ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}>
                                {t}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b border-slate-100">
                                {['Member', 'Seat', 'Shift', 'Status', 'Seat Price', 'Paid', 'Pending', 'Actions'].map(h => (
                                    <th key={h} className="px-6 py-4 text-[11px] font-black uppercase tracking-widest text-slate-400">{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {filteredUsers.length === 0 ? (
                                <tr>
                                    <td colSpan={8} className="text-center py-16 text-slate-400 font-medium">
                                        <div className="text-4xl mb-3">👤</div>
                                        No members found
                                    </td>
                                        </tr>
                            ) : filteredUsers.map((user) => {
                                if (!user?._id) return null;
                                const avatarColor = getAvatarColor(user.name);
                                const pendingAmt = payments[user._id]?.pending || 0;
                                const isRowToggling = togglingUserId === user._id;

                                return (
                                    <tr key={user._id} className="border-b border-slate-50 hover:bg-slate-50/70 transition-colors">

                                        {/* Member */}
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-9 h-9 rounded-xl flex items-center justify-center font-black text-sm text-white flex-shrink-0"
                                                    style={{ background: avatarColor }}>
                                                    {user.name?.charAt(0)?.toUpperCase() || '?'}
                                                </div>
                                                <div>
                                                    <div className="font-bold text-slate-800 text-sm">{user.name}</div>
                                                    <div className="text-[11px] text-slate-400">{user.email}</div>
                                                </div>
                                            </div>
                                        </td>

                                        {/* Seat */}
                                        <td className="px-6 py-4">
                                            <span className="bg-indigo-50 text-indigo-600 font-black text-xs px-2.5 py-1 rounded-lg">
                                                #{user.seatId?.seatNumber || '—'}
                                            </span>
                                        </td>

                                        {/* Shift */}
                                        <td className="px-6 py-4 text-sm text-slate-600 font-medium">
                                            {user.shiftId?.name || <span className="text-slate-300">No Shift</span>}
                                        </td>

                                        {/* Status */}
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2.5">
                                                <span className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-black ${user.status === "Active" ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-500"}`}>
                                                    <span className={`w-1.5 h-1.5 rounded-full ${user.status === "Active" ? "bg-emerald-500" : "bg-red-400"}`}></span>
                                                    {user.status}
                                                </span>
                                                <button 
                                                    onClick={() => toggleStatus(user)}
                                                    disabled={togglingUserId !== null}
                                                    className={`relative w-10 h-5 rounded-full transition-all duration-300 flex-shrink-0 ${
                                                        isRowToggling ? 'opacity-50 cursor-wait' : ''
                                                    } ${user.status === "Active" ? "bg-emerald-500" : "bg-slate-200"}`}
                                                >
                                                    <div className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-all duration-300 ${user.status === "Active" ? "translate-x-5" : ""}`}>
                                                        {isRowToggling && (
                                                            <div className="w-2 h-2 mx-auto mt-1 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                                                        )}
                                                    </div>
                                                </button>
                                            </div>
                                        </td>

                                        {/* Prices */}
                                        <td className="px-6 py-4 font-bold text-slate-800 text-sm">₹{payments[user._id]?.seatPrice || 0}</td>
                                        <td className="px-6 py-4 font-bold text-emerald-600 text-sm">₹{payments[user._id]?.totalPaid || 0}</td>
                                        <td className="px-6 py-4">
                                            <span className={`font-bold text-sm ${pendingAmt > 0 ? 'text-red-500' : 'text-emerald-600'}`}>
                                                ₹{pendingAmt}
                                            </span>
                                        </td>

                                        {/* Actions */}
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <button 
                                                    onClick={() => setSelectedUser(user)}
                                                    disabled={togglingUserId !== null}
                                                    className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 text-white px-3.5 py-1.5 rounded-lg text-xs font-bold shadow-sm shadow-indigo-200 transition active:scale-95"
                                                >
                                                    + Pay
                                                </button>
                                                <button 
                                                    onClick={() => { setEditUser(user); setShowModal(true); }}
                                                    disabled={togglingUserId !== null}
                                                    className="bg-slate-100 hover:bg-slate-200 disabled:opacity-50 text-slate-600 px-3.5 py-1.5 rounded-lg text-xs font-bold transition active:scale-95"
                                                >
                                                    Edit
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* ── Payment Modal ── */}
            {selectedUser && (
                <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl">
                        <div className="p-6 text-white relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #4f46e5, #7c3aed)' }}>
                            <div className="absolute -top-6 -right-6 w-24 h-24 rounded-full bg-white/10" />
                            <div className="absolute -bottom-8 -left-4 w-20 h-20 rounded-full bg-white/10" />
                            <p className="text-xs font-bold tracking-widest uppercase opacity-70 mb-1">Payment Entry</p>
                            <h3 className="text-2xl font-black capitalize">{selectedUser.name}</h3>
                            <p className="text-sm opacity-60 mt-0.5">
                                Seat #{selectedUser.seatId?.seatNumber || '—'} · {selectedUser.shiftId?.name || 'No shift'}
                            </p>
                        </div>
                        <div className="grid grid-cols-3 border-b border-slate-100">
                            {[
                                { label: 'Seat Price', val: payments[selectedUser._id]?.seatPrice || 0, color: 'text-slate-800' },
                                { label: 'Paid', val: payments[selectedUser._id]?.totalPaid || 0, color: 'text-emerald-600' },
                                { label: 'Pending', val: payments[selectedUser._id]?.pending || 0, color: 'text-red-500' },
                            ].map((s, i) => (
                                <div key={i} className={`p-4 text-center ${i < 2 ? 'border-r border-slate-100' : ''}`}>
                                    <p className="text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1">{s.label}</p>
                                    <p className={`text-lg font-black ${s.color}`}>₹{s.val}</p>
                                </div>
                            ))}
                        </div>
                        <div className="p-6">
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Amount to Pay</label>
                            <div className="relative mb-5">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-black text-lg">₹</span>
                                <input 
                                    type="number" value={amount} onChange={e => setAmount(e.target.value)}
                                    disabled={isSubmitting}
                                    className="w-full pl-10 pr-4 py-4 bg-slate-50 border-2 border-transparent focus:border-indigo-400 rounded-2xl outline-none text-2xl font-black transition-all disabled:opacity-60"
                                    placeholder="0" autoFocus 
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <button 
                                    onClick={() => { setSelectedUser(null); setAmount(""); }}
                                    disabled={isSubmitting}
                                    className="py-3 rounded-xl font-bold text-slate-500 bg-slate-100 hover:bg-slate-200 transition text-sm disabled:opacity-50"
                                >
                                    Cancel
                                </button>
                                <button 
                                    onClick={handlePayment}
                                    disabled={Number(amount) <= 0 || isSubmitting}
                                    className={`py-3 rounded-xl font-bold text-white text-sm transition active:scale-95 flex items-center justify-center gap-2 ${
                                        Number(amount) > 0 && !isSubmitting 
                                        ? 'bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-200' 
                                        : 'bg-slate-300 cursor-not-allowed'
                                    }`}
                                >
                                    {isSubmitting ? (
                                        <>
                                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                            Processing...
                                        </>
                                    ) : (
                                        'Record Payment'
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* ── Add/Edit Modal ── */}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-3xl w-full max-w-md relative shadow-2xl max-h-[92vh] overflow-y-auto">
                        <button onClick={() => setShowModal(false)}
                            className="absolute top-4 right-4 z-10 w-8 h-8 flex items-center justify-center bg-slate-100 hover:bg-red-50 hover:text-red-500 text-slate-400 rounded-full font-bold transition text-sm">
                            ✕
                        </button>
                        <Registration closeModal={() => setShowModal(false)} refreshUsers={fetchUsers} editUser={editUser} />
                    </div>
                </div>
            )}
        </div>
    );
}