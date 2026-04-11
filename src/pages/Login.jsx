// import React, { useState } from "react";
// import axios from "axios";
// import { useNavigate } from "react-router-dom";

// const Login = () => {
//   const [form, setForm] = useState({ email: "", password: "" });
//   const navigate = useNavigate();
//   const API_URL = import.meta.env.VITE_API_URL;
//   console.log("Api url",API_URL)

//     const handleChange = (e) => {
//       const { name, value } = e.target;
//       setForm({ ...form, [name]: value });
//     };

//   const handleLogin = async (e) => {
//     e.preventDefault();

//     try {
//       const res = await axios.post(`${API_URL}/api/admin/login`, form);

//       localStorage.setItem("token", res.data.token);
//       localStorage.setItem("admin", JSON.stringify(res.data.admin));

//       if (res.data.admin.role === "superadmin") {
//         navigate("/super-admin");
//       } else {
//         navigate("/dashboard");
//       }

//     } catch (err) {
//       alert("Login failed");
//     }
//   };

//   return (
//     <div className="flex justify-center items-center h-screen">
//       <form onSubmit={handleLogin} className="bg-white p-2 rounded shadow">
//         <h2 className="text-xl font-bold mb-4">Admin Login</h2>

//         <input
//           type="email"
//           name="email"
//           value={form.email}
//           placeholder="Email"
//           className="block mb-3 p-2 border w-full"
//           onChange={handleChange}
//         />

//         <input
//         name="password"
//           type="password"
//           value={form.password}
//           placeholder="Password"
//           className="block mb-3 p-2 border w-full"
//           onChange={handleChange}
//         />

//         <button className="bg-blue-500 text-white px-4 py-2 w-full">
//           Login
//         </button>
//       </form>
//     </div>
//   );
// };

// export default Login;

import React, { useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";

const USE_SUPER_ADMIN_LOGIN_MSG =
  "Super admins must use the Super Admin login page (separate from library admin).";

const Login = () => {
  const API_URL = import.meta.env.VITE_API_URL;
  const navigate = useNavigate();

  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [errorCode, setErrorCode] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleLogin = async (e) => {
    e.preventDefault();

    console.log("🔐 Login Data:", form);

    try {
      setLoading(true);
      setError("");
      setErrorCode("");

      if (!API_URL) {
        setError("Missing VITE_API_URL — set it in frontend/.env (e.g. VITE_API_URL=http://localhost:5001)");
        return;
      }

      const res = await axios.post(`${API_URL}/api/admin/login`, form);

      console.log("✅ Login Success:", res.data);

      const role = res.data?.admin?.role;
      if (role === "super_admin") {
        setError(USE_SUPER_ADMIN_LOGIN_MSG);
        return;
      }

      localStorage.setItem("token", res.data.token);
      localStorage.setItem("admin", JSON.stringify(res.data.admin));
      navigate("/dashboard");

    } catch (err) {
      console.error("❌ Login Error:", err.response?.data || err.message);

      const data = err.response?.data;
      setError(data?.message || "Login failed");
      setErrorCode(data?.code || "");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center h-screen">
      <form onSubmit={handleLogin} className="bg-white p-4 rounded shadow w-80">
        <h2 className="text-xl font-bold mb-1">Library Admin Login</h2>
        <p className="text-xs text-slate-500 mb-4">Daily library work — members, seats, shifts.</p>

        {error && (
          <div className="text-sm mb-3 space-y-2">
            <p className="text-red-600">{error}</p>
            {error === USE_SUPER_ADMIN_LOGIN_MSG && (
              <p>
                <Link to="/super-admin/login" className="text-blue-600 underline font-medium">
                  Open Super Admin login
                </Link>
              </p>
            )}
            {errorCode === "PENDING_APPROVAL" && (
              <p className="text-slate-600">
                Ask your super admin to open <strong>/super-admin</strong> and approve your library request.
              </p>
            )}
            {(errorCode === "NO_ADMIN" || errorCode === "PENDING_APPROVAL") && (
              <p>
                <Link to="/request" className="text-blue-600 underline font-medium">
                  Submit a library admin request
                </Link>
              </p>
            )}
          </div>
        )}

        <input name="email" value={form.email} onChange={handleChange} placeholder="Email" className="input"/>
        <input name="password" value={form.password} onChange={handleChange} type="password" placeholder="Password" className="input"/>

        <button disabled={loading} className="bg-blue-500 text-white px-4 py-2 w-full mt-2">
          {loading ? "Logging in..." : "Login"}
        </button>

        <p className="text-center text-xs text-slate-500 mt-4">
          <Link to="/super-admin/login" className="text-blue-600 underline font-medium">
            Super Admin login
          </Link>
          {" · "}
          <Link to="/setup-super" className="text-blue-600 underline">
            First-time super admin setup
          </Link>
          {" · "}
          <Link to="/request" className="text-blue-600 underline">
            Request library access
          </Link>
        </p>
      </form>
    </div>
  );
};

export default Login;