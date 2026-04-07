import React, { useEffect, useState } from "react";
import axios from "axios";

const SuperAdmin = () => {
  const [requests, setRequests] = useState([]);
  const API_URL = import.meta.env.VITE_API_URL;
  const token = localStorage.getItem("token");

  const fetchRequests = async () => {
    const res = await axios.get(`${API_URL}/api/admin-request`, {
      headers: { Authorization: token }
    });
    setRequests(res.data);
  };

  const approve = async (id) => {
    await axios.put(`${API_URL}/api/admin-request/approve/${id}`, {}, {
      headers: { Authorization: token }
    });
    fetchRequests();
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Pending Requests</h1>

      {requests.map(r => (
        <div key={r._id} className="border p-3 mb-2 flex justify-between">
          <div>
            <p>{r.name}</p>
            <p>{r.email}</p>
            <p>{r.libraryName}</p>
          </div>

          <button
            onClick={() => approve(r._id)}
            className="bg-blue-500 text-white px-4 py-2"
          >
            Approve
          </button>
        </div>
      ))}
    </div>
  );
};

export default SuperAdmin;