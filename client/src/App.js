// client/src/App.js
import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import CustomerDashboard from "./pages/customer/CustomerDashboard";
import AgentDashboard from "./pages/agent/AgentDashboard";
import AdminDashboard from "./pages/admin/AdminDashboard";
import ProtectedRoute from "./components/common/ProtectedRoute";
import useAuth from "./hooks/useAuth";

function App() {
  const { user, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>; // Or a spinner component
  }

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Customer Routes */}
      <Route
        path="/customer/*"
        element={
          <ProtectedRoute roles={["Customer"]}>
            <CustomerDashboard />
          </ProtectedRoute>
        }
      />

      {/* Delivery Agent Routes */}
      <Route
        path="/agent/*"
        element={
          <ProtectedRoute roles={["Delivery Agent"]}>
            <AgentDashboard />
          </ProtectedRoute>
        }
      />

      {/* Admin Routes */}
      <Route
        path="/admin/*"
        element={
          <ProtectedRoute roles={["Admin"]}>
            <AdminDashboard />
          </ProtectedRoute>
        }
      />

      {/* Redirect root path based on role */}
      <Route
        path="/"
        element={
          !user ? (
            <Navigate to="/login" />
          ) : user.role === "Admin" ? (
            <Navigate to="/admin" />
          ) : user.role === "Delivery Agent" ? (
            <Navigate to="/agent" />
          ) : (
            <Navigate to="/customer" />
          )
        }
      />
    </Routes>
  );
}

export default App;
