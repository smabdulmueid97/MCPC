// client/src/services/api.js
import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:5001/api", // Your backend URL
});

export default api;
