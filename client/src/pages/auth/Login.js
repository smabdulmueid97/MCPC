// client/src/pages/auth/Login.js
import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import useAuth from "../../hooks/useAuth";
import api from "../../services/api";

const Login = () => {
  const [formData, setFormData] = useState({ email: "", password: "" }); // [cite: 123]
  const [error, setError] = useState(""); // [cite: 124]
  const { login } = useAuth(); // [cite: 124]
  const navigate = useNavigate(); // [cite: 122]

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value }); // [cite: 125]
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const { data } = await api.post("/auth/login", formData); // [cite: 127]
      login(data); // [cite: 127]
      navigate("/"); // [cite: 127]
    } catch (err) {
      setError(err.response?.data?.message || "Login failed"); // [cite: 128]
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col justify-center items-center">
      <div className="w-full max-w-md bg-white rounded-lg shadow-md p-8">
        <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">
          Login to Your Account
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
              htmlFor="email"
            >
              Email Address
            </label>
            <input
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500"
              type="email"
              name="email"
              placeholder="you@example.com"
              onChange={handleChange}
              required
            />
          </div>
          <div className="mb-6">
            <label
              className="block text-gray-700 text-sm font-bold mb-2"
              htmlFor="password"
            >
              Password
            </label>
            <input
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500"
              type="password"
              name="password"
              placeholder="••••••••••"
              onChange={handleChange}
              required
            />
          </div>
          <div className="flex items-center justify-between">
            <button
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline transition duration-200"
              type="submit"
            >
              Sign In
            </button>
          </div>
        </form>
        <p className="text-center text-gray-500 text-sm mt-6">
          Don't have an account?{" "}
          <Link
            to="/register"
            className="font-bold text-blue-600 hover:text-blue-800"
          >
            Register here
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
