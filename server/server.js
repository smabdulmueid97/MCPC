// server/server.js
const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const dotenv = require("dotenv");
const cors = require("cors");
const connectDB = require("./config/db");

// Route files
const authRoutes = require("./routes/authRoutes");
const parcelRoutes = require("./routes/parcelRoutes");
const adminRoutes = require("./routes/adminRoutes");
const agentRoutes = require("./routes/agentRoutes");

dotenv.config();
connectDB();

const app = express();
app.use(express.json());
app.use(cors());

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000", // Your React app's origin
    methods: ["GET", "POST"],
  },
});

// Make io accessible to our router
app.use((req, res, next) => {
  req.io = io;
  next();
});

// Mount routers
app.use("/api/auth", authRoutes);
app.use("/api/parcels", parcelRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/agent", agentRoutes);

io.on("connection", (socket) => {
  console.log("A user connected:", socket.id);
  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});

const PORT = process.env.PORT || 5001;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
