

// server.js
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const app = require("./app");
const http = require("http");
const { Server } = require("socket.io");
dotenv.config();

// MongoDB connect
mongoose.connect(process.env.MONGODB_URI, {})
  .then(() => console.log("MongoDB connected"))
  .catch(err => {
    console.error("DB error:", err);
    process.exit(1);
  });

// HTTP + Socket.IO server create
const server = http.createServer(app);
const io = new Server(server, {
  cors: { 
    origin: "*", // Allow all origins
    methods: ["GET", "POST"]
  }
});

// socket connection
io.on("connection", (socket) => {
  console.log("Driver connected:", socket.id);
  
  // Handle driver joining a room
  socket.on("joinDriverRoom", (driverId) => {
    socket.join(driverId);
    socket.join("allDrivers"); // Join general drivers room
    console.log(`Driver ${driverId} joined room`);
  });
  
  // Handle driver disconnecting
  socket.on("disconnect", () => {
    console.log("Driver disconnected:", socket.id);
  });
});

// socket.io global access
app.set("io", io);

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🌐 Accessible at http://localhost:${PORT}`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('Unhandled Rejection:', err);
  server.close(() => process.exit(1));
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
  server.close(() => process.exit(1));
});


