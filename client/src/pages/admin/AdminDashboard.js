// client/src/pages/admin/AdminDashboard.js

import React, { useState, useEffect } from "react";
import api from "../../services/api";
import useAuth from "../../hooks/useAuth";
import io from "socket.io-client";
import { useJsApiLoader } from "@react-google-maps/api";
import MapComponent from "../../components/common/MapComponent";

const modalMapContainerStyle = {
  width: "100%",
  height: "50vh",
};

const AdminDashboard = () => {
  const [metrics, setMetrics] = useState({});
  const [parcels, setParcels] = useState([]);
  const [agents, setAgents] = useState([]);
  const { logout } = useAuth();
  const [selectedParcel, setSelectedParcel] = useState(null);

  const { isLoaded } = useJsApiLoader({
    id: "google-map-script-admin",
    googleMapsApiKey: process.env.REACT_APP_Maps_API_KEY,
    libraries: ["geocoding"],
  });

  useEffect(() => {
    const fetchData = async () => {
      api.get("/admin/dashboard").then((res) => setMetrics(res.data));
      api.get("/admin/parcels").then((res) => setParcels(res.data));
      api
        .get("/admin/users")
        .then((res) =>
          setAgents(res.data.filter((u) => u.role === "Delivery Agent"))
        );
    };
    fetchData();

    const socket = io("http://localhost:5001");
    socket.on("new_booking", (newParcel) => {
      setParcels((prev) => [newParcel, ...prev]);
      api.get("/admin/dashboard").then((res) => setMetrics(res.data));
    });

    return () => socket.disconnect();
  }, []);

  const handleAssignAgent = async (parcelId, agentId) => {
    if (!agentId) return;
    try {
      await api.put(`/admin/parcels/${parcelId}/assign`, { agentId });
      api.get("/admin/parcels").then((res) => setParcels(res.data));
    } catch (error) {
      console.error("Failed to assign agent", error);
    }
  };

  const handleExport = async (format) => {
    try {
      const response = await api.get(`/admin/reports/${format}`, {
        responseType: "blob",
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `parcels-report.${format}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error(`Failed to export ${format} report`, error);
    }
  };

  return (
    <>
      <div className="bg-gray-100 min-h-screen">
        <header className="bg-white shadow-sm">
          <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900">
              Admin Dashboard
            </h1>
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
                {/* <button
                  onClick={() => handleExport("pdf")}
                  className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-md text-sm transition duration-200"
                >
                  Export PDF
                </button> */}
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
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Route
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
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <button
                          onClick={() => setSelectedParcel(p)}
                          className="text-indigo-600 hover:text-indigo-900 font-semibold"
                        >
                          View Map
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>

      {/* Map Modal */}
      {selectedParcel && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
          <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-3xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold">
                Route for Parcel{" "}
                <span className="font-mono text-gray-600">
                  #{selectedParcel._id}
                </span>
              </h3>
              <button
                onClick={() => setSelectedParcel(null)}
                className="text-gray-500 hover:text-gray-800 text-2xl font-bold"
              >
                &times;
              </button>
            </div>
            <MapComponent
              isLoaded={isLoaded}
              parcel={selectedParcel}
              containerStyle={modalMapContainerStyle}
            />
          </div>
        </div>
      )}
    </>
  );
};

export default AdminDashboard;
