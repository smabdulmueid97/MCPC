// client/src/pages/auth/Register.js
import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../../services/api";

const Register = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "Customer", // Default role [cite: 192]
  });
  const [error, setError] = useState(""); // [cite: 193]
  const navigate = useNavigate(); // [cite: 193]

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value }); // [cite: 193]
  };

  const handleSubmit = async (e) => {
    e.preventDefault(); // [cite: 194]
    setError("");
    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }
    try {
      await api.post("/auth/register", formData); // [cite: 195]
      navigate("/login"); // [cite: 196]
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed"); // [cite: 197]
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col justify-center items-center">
      <div className="w-full max-w-md bg-white rounded-lg shadow-md p-8">
        <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">
          Create a New Account
        </h2>
        {error && (
          <p className="bg-red-100 text-red-700 p-3 rounded-md mb-4 text-center">
            {error}
          </p>
        )}
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label
              className="block text-gray-700 text-sm font-bold mb-2"
              htmlFor="name"
            >
              Full Name
            </label>
            <input
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700"
              type="text"
              name="name"
              placeholder="John Doe"
              onChange={handleChange}
              required
            />
          </div>
          <div className="mb-4">
            <label
              className="block text-gray-700 text-sm font-bold mb-2"
              htmlFor="email"
            >
              Email Address
            </label>
            <input
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700"
              type="email"
              name="email"
              placeholder="you@example.com"
              onChange={handleChange}
              required
            />
          </div>
          <div className="mb-4">
            <label
              className="block text-gray-700 text-sm font-bold mb-2"
              htmlFor="password"
            >
              Password
            </label>
            <input
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700"
              type="password"
              name="password"
              placeholder="••••••••••"
              onChange={handleChange}
              required
            />
          </div>
          <div className="mb-6">
            <label
              className="block text-gray-700 text-sm font-bold mb-2"
              htmlFor="role"
            >
              Register as
            </label>
            <select
              name="role"
              value={formData.role}
              onChange={handleChange}
              className="shadow border rounded w-full py-2 px-3 text-gray-700"
            >
              <option value="Customer">Customer</option>
              <option value="Delivery Agent">Delivery Agent</option>
            </select>
          </div>
          <div className="flex items-center justify-between">
            <button
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
              type="submit"
            >
              Register
            </button>
          </div>
        </form>
        <p className="text-center text-gray-500 text-sm mt-6">
          Already have an account?{" "}
          <Link
            to="/login"
            className="font-bold text-blue-600 hover:text-blue-800"
          >
            Login here
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
