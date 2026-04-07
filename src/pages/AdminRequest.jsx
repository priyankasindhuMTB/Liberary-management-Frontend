import React, { useState } from "react";
import axios from "axios";

const AdminRequest = () => {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    libraryName: ""
  });

  const API_URL = import.meta.env.VITE_API_URL;


      const handleChange = (e) => {
      const { name, value } = e.target;
      setForm({ ...form, [name]: value });
    };


  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await axios.post(`${API_URL}/api/admin-request/request`, form);
      alert("Request sent successfully");
    } catch (err) {
      alert("Error sending request");
    }
  };

  return (
    <div className="flex justify-center items-center h-screen">
      <form onSubmit={handleSubmit} className="bg-white p-6 shadow rounded">
        <h2 className="text-xl font-bold mb-4">Request for Library Admin</h2>

        <input placeholder="Name" name="name" value={form.name} onChange={handleChange} className="block mb-2 p-2 border w-full"/>
        <input placeholder="Email" name="email" value={form.email} onChange={handleChange} className="block mb-2 p-2 border w-full"/>
        <input type="password" name="password" value={form.password} placeholder="Password" onChange={handleChange} className="block mb-2 p-2 border w-full"/>
        <input placeholder="Library Name" name="libraryName" value={form.libraryName} onChange={handleChange} className="block mb-2 p-2 border w-full"/>

        <button className="bg-green-500 text-white px-4 py-2 w-full">
          Send Request
        </button>
      </form>
    </div>
  );
};

export default AdminRequest;