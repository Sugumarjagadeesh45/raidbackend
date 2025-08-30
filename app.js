
const express = require("express");
const cors = require("cors");
const multer = require("multer");
const path = require("path");

const app = express();

// Enable CORS
app.use(
  cors({
   origin: [
      'http://localhost:3000',
      'http://192.168.1.107:3000',
      'http://10.0.2.2:5000',
      'https://raidbackend.onrender.com',
    ],
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// Middleware
app.use(express.json());
app.use("/uploads", express.static("uploads"));

// Multer setup
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});
const upload = multer({ storage });

// Routes
const adminRoutes = require("./routes/adminRoutes");
const driverRoutes = require("./routes/driverRoutes");
const rideRoutes = require("./routes/rideRoutes");
const groceryRoutes = require("./routes/groceryRoutes");
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const walletRoutes = require("./routes/walletRoutes");

 // ✅ import wallet routes

app.use("/api/admins", adminRoutes);
app.use("/api/drivers", driverRoutes);
app.use("/api/rides", rideRoutes);
app.use("/api/groceries", groceryRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/wallet", walletRoutes); // ✅ mount wallet routes

// Test route
app.get("/", (req, res) => {
  res.send("Taxi app API is running...");
});

module.exports = app;
