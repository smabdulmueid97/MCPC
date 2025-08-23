// client/src/pages/agent/AgentDashboard.js

import React, { useState, useEffect } from "react";
import api from "../../services/api";
import useAuth from "../../hooks/useAuth";
import { useJsApiLoader } from "@react-google-maps/api";
import MapComponent from "../../components/common/MapComponent";

const mapContainerStyle = {
  width: "100%",
  height: "192px",
  marginTop: "1rem",
};

const AgentDashboard = () => {
  const [parcels, setParcels] = useState([]);
  const { logout } = useAuth();

  const { isLoaded } = useJsApiLoader({
    id: "google-map-script-agent",
    googleMapsApiKey: process.env.REACT_APP_Maps_API_KEY,
    libraries: ["geocoding"],
  });

  useEffect(() => {
    const fetchAssignedParcels = async () => {
      try {
        const { data } = await api.get("/agent/parcels");
        setParcels(data);
      } catch (error) {
        console.error("Failed to fetch assigned parcels", error);
      }
    };
    fetchAssignedParcels();
  }, []);

  const handleStatusUpdate = async (parcelId, status) => {
    const location = "Updated Location";
    try {
      await api.put(`/agent/parcels/${parcelId}/status`, { status, location });
      setParcels((prev) =>
        prev.map((p) => (p._id === parcelId ? { ...p, status } : p))
      );
    } catch (error) {
      console.error("Failed to update status", error);
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">
            Delivery Agent Dashboard
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
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-800">
            My Assigned Parcels
          </h2>
          <p className="text-gray-600"></p>
        </div>
        {parcels.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {parcels.map((p) => (
              <div
                key={p._id}
                className="bg-white p-5 rounded-lg shadow flex flex-col justify-between"
              >
                <div>
                  <div className="mb-4">
                    <p className="font-mono text-sm text-gray-500">{p._id}</p>
                    <p className="text-gray-700 mt-2">
                      <span className="font-bold">From:</span> {p.pickupAddress}
                    </p>
                    <p className="text-gray-700">
                      <span className="font-bold">To:</span> {p.deliveryAddress}
                    </p>
                    <p className="text-gray-700">
                      <span className="font-bold">Payment:</span>{" "}
                      {p.paymentType}{" "}
                      {p.paymentType === "COD" ? `($${p.codAmount})` : ""}
                    </p>
                    <p className="mt-2 text-lg">
                      <span className="font-bold">Status:</span>{" "}
                      <strong className="text-indigo-600">{p.status}</strong>
                    </p>
                  </div>
                  <div>
                    <select
                      onChange={(e) =>
                        handleStatusUpdate(p._id, e.target.value)
                      }
                      className="w-full px-3 py-2 border bg-white border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      disabled={
                        p.status === "Delivered" || p.status === "Failed"
                      }
                    >
                      <option value="">-- Update Status --</option>
                      <option value="Picked Up">Picked Up</option>
                      <option value="In Transit">In Transit</option>
                      <option value="Delivered">Delivered</option>
                      <option value="Failed">Failed</option>
                    </select>
                  </div>
                </div>

                <div style={mapContainerStyle}>
                  <MapComponent isLoaded={isLoaded} parcel={p} />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center text-gray-500 mt-8">
            No parcels assigned yet.
          </p>
        )}
      </main>
    </div>
  );
};

export default AgentDashboard;
