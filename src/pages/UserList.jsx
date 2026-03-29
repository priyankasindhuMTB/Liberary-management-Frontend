import React, { useEffect, useState } from 'react';
import axios from 'axios';

export default function UserList() {
    const [users, setUsers] = useState([]);
    const [payments, setPayments] = useState({});
    const [selectedUser, setSelectedUser] = useState(null);
    const [amount, setAmount] = useState("");
    const [filter, setFilter] = useState("All");
    const API_URL = import.meta.env.VITE_API_URL;

    const fetchUsers = async () => {
        try {
            const res = await axios.get(`${API_URL}/users/all`);

            console.log("FULL RESPONSE:", res.data);

            const userData = res.data.users || []; // ✅ FIX
            setUsers(userData);

            const paymentData = {};

            await Promise.all(
                userData.map(async (user) => {
                    try {
                        const pRes = await axios.get(`${API_URL}/payment/user-payment/${user._id}`);
                        paymentData[user._id] = pRes.data;
                        console.log("Payment API:", pRes.data);
                    } catch {
                        paymentData[user._id] = { seatPrice: 0, totalPaid: 0, pending: 0 };
                    }
                })
            );

            setPayments(paymentData);

        } catch (error) {
            console.error("Error fetching data", error);
            setUsers([]);
        }
    };

    const handlePayment = async () => {
        if (!amount || amount <= 0) return;
        try {
            await axios.post(`${API_URL}/payment/pay`, {
                userId: selectedUser._id,
                seatId: selectedUser.seatId?._id,
                shiftId: selectedUser.shiftId?._id,
                amount: Number(amount)
            });
            setAmount("");
            setSelectedUser(null);
            fetchUsers(); // Refresh numbers immediately
        } catch (error) {
            console.error(error);
        }
    };

    useEffect(() => { fetchUsers(); }, []);


    const toggleStatus = async (user) => {
  try {
    const newStatus = user.status === "Active" ? "Inactive" : "Active";

    await axios.put(`${API_URL}/users/status/${user._id}`, {
      status: newStatus
    });

    // refresh data
    fetchUsers();

  } catch (error) {
    console.error("Status update error:", error);
  }
};

    // Global Stats for the top cards
    const stats = Object.values(payments).reduce((acc, curr) => ({
        revenue: acc.revenue + (curr.totalPaid || 0),
        pending: acc.pending + (curr.pending || 0)
    }), { revenue: 0, pending: 0 });

    return (
        <div className="min-h-screen bg-[#f8f9fa] p-4 md:p-8 font-sans">
            {/* Header Title */}
            <div className="text-center mb-8">
                <h1 className="text-4xl font-black text-[#1a1d23] mb-1">Members</h1>
                <p className="text-slate-400 font-medium">{users.length} registered members</p>
            </div>

            {/* Dynamic Stat Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
                <div className="bg-white p-6 rounded-[24px] shadow-sm border-l-[6px] border-[#4285f4] flex flex-col items-center">
                    <span className="text-[11px] font-bold text-slate-400 tracking-widest uppercase mb-2">Total Members</span>
                    <span className="text-3xl font-black text-[#1a1d23]">{users.length}</span>
                    <span className="text-[#4285f4] text-xs font-bold mt-1">{users.filter(u => u.status === 'Active').length} active</span>
                </div>
                <div className="bg-white p-6 rounded-[24px] shadow-sm border-l-[6px] border-[#34a853] flex flex-col items-center">
                    <span className="text-[11px] font-bold text-slate-400 tracking-widest uppercase mb-2">Active</span>
                    <span className="text-3xl font-black text-[#1a1d23]">{users.filter(u => u.status === 'Active').length}</span>
                    <span className="text-[#34a853] text-xs font-bold mt-1">currently enrolled</span>
                </div>
                <div className="bg-white p-6 rounded-[24px] shadow-sm border-l-[6px] border-[#9b51e0] flex flex-col items-center">
                    <span className="text-[11px] font-bold text-slate-400 tracking-widest uppercase mb-2">Revenue</span>
                    <span className="text-3xl font-black text-[#1a1d23]">₹{stats.revenue}</span>
                    <span className="text-[#9b51e0] text-xs font-bold mt-1">total collected</span>
                </div>
                <div className="bg-white p-6 rounded-[24px] shadow-sm border-l-[6px] border-[#f2994a] flex flex-col items-center">
                    <span className="text-[11px] font-bold text-slate-400 tracking-widest uppercase mb-2">Pending</span>
                    <span className="text-3xl font-black text-[#1a1d23]">₹{stats.pending}</span>
                    <span className="text-[#f2994a] text-xs font-bold mt-1">to be collected</span>
                </div>
            </div>

            {/* Table Section */}
            <div className="bg-white rounded-[30px] shadow-sm overflow-hidden border border-slate-100">
                <div className="p-5 border-b flex flex-col md:flex-row justify-between items-center gap-4">
                    <div className="relative w-full max-w-md">
                        <input type="text" placeholder="Search by name or email..." className="w-full pl-10 pr-4 py-3 bg-[#f8f9fa] rounded-2xl outline-none text-sm border-transparent focus:border-blue-400 border-2 transition-all" />
                        <span className="absolute left-4 top-3.5 text-slate-300">🔍</span>
                    </div>
                    <div className="flex gap-2 bg-[#f8f9fa] p-1 rounded-2xl">
                        {["All", "Active", "Inactive"].map(t => (
                            <button key={t} onClick={() => setFilter(t)} className={`px-6 py-2 rounded-xl text-sm font-bold transition-all ${filter === t ? 'bg-[#4285f4] text-white shadow-md' : 'text-slate-400 hover:text-slate-600'}`}>{t}</button>
                        ))}
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-[#fcfcfd] text-[#c0c4cc] text-[10px] font-black uppercase tracking-widest">
                            <tr>
                                <th className="px-8 py-5">Member</th>
                                <th className="px-6 py-5">Seat</th>
                                <th className="px-6 py-5">Shift</th>
                                <th className="px-6 py-5">Status</th>
                                <th className="px-6 py-5">Seat Price</th>
                                <th className="px-6 py-5">Paid</th>
                                <th className="px-6 py-5">Pending</th>
                                <th className="px-8 py-5">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {users.filter(u => filter === "All" || u.status === filter).map((user) => (
                                <tr key={user._id} className="hover:bg-[#f8f9fa] transition-colors">
                                    <td className="px-8 py-5">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-full bg-red-50 text-red-500 flex items-center justify-center font-black text-sm">{user.name.charAt(0).toUpperCase()}</div>
                                            <div>
                                                <div className="font-bold text-[#1a1d23] text-sm">{user.name}</div>
                                                <div className="text-[11px] text-slate-400 font-medium">{user.email}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-5 font-black text-[#4285f4] text-sm">#{user.seatId?.seatNumber || '0'}</td>
                                    <td className="px-6 py-5 text-slate-600">{user.shiftId?.name || 'No Shift'}</td>
                                    <td className="px-6 py-5">
                                        <div className="flex items-center gap-3">

                                            {/* Status Badge */}
                                            <span className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-[10px] font-black
      ${user.status === "Active"
                                                    ? "bg-green-50 text-[#34a853]"
                                                    : "bg-red-50 text-[#eb5757]"}`}>

                                                <div className={`w-1.5 h-1.5 rounded-full 
        ${user.status === "Active" ? "bg-[#34a853]" : "bg-[#eb5757]"}`}>
                                                </div>

                                                {user.status}
                                            </span>

                                            {/* Toggle Switch */}
                                            <button
                                                onClick={() => toggleStatus(user)}
                                                className={`relative w-12 h-6 rounded-full transition-all duration-300
        ${user.status === "Active" ? "bg-[#34a853]" : "bg-gray-300"}`}
                                            >
                                                <div
                                                    className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow-md transition-all duration-300
          ${user.status === "Active" ? "translate-x-6" : ""}`}
                                                ></div>
                                            </button>

                                        </div>
                                    </td>
                                    <td className="px-6 py-5 font-black text-[#1a1d23]">₹{payments[user._id]?.seatPrice || 0}</td>
                                    <td className="px-6 py-5 font-black text-[#34a853]">₹{payments[user._id]?.totalPaid || 0}</td>
                                    <td className="px-6 py-5 font-black text-[#34a853]">₹{payments[user._id]?.pending || 0}</td>
                                    <td className="px-8 py-5">
                                        <button onClick={() => setSelectedUser(user)} className="bg-[#4285f4] text-white px-5 py-2.5 rounded-xl text-xs font-black shadow-lg shadow-blue-100 flex items-center gap-2 active:scale-95 transition-transform">+ Pay</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* EXACT PAYMENT MODAL UI */}
            {selectedUser && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-[35px] w-full max-w-[380px] overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
                        {/* Modal Header */}
                        <div className="bg-[#4285f4] p-8 text-white relative">
                            <p className="text-[10px] font-black tracking-[0.2em] uppercase opacity-70 mb-2">Payment Entry</p>
                            <h3 className="text-3xl font-black mb-1 leading-none lowercase">{selectedUser.name}</h3>
                            <p className="text-sm font-medium opacity-10">Seat {selectedUser.seatId?.seatNumber || '1'} • No shift</p>
                            <div className="absolute top-8 right-8 w-10 h-10 bg-white/20 rounded-xl"></div>
                        </div>

                        {/* Stats Row */}
                        <div className="flex border-b border-slate-50">
                            <div className="flex-1 p-5 text-center border-r border-slate-50">
                                <p className="text-[10px] uppercase font-black text-slate-300 mb-2 tracking-tighter">Seat Price</p>
                                <p className="text-xl font-black text-[#1a1d23]">₹{payments[selectedUser._id]?.seatPrice || 0}</p>
                            </div>
                            <div className="flex-1 p-5 text-center border-r border-slate-50">
                                <p className="text-[10px] uppercase font-black text-slate-300 mb-2 tracking-tighter">Paid</p>
                                <p className="text-xl font-black text-[#34a853]">₹{payments[selectedUser._id]?.totalPaid || 0}</p>
                            </div>
                            <div className="flex-1 p-5 text-center">
                                <p className="text-[10px] uppercase font-black text-slate-300 mb-2 tracking-tighter">Pending</p>
                                <p className="text-xl font-black text-[#eb5757]">₹{payments[selectedUser._id]?.pending || 0}</p>
                            </div>
                        </div>

                        {/* Input Area */}
                        <div className="p-8 pt-6">
                            <label className="block text-center text-slate-500 font-bold text-sm mb-4">Payment Amount</label>
                            <div className="relative mb-8">
                                <div className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 font-black text-xl">₹</div>
                                <input
                                    type="number"
                                    value={amount}
                                    onChange={(e) => setAmount(e.target.value)}
                                    className="w-full pl-12 pr-6 py-5 bg-[#f8f9fa] border-2 border-transparent focus:border-blue-400 focus:bg-white rounded-2xl outline-none text-2xl font-black transition-all"
                                    placeholder="0"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <button onClick={() => setSelectedUser(null)} className="py-1.5 rounded-xl font-black text-slate-400 border-2 border-slate-50 hover:bg-slate-50 transition">Cancel</button>
                                <button onClick={handlePayment} className={`py-1.5 rounded-xl font-black text-white shadow-xl transition active:scale-95 ${amount > 0 ? 'bg-[#4285f4] shadow-blue-600' : 'bg-slate-700'}`}>Record Payment</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

// import React, { useEffect, useState } from 'react';
// import axios from 'axios';

// // ─── Icon Components ──────────────────────────────────────────────────────────
// const Icon = ({ d, size = 16, color = "currentColor" }) => (
//   <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
//     stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
//     <path d={d} />
//   </svg>
// );

// const Icons = {
//   user: "M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z",
//   seat: "M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z",
//   clock: "M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zM12 6v6l4 2",
//   wallet: "M21 12V7H5a2 2 0 0 1 0-4h14v4M21 12a2 2 0 0 1 0 4H5a2 2 0 0 1 0-4",
//   check: "M20 6L9 17l-5-5",
//   x: "M18 6L6 18M6 6l12 12",
//   refresh: "M23 4v6h-6M1 20v-6h6M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15",
//   search: "M21 21l-6-6m2-5a7 7 0 1 1-14 0 7 7 0 0 1 14 0",
//   filter: "M22 3H2l8 9.46V19l4 2v-8.54L22 3z",
//   rupee: "M6 3h12M6 8h12m-7 5h7M6 21l7-13",
// };

// // ─── Stats Card ───────────────────────────────────────────────────────────────
// const StatCard = ({ label, value, sub, accent }) => (
//   <div style={{
//     background: '#fff',
//     borderRadius: 16,
//     padding: '20px 24px',
//     boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
//     borderLeft: `4px solid ${accent}`,
//     flex: 1,
//     minWidth: 140,
//   }}>
//     <div style={{ fontSize: 13, color: '#8a8fa8', fontWeight: 600, letterSpacing: '0.04em', textTransform: 'uppercase', marginBottom: 6 }}>{label}</div>
//     <div style={{ fontSize: 28, fontWeight: 800, color: '#1a1d2e', lineHeight: 1 }}>{value}</div>
//     {sub && <div style={{ fontSize: 12, color: accent, marginTop: 4, fontWeight: 500 }}>{sub}</div>}
//   </div>
// );

// // ─── Badge ────────────────────────────────────────────────────────────────────
// const Badge = ({ children, type }) => {
//   const styles = {
//     active: { bg: '#ecfdf5', color: '#059669', dot: '#10b981' },
//     inactive: { bg: '#f3f4f6', color: '#6b7280', dot: '#9ca3af' },
//     shift: { bg: '#eff6ff', color: '#2563eb', dot: '#3b82f6' },
//   };
//   const s = styles[type] || styles.shift;
//   return (
//     <span style={{
//       display: 'inline-flex', alignItems: 'center', gap: 5,
//       background: s.bg, color: s.color,
//       padding: '3px 10px', borderRadius: 20,
//       fontSize: 12, fontWeight: 600,
//     }}>
//       <span style={{ width: 6, height: 6, borderRadius: '50%', background: s.dot, flexShrink: 0 }} />
//       {children}
//     </span>
//   );
// };

// // ─── Payment Modal ────────────────────────────────────────────────────────────
// const PaymentModal = ({ user, payments, onClose, onSubmit }) => {
//   const [amount, setAmount] = useState('');
//   const pay = payments[user._id] || {};

//   return (
//     <div style={{
//       position: 'fixed', inset: 0, zIndex: 1000,
//       background: 'rgba(15,18,36,0.6)',
//       backdropFilter: 'blur(4px)',
//       display: 'flex', alignItems: 'center', justifyContent: 'center',
//       padding: 16,
//     }}>
//       <div style={{
//         background: '#fff', borderRadius: 20, width: '100%', maxWidth: 420,
//         boxShadow: '0 24px 64px rgba(0,0,0,0.2)',
//         overflow: 'hidden',
//         animation: 'slideUp 0.25s ease',
//       }}>
//         {/* Header */}
//         <div style={{ background: 'linear-gradient(135deg, #1e40af 0%, #3b82f6 100%)', padding: '24px 28px', color: '#fff' }}>
//           <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
//             <div>
//               <div style={{ fontSize: 12, opacity: 0.8, marginBottom: 4 }}>PAYMENT ENTRY</div>
//               <div style={{ fontSize: 20, fontWeight: 800 }}>{user.name}</div>
//               <div style={{ fontSize: 13, opacity: 0.75, marginTop: 2 }}>
//                 Seat {user.seatId?.seatNumber} · {user.shiftId?.name || 'No shift'}
//               </div>
//             </div>
//             <button onClick={onClose} style={{
//               background: 'rgba(255,255,255,0.15)', border: 'none',
//               borderRadius: 10, width: 36, height: 36, cursor: 'pointer',
//               display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff',
//             }}>
//               <Icon d={Icons.x} />
//             </button>
//           </div>
//         </div>

//         {/* Payment Summary */}
//         <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 1, background: '#f1f5f9' }}>
//           {[
//             { label: 'Seat Price', val: `₹${pay.seatPrice || 0}`, c: '#1a1d2e' },
//             { label: 'Paid', val: `₹${pay.totalPaid || 0}`, c: '#059669' },
//             { label: 'Pending', val: `₹${pay.pending || 0}`, c: '#dc2626' },
//           ].map(item => (
//             <div key={item.label} style={{ background: '#fff', padding: '16px', textAlign: 'center' }}>
//               <div style={{ fontSize: 12, color: '#8a8fa8', marginBottom: 4 }}>{item.label}</div>
//               <div style={{ fontSize: 20, fontWeight: 800, color: item.c }}>{item.val}</div>
//             </div>
//           ))}
//         </div>

//         {/* Input */}
//         <div style={{ padding: '24px 28px 28px' }}>
//           <label style={{ fontSize: 13, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 8 }}>
//             Payment Amount
//           </label>
//           <div style={{ position: 'relative' }}>
//             <span style={{
//               position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)',
//               fontSize: 16, fontWeight: 700, color: '#6b7280',
//             }}>₹</span>
//             <input
//               type="number"
//               placeholder="0"
//               value={amount}
//               onChange={e => setAmount(e.target.value)}
//               style={{
//                 width: '100%', padding: '12px 16px 12px 32px',
//                 border: '2px solid #e5e7eb', borderRadius: 12,
//                 fontSize: 18, fontWeight: 700, color: '#1a1d2e',
//                 outline: 'none', boxSizing: 'border-box',
//                 transition: 'border-color 0.2s',
//               }}
//               onFocus={e => e.target.style.borderColor = '#3b82f6'}
//               onBlur={e => e.target.style.borderColor = '#e5e7eb'}
//             />
//           </div>

//           <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
//             <button
//               onClick={onClose}
//               style={{
//                 flex: 1, padding: '12px', borderRadius: 12, border: '2px solid #e5e7eb',
//                 background: '#fff', color: '#6b7280', fontWeight: 700, fontSize: 14,
//                 cursor: 'pointer',
//               }}
//             >Cancel</button>
//             <button
//               onClick={() => { onSubmit(amount); setAmount(''); }}
//               disabled={!amount}
//               style={{
//                 flex: 2, padding: '12px', borderRadius: 12, border: 'none',
//                 background: amount ? 'linear-gradient(135deg, #059669, #10b981)' : '#e5e7eb',
//                 color: amount ? '#fff' : '#9ca3af', fontWeight: 700, fontSize: 14,
//                 cursor: amount ? 'pointer' : 'not-allowed',
//                 transition: 'all 0.2s',
//               }}
//             >Record Payment</button>
//           </div>
//         </div>
//       </div>
//       <style>{`@keyframes slideUp { from { transform: translateY(20px); opacity: 0 } to { transform: translateY(0); opacity: 1 } }`}</style>
//     </div>
//   );
// };

// // ─── Main Component ───────────────────────────────────────────────────────────
// export default function UserList() {
//   const [users, setUsers] = useState([]);
//   const [payments, setPayments] = useState({});
//   const [selectedUser, setSelectedUser] = useState(null);
//   const [search, setSearch] = useState('');
//   const [filter, setFilter] = useState('All');
//   const [loading, setLoading] = useState(true);

//   const fetchUsers = async () => {
//     try {
//       const res = await axios.get("http://localhost:7000/api/users/all");
//       setUsers(res.data.users);
//       await fetchPayments(res.data.users);
//     } catch (error) {
//       console.log(error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const fetchPayments = async (usersData) => {
//     let paymentData = {};
//     for (let user of usersData) {
//       try {
//         const res = await axios.get(`http://localhost:7000/api/payment/user-payment/${user._id}`);
//         paymentData[user._id] = res.data;
//       } catch {
//         paymentData[user._id] = { seatPrice: 0, totalPaid: 0, pending: 0 };
//       }
//     }
//     setPayments(paymentData);
//   };

//   const handlePayment = async (amount) => {
//     try {
//       await axios.post("http://localhost:7000/api/payment/pay", {
//         userId: selectedUser._id,
//         seatId: selectedUser.seatId._id,
//         shiftId: selectedUser.shiftId._id,
//         amount: Number(amount),
//       });
//       setSelectedUser(null);
//       fetchUsers();
//     } catch (error) {
//       console.log(error);
//     }
//   };

//   const toggleStatus = async (userId, currentStatus) => {
//     const newStatus = currentStatus === 'Active' ? 'Inactive' : 'Active';
//     try {
//       await axios.put(`http://localhost:7000/api/users/status/${userId}`, { status: newStatus });
//       fetchUsers();
//     } catch (error) {
//       console.error("Failed to update status");
//     }
//   };

//   useEffect(() => { fetchUsers(); }, []);

//   const filtered = users.filter(u => {
//     const matchSearch = u.name.toLowerCase().includes(search.toLowerCase()) ||
//       u.email.toLowerCase().includes(search.toLowerCase());
//     const matchFilter = filter === 'All' || u.status === filter;
//     return matchSearch && matchFilter;
//   });

//   // Stats
//   const totalPending = Object.values(payments).reduce((s, p) => s + (p.pending || 0), 0);
//   const totalCollected = Object.values(payments).reduce((s, p) => s + (p.totalPaid || 0), 0);
//   const activeCount = users.filter(u => u.status === 'Active').length;

//   return (
//     <div style={{ minHeight: '100vh', background: '#f8f9fc', fontFamily: "'DM Sans', 'Segoe UI', sans-serif" }}>
//       {/* Top Bar */}
//       <div style={{
//         background: '#fff', borderBottom: '1px solid #e9edf5',
//         padding: '0 32px', display: 'flex', alignItems: 'center',
//         height: 64, gap: 16, position: 'sticky', top: 0, zIndex: 100,
//       }}>
//         <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
//           <div style={{
//             width: 36, height: 36, borderRadius: 10,
//             background: 'linear-gradient(135deg, #1e40af, #3b82f6)',
//             display: 'flex', alignItems: 'center', justifyContent: 'center',
//           }}>
//             <Icon d={Icons.seat} size={18} color="#fff" />
//           </div>
//           <div>
//             <div style={{ fontSize: 15, fontWeight: 800, color: '#1a1d2e' }}>LibraryOS</div>
//             <div style={{ fontSize: 11, color: '#8a8fa8' }}>Seat Management</div>
//           </div>
//         </div>
//         <div style={{ flex: 1 }} />
//         <div style={{ fontSize: 13, color: '#8a8fa8' }}>{new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })}</div>
//       </div>

//       <div style={{ maxWidth: 1300, margin: '0 auto', padding: '28px 24px' }}>
//         {/* Page Title */}
//         <div style={{ marginBottom: 24 }}>
//           <h1 style={{ fontSize: 26, fontWeight: 800, color: '#1a1d2e', margin: 0 }}>Members</h1>
//           <p style={{ fontSize: 14, color: '#8a8fa8', marginTop: 4 }}>{users.length} registered members</p>
//         </div>

//         {/* Stats Row */}
//         <div style={{ display: 'flex', gap: 16, marginBottom: 24, flexWrap: 'wrap' }}>
//           <StatCard label="Total Members" value={users.length} sub={`${activeCount} active`} accent="#3b82f6" />
//           <StatCard label="Active" value={activeCount} sub="currently enrolled" accent="#10b981" />
//           <StatCard label="Revenue" value={`₹${totalCollected.toLocaleString()}`} sub="total collected" accent="#8b5cf6" />
//           <StatCard label="Pending" value={`₹${totalPending.toLocaleString()}`} sub="to be collected" accent="#f59e0b" />
//         </div>

//         {/* Table Card */}
//         <div style={{ background: '#fff', borderRadius: 20, boxShadow: '0 2px 16px rgba(0,0,0,0.06)', overflow: 'hidden' }}>
//           {/* Controls */}
//           <div style={{ padding: '18px 24px', borderBottom: '1px solid #f1f5f9', display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
//             {/* Search */}
//             <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
//               <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }}>
//                 <Icon d={Icons.search} size={15} />
//               </span>
//               <input
//                 value={search}
//                 onChange={e => setSearch(e.target.value)}
//                 placeholder="Search by name or email..."
//                 style={{
//                   width: '100%', paddingLeft: 36, paddingRight: 16, height: 38,
//                   border: '1.5px solid #e5e7eb', borderRadius: 10, fontSize: 13,
//                   color: '#1a1d2e', outline: 'none', boxSizing: 'border-box',
//                 }}
//               />
//             </div>
//             {/* Filter */}
//             {['All', 'Active', 'Inactive'].map(f => (
//               <button key={f} onClick={() => setFilter(f)} style={{
//                 padding: '7px 16px', borderRadius: 10, border: '1.5px solid',
//                 borderColor: filter === f ? '#3b82f6' : '#e5e7eb',
//                 background: filter === f ? '#eff6ff' : '#fff',
//                 color: filter === f ? '#2563eb' : '#6b7280',
//                 fontWeight: 600, fontSize: 13, cursor: 'pointer',
//               }}>{f}</button>
//             ))}
//             <button onClick={fetchUsers} style={{
//               marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 6,
//               padding: '7px 14px', borderRadius: 10, border: '1.5px solid #e5e7eb',
//               background: '#fff', color: '#6b7280', fontSize: 13, fontWeight: 600, cursor: 'pointer',
//             }}>
//               <Icon d={Icons.refresh} size={14} /> Refresh
//             </button>
//           </div>

//           {/* Table */}
//           <div style={{ overflowX: 'auto' }}>
//             <table style={{ width: '100%', borderCollapse: 'collapse' }}>
//               <thead>
//                 <tr style={{ background: '#f8f9fc' }}>
//                   {['Member', 'Seat', 'Shift', 'Status', 'Seat Price', 'Paid', 'Pending', 'Actions'].map(h => (
//                     <th key={h} style={{
//                       padding: '12px 20px', textAlign: 'left',
//                       fontSize: 11, fontWeight: 700, color: '#8a8fa8',
//                       letterSpacing: '0.06em', textTransform: 'uppercase',
//                       borderBottom: '1px solid #f1f5f9', whiteSpace: 'nowrap',
//                     }}>{h}</th>
//                   ))}
//                 </tr>
//               </thead>
//               <tbody>
//                 {loading ? (
//                   <tr><td colSpan={8} style={{ padding: 40, textAlign: 'center', color: '#8a8fa8' }}>
//                     <div style={{ fontSize: 14 }}>Loading members...</div>
//                   </td></tr>
//                 ) : filtered.length === 0 ? (
//                   <tr><td colSpan={8} style={{ padding: 48, textAlign: 'center', color: '#8a8fa8' }}>
//                     <div style={{ fontSize: 32, marginBottom: 8 }}>📭</div>
//                     <div style={{ fontWeight: 600 }}>No members found</div>
//                   </td></tr>
//                 ) : filtered.map((user, i) => {
//                   const pay = payments[user._id] || {};
//                   return (
//                     <tr key={user._id} style={{
//                       borderBottom: '1px solid #f8f9fc',
//                       transition: 'background 0.15s',
//                     }}
//                       onMouseEnter={e => e.currentTarget.style.background = '#fafbff'}
//                       onMouseLeave={e => e.currentTarget.style.background = '#fff'}
//                     >
//                       {/* Member */}
//                       <td style={{ padding: '14px 20px' }}>
//                         <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
//                           <div style={{
//                             width: 36, height: 36, borderRadius: '50%',
//                             background: `hsl(${(user.name.charCodeAt(0) * 37) % 360}, 60%, 92%)`,
//                             display: 'flex', alignItems: 'center', justifyContent: 'center',
//                             fontSize: 14, fontWeight: 700,
//                             color: `hsl(${(user.name.charCodeAt(0) * 37) % 360}, 50%, 35%)`,
//                             flexShrink: 0,
//                           }}>
//                             {user.name.charAt(0).toUpperCase()}
//                           </div>
//                           <div>
//                             <div style={{ fontWeight: 700, color: '#1a1d2e', fontSize: 14 }}>{user.name}</div>
//                             <div style={{ fontSize: 12, color: '#9ca3af' }}>{user.email}</div>
//                           </div>
//                         </div>
//                       </td>

//                       {/* Seat */}
//                       <td style={{ padding: '14px 20px' }}>
//                         <span style={{
//                           background: '#eff6ff', color: '#1e40af',
//                           padding: '4px 10px', borderRadius: 8,
//                           fontSize: 13, fontWeight: 700,
//                         }}>
//                           #{user.seatId?.seatNumber || 'N/A'}
//                         </span>
//                       </td>

//                       {/* Shift — FIXED: shiftId is now populated */}
//                       <td style={{ padding: '14px 20px' }}>
//                         {user.shiftId?.name
//                           ? <Badge type="shift">{user.shiftId.name}</Badge>
//                           : <span style={{ color: '#d1d5db', fontSize: 13 }}>—</span>
//                         }
//                       </td>

//                       {/* Status */}
//                       <td style={{ padding: '14px 20px' }}>
//                         <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
//                           <Badge type={user.status === 'Active' ? 'active' : 'inactive'}>{user.status}</Badge>
//                           <button
//                             onClick={() => toggleStatus(user._id, user.status)}
//                             style={{
//                               padding: '3px 10px', borderRadius: 8, border: 'none',
//                               background: user.status === 'Active' ? '#fff7ed' : '#eff6ff',
//                               color: user.status === 'Active' ? '#c2410c' : '#1d4ed8',
//                               fontSize: 11, fontWeight: 700, cursor: 'pointer',
//                             }}
//                           >
//                             {user.status === 'Active' ? 'Deactivate' : 'Activate'}
//                           </button>
//                         </div>
//                       </td>

//                       {/* Financials */}
//                       <td style={{ padding: '14px 20px', fontWeight: 700, color: '#1a1d2e', fontSize: 14 }}>
//                         ₹{(pay.seatPrice || 0).toLocaleString()}
//                       </td>
//                       <td style={{ padding: '14px 20px', fontWeight: 700, color: '#059669', fontSize: 14 }}>
//                         ₹{(pay.totalPaid || 0).toLocaleString()}
//                       </td>
//                       <td style={{ padding: '14px 20px' }}>
//                         <span style={{
//                           fontWeight: 700, fontSize: 14,
//                           color: (pay.pending || 0) > 0 ? '#dc2626' : '#059669',
//                         }}>
//                           ₹{(pay.pending || 0).toLocaleString()}
//                         </span>
//                       </td>

//                       {/* Actions */}
//                       <td style={{ padding: '14px 20px' }}>
//                         <button
//                           onClick={() => setSelectedUser(user)}
//                           style={{
//                             display: 'flex', alignItems: 'center', gap: 6,
//                             padding: '7px 14px', borderRadius: 10, border: 'none',
//                             background: 'linear-gradient(135deg, #1e40af, #3b82f6)',
//                             color: '#fff', fontSize: 12, fontWeight: 700, cursor: 'pointer',
//                             whiteSpace: 'nowrap',
//                           }}
//                         >
//                           + Pay
//                         </button>
//                       </td>
//                     </tr>
//                   );
//                 })}
//               </tbody>
//             </table>
//           </div>

//           {/* Footer */}
//           <div style={{ padding: '14px 24px', borderTop: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
//             <span style={{ fontSize: 13, color: '#8a8fa8' }}>
//               Showing {filtered.length} of {users.length} members
//             </span>
//           </div>
//         </div>
//       </div>

//       {selectedUser && (
//         <PaymentModal
//           user={selectedUser}
//           payments={payments}
//           onClose={() => setSelectedUser(null)}
//           onSubmit={handlePayment}
//         />
//       )}
//     </div>
//   );
// }