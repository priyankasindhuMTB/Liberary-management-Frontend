


import React, { useState } from "react";
import axios from "axios";

const AdminRequest = () => {
  const API_URL = import.meta.env.VITE_API_URL;

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    libraryName: ""
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    console.log("🚀 Sending Request:", form);

    try {
      setLoading(true);
      setMessage({ text: "", type: "" });

      const res = await axios.post(
        `${API_URL}/api/admin-request/request`,
        form
      );

      console.log("✅ Response:", res.data);

      setMessage({ text: "Request sent successfully", type: "success" });

      // reset form
      setForm({
        name: "",
        email: "",
        password: "",
        libraryName: ""
      });

    } catch (err) {
      console.error("❌ Error:", err.response?.data || err.message);

      setMessage({
        text: err.response?.data?.message || "Error sending request",
        type: "error"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center h-screen">
      <form onSubmit={handleSubmit} className="bg-white p-6 shadow rounded w-80">
        <h2 className="text-xl font-bold mb-4">Request for Library Admin</h2>

        {message.text && (
          <p className={`mb-3 text-sm ${message.type === "error" ? "text-red-500" : "text-green-600"}`}>
            {message.text}
          </p>
        )}

        <input name="name" value={form.name} onChange={handleChange} placeholder="Name" className="input"/>
        <input name="email" value={form.email} onChange={handleChange} placeholder="Email" className="input"/>
        <input name="password" value={form.password} onChange={handleChange} type="password" placeholder="Password" className="input"/>
        <input name="libraryName" value={form.libraryName} onChange={handleChange} placeholder="Library Name" className="input"/>

        <button disabled={loading} className="bg-green-500 text-white px-4 py-2 w-full mt-2">
          {loading ? "Sending..." : "Send Request"}
        </button>
      </form>
    </div>
  );
};

export default AdminRequest;