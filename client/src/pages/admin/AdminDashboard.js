// client/src/pages/admin/AdminDashboard.js
import React, { useState, useEffect } from "react";
import api from "../../services/api";
import useAuth from "../../hooks/useAuth";
import io from "socket.io-client";

const AdminDashboard = () => {
  const [metrics, setMetrics] = useState({}); // [cite: 171]
  const [parcels, setParcels] = useState([]); // [cite: 171]
  const [agents, setAgents] = useState([]); // [cite: 172]
  const { logout } = useAuth(); // [cite: 172]

  useEffect(() => {
    const fetchData = async () => {
      api.get("/admin/dashboard").then((res) => setMetrics(res.data)); // [cite: 174]
      api.get("/admin/parcels").then((res) => setParcels(res.data)); // [cite: 175]
      api
        .get("/admin/users")
        .then((res) =>
          setAgents(res.data.filter((u) => u.role === "Delivery Agent"))
        ); // [cite: 175]
    };
    fetchData();

    const socket = io("http://localhost:5001"); // [cite: 173]
    socket.on("new_booking", (newParcel) => {
      setParcels((prev) => [newParcel, ...prev]);
      api.get("/admin/dashboard").then((res) => setMetrics(res.data)); // Refresh metrics
    });

    return () => socket.disconnect(); // [cite: 174]
  }, []);

  const handleAssignAgent = async (parcelId, agentId) => {
    if (!agentId) return; // [cite: 176]
    try {
      await api.put(`/admin/parcels/${parcelId}/assign`, { agentId }); // [cite: 177]
      api.get("/admin/parcels").then((res) => setParcels(res.data)); // Refresh parcel list
    } catch (error) {
      console.error("Failed to assign agent", error); // [cite: 178]
    }
  };

  const handleExport = async (format) => {
    try {
      const response = await api.get(`/admin/reports/${format}`, {
        responseType: "blob",
      }); // [cite: 179]
      const url = window.URL.createObjectURL(new Blob([response.data])); // [cite: 180]
      const link = document.createElement("a"); // [cite: 180]
      link.href = url;
      link.setAttribute("download", `parcels-report.${format}`); // [cite: 180]
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error(`Failed to export ${format} report`, error); // [cite: 181]
    }
  };

  return (
    <div className="bg-gray-100 min-h-screen">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
          <button
            onClick={logout}
            className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded-md transition duration-200"
          >
            Logout
          </button>
        </div>
      </header>
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {/* Metrics */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4 text-gray-800">
            Dashboard Metrics
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-lg shadow text-center">
              <p className="text-3xl font-bold text-blue-600">
                {metrics.dailyBookings ?? "0"}
              </p>
              <p className="text-gray-600">Daily Bookings</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow text-center">
              <p className="text-3xl font-bold text-red-600">
                {metrics.failedDeliveries ?? "0"}
              </p>
              <p className="text-gray-600">Failed Deliveries</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow text-center">
              <p className="text-3xl font-bold text-green-600">
                ${metrics.totalCodAmount?.toFixed(2) ?? "0.00"}
              </p>
              <p className="text-gray-600">Total COD Received</p>
            </div>
          </div>
        </div>

        {/* All Parcels Table */}
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-800">
              Manage All Parcels
            </h2>
            <div className="space-x-2">
              <button
                onClick={() => handleExport("csv")}
                className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-md text-sm transition duration-200"
              >
                Export CSV
              </button>
              <button
                onClick={() => handleExport("pdf")}
                className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-md text-sm transition duration-200"
              >
                Export PDF
              </button>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Parcel ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Assigned Agent
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Assign Agent
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {parcels.map((p) => (
                  <tr key={p._id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-500">
                      {p._id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {p.customer?.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                        {p.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {p.deliveryAgent?.name || "Unassigned"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <select
                        onChange={(e) =>
                          handleAssignAgent(p._id, e.target.value)
                        }
                        disabled={!!p.deliveryAgent}
                        className="w-full p-2 border bg-white border-gray-300 rounded-md disabled:bg-gray-200 disabled:cursor-not-allowed"
                      >
                        <option value="">Select Agent</option>
                        {agents.map((a) => (
                          <option key={a._id} value={a._id}>
                            {a.name}
                          </option>
                        ))}
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;
