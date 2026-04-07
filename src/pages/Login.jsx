import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const [form, setForm] = useState({ email: "", password: "" });
  const navigate = useNavigate();
  const API_URL = import.meta.env.VITE_API_URL;
  console.log("Api url",API_URL)

    const handleChange = (e) => {
      const { name, value } = e.target;
      setForm({ ...form, [name]: value });
    };

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const res = await axios.post(`${API_URL}/api/admin/login`, form);

      localStorage.setItem("token", res.data.token);
      localStorage.setItem("admin", JSON.stringify(res.data.admin));

      if (res.data.admin.role === "superadmin") {
        navigate("/super-admin");
      } else {
        navigate("/dashboard");
      }

    } catch (err) {
      alert("Login failed");
    }
  };

  return (
    <div className="flex justify-center items-center h-screen">
      <form onSubmit={handleLogin} className="bg-white p-2 rounded shadow">
        <h2 className="text-xl font-bold mb-4">Admin Login</h2>

        <input
          type="email"
          name="email"
          value={form.email}
          placeholder="Email"
          className="block mb-3 p-2 border w-full"
          onChange={handleChange}
        />

        <input
        name="password"
          type="password"
          value={form.password}
          placeholder="Password"
          className="block mb-3 p-2 border w-full"
          onChange={handleChange}
        />

        <button className="bg-blue-500 text-white px-4 py-2 w-full">
          Login
        </button>
      </form>
    </div>
  );
};

export default Login;