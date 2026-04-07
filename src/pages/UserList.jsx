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
            const res = await axios.get(`${API_URL}/api/users/all`);

            console.log("FULL RESPONSE:", res.data);

            const userData = res.data.users || []; // ✅ FIX
            setUsers(userData);

            const paymentData = {};

            await Promise.all(
                userData.map(async (user) => {
                    try {
                        const pRes = await axios.get(`${API_URL}/api/payment/user-payment/${user._id}`);
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
            await axios.post(`${API_URL}/api/payment/pay`, {
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

 await axios.put(`${API_URL}/api/users/status/${user._id}`, { status: newStatus });

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

