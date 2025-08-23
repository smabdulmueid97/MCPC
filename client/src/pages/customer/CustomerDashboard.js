// client/src/pages/customer/CustomerDashboard.js

import React, { useState, useEffect } from "react";
import api from "../../services/api";
import useAuth from "../../hooks/useAuth";
import io from "socket.io-client";
import { useJsApiLoader } from "@react-google-maps/api";
import MapComponent from "../../components/common/MapComponent";

const mapContainerStyle = {
  width: "100%",
  height: "192px",
};

const CustomerDashboard = () => {
  const [parcels, setParcels] = useState([]);
  const [form, setForm] = useState({
    pickupAddress: "",
    deliveryAddress: "",
    parcelDetails: { type: "Document", size: "Small" },
    paymentType: "Prepaid",
    codAmount: 0,
  });
  const { logout } = useAuth();

  const { isLoaded } = useJsApiLoader({
    id: "google-map-script-customer",
    googleMapsApiKey: process.env.REACT_APP_Maps_API_KEY,
    libraries: ["geocoding"],
  });

  useEffect(() => {
    fetchHistory();
    const socket = io("http://localhost:5001");
    socket.on("status_update", (data) => {
      setParcels((prev) =>
        prev.map((p) =>
          p._id === data.parcelId
            ? {
                ...p,
                status: data.status,
                trackingHistory: [
                  ...p.trackingHistory,
                  {
                    status: data.status,
                    location: data.location,
                    timestamp: new Date(),
                  },
                ],
              }
            : p
        )
      );
    });
    return () => socket.disconnect();
  }, []);

  const fetchHistory = async () => {
    try {
      const { data } = await api.get("/parcels/history");
      setParcels(data);
    } catch (error) {
      console.error("Failed to fetch history", error);
    }
  };

  const handleBooking = async (e) => {
    e.preventDefault();
    try {
      await api.post("/parcels", form);
      setForm({
        pickupAddress: "",
        deliveryAddress: "",
        parcelDetails: { type: "Document", size: "Small" },
        paymentType: "Prepaid",
        codAmount: 0,
      });
      fetchHistory();
    } catch (error) {
      console.error("Booking failed", error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "type" || name === "size") {
      setForm((prev) => ({
        ...prev,
        parcelDetails: { ...prev.parcelDetails, [name]: value },
      }));
    } else if (name === "codAmount") {
      setForm((prev) => ({ ...prev, [name]: parseFloat(value) || 0 }));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">
            Customer Dashboard
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
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Booking Form */}
          <div className="lg:col-span-1">
            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-xl font-semibold mb-4 text-gray-800">
                Book a New Parcel
              </h2>
              <form onSubmit={handleBooking} className="space-y-4">
                <input
                  name="pickupAddress"
                  value={form.pickupAddress}
                  onChange={handleChange}
                  placeholder="Pickup Address"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
                <input
                  name="deliveryAddress"
                  value={form.deliveryAddress}
                  onChange={handleChange}
                  placeholder="Delivery Address"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
                <input
                  name="type"
                  value={form.parcelDetails.type}
                  onChange={handleChange}
                  placeholder="Parcel Type (e.g., Electronics)"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
                <select
                  name="size"
                  value={form.parcelDetails.size}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white"
                >
                  <option value="Small">Small</option>
                  <option value="Medium">Medium</option>
                  <option value="Large">Large</option>
                </select>
                <select
                  name="paymentType"
                  value={form.paymentType}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white"
                >
                  <option value="Prepaid">Prepaid</option>
                  <option value="COD">COD</option>
                </select>
                {form.paymentType === "COD" && (
                  <input
                    type="number"
                    name="codAmount"
                    value={form.codAmount}
                    onChange={handleChange}
                    placeholder="COD Amount"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                )}
                <button
                  type="submit"
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-md transition duration-200"
                >
                  Book Now
                </button>
              </form>
            </div>
          </div>

          {/* Booking History */}
          <div className="lg:col-span-2">
            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-xl font-semibold mb-4 text-gray-800">
                My Booking History
              </h2>
              <div className="space-y-4 max-h-[70vh] overflow-y-auto">
                {parcels.length > 0 ? (
                  parcels.map((p) => (
                    <div
                      key={p._id}
                      className="p-4 border rounded-md bg-gray-50"
                    >
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="font-mono text-sm text-gray-600">
                            ID: {p._id}
                          </p>
                          <p className="text-lg font-bold text-gray-900">
                            Status:{" "}
                            <span className="text-indigo-600">{p.status}</span>
                          </p>
                        </div>
                        <p className="text-sm text-gray-700">
                          Agent: {p.deliveryAgent?.name || "Unassigned"}
                        </p>
                      </div>
                      <div className="mt-4 border-t pt-2">
                        <h4 className="font-semibold text-sm mb-2">
                          Tracking History:
                        </h4>
                        <ul className="list-disc list-inside space-y-1 text-sm">
                          {p.trackingHistory.map((t, i) => (
                            <li key={i}>
                              <span className="font-semibold">{t.status}</span>{" "}
                              at {t.location || "N/A"} on{" "}
                              {new Date(t.timestamp).toLocaleString()}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div className="mt-4 border-t pt-4">
                        <h4 className="font-semibold text-sm mb-2">
                          Route Overview
                        </h4>
                        <div style={mapContainerStyle}>
                          <MapComponent isLoaded={isLoaded} parcel={p} />
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <p>No bookings yet.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default CustomerDashboard;
