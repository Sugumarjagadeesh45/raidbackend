
const User = require('../models/user/Registration');
const Driver = require('../models/driver/driver');
const Ride = require('../models/ride');
const RaidId = require('../models/user/raidId');
const jwt = require('jsonwebtoken');

// --- Auth middleware ---
exports.userAuth = (req, res, next) => {
  const header = req.headers.authorization;
  if (!header) return res.status(401).json({ error: 'No token provided' });
  const token = header.split(' ')[1];
  try {
    const data = jwt.verify(token, process.env.JWT_SECRET || 'secret');
    req.user = data;
    next();
  } catch {
    return res.status(401).json({ error: 'Invalid token' });
  }
};

// --- Helpers ---
function calculateFare(distanceKm, vehicleType) {
  const base = vehicleType === 'EV' ? 15 : (vehicleType === 'Auto' ? 10 : 12);
  const price = Math.max(50, Math.round(base * distanceKm));
  const points = Math.round(distanceKm * 5);
  return { price, points };
}

// --- GET all rides ---
exports.getRides = async (req, res) => {
  try {
    const rides = await Ride.find().populate('driver').populate('user');
    res.json(rides);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// --- CREATE Ride ---
exports.createRide = async (req, res) => {
  try {
    console.log("📥 Incoming ride request body:", req.body);

    const { user: userId, pickupCoordinates, dropoffCoordinates, pickupLocation, dropoffLocation, fare, rideType, distance, travelTime, isReturnTrip } = req.body;

    if (!userId || !pickupCoordinates || !dropoffCoordinates || !pickupLocation || !dropoffLocation || !fare || !rideType) {
      return res.status(400).json({ error: "Missing required ride fields" });
    }

    // Generate RAID_ID
    const counter = await RaidId.findOneAndUpdate(
      { _id: "raidId" },
      { $inc: { sequence: 1 } },
      { new: true, upsert: true }
    );
    const RAID_ID = counter.sequence.toString().padStart(6, "0");

    // Find user
    const user = await User.findById(userId);
    if (!user || !user.customerId) {
      return res.status(404).json({ error: "User or customerId not found" });
    }

    // Create ride
    const ride = new Ride({
      RAID_ID,
      customerId: user.customerId,
      name: user.name,
      user: userId,
      pickupCoordinates,
      dropoffCoordinates,
      pickupLocation,
      dropoffLocation,
      fare,
      rideType,
      distance: distance || null,
      travelTime: travelTime || null,
      isReturnTrip: isReturnTrip || false,
      status: "requested", // default status
    });

    await ride.save();

    console.log("✅ Ride saved:", ride);

    res.status(201).json({ success: true, ride });
  } catch (err) {
    console.error("❌ Error saving ride:", err.message);
    res.status(500).json({ error: err.message });
  }
};

// --- UPDATE ride ---
// In rideController.js, update the updateRide function:
exports.updateRide = async (req, res) => {
  try {
    console.log(`Updating ride with RAID_ID: ${req.params.rideId}`);
    console.log("Update data:", req.body);
    
    const ride = await Ride.findOneAndUpdate(
      { RAID_ID: req.params.rideId },
      req.body,
      { new: true }
    );
    
    if (!ride) {
      console.log(`Ride not found with RAID_ID: ${req.params.rideId}`);
      return res.status(404).json({ error: 'Ride not found' });
    }
    
    console.log("✅ Ride updated successfully:", ride);
    res.json(ride);
  } catch (err) {
    console.error("❌ Error updating ride:", err);
    res.status(400).json({ error: err.message });
  }
};

// --- DELETE ride ---
exports.deleteRide = async (req, res) => {
  try {
    const ride = await Ride.findOneAndDelete({ RAID_ID: req.params.rideId });
    if (!ride) return res.status(404).json({ error: 'Ride not found' });
    res.json({ message: 'Ride deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// --- Get ride by RAID_ID ---
exports.getRideById = async (req, res) => {
  try {
    const ride = await Ride.findOne({ RAID_ID: req.params.rideId })
      .populate('user');
    if (!ride) return res.status(404).json({ error: 'Ride not found' });
    res.json(ride);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// --- Accept Ride ---
exports.acceptRide = async (req, res) => {
  try {
    const { driverId } = req.body;
    const ride = await Ride.findOne({ RAID_ID: req.params.rideId });
    if (!ride) return res.status(404).json({ error: 'Ride not found' });
    if (ride.status !== 'requested') return res.status(400).json({ error: 'Ride already taken' });
    
    ride.driver = driverId;
    ride.status = 'accepted';
    await ride.save();

    res.json({ success: true, ride });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// --- Mark Arrived ---
exports.markArrived = async (req, res) => {
  try {
    const ride = await Ride.findOne({ RAID_ID: req.params.rideId });
    if (!ride) return res.status(404).json({ error: 'Ride not found' });
    if (ride.status !== 'accepted') return res.status(400).json({ error: 'Cannot mark arrived now' });
    
    ride.status = 'arrived';
    await ride.save();
    res.json({ success: true, ride });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// --- Start Ride ---
exports.startRide = async (req, res) => {
  try {
    const { otp } = req.body;
    const ride = await Ride.findOne({ RAID_ID: req.params.rideId });
    if (!ride) return res.status(404).json({ error: 'Ride not found' });
    if (ride.status !== 'arrived') return res.status(400).json({ error: 'Ride must be arrived before start' });
    if (ride.otp && ride.otp !== otp) return res.status(400).json({ error: 'Invalid OTP' });
    
    ride.status = 'ongoing';
    await ride.save();
    res.json({ success: true, ride });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// --- Complete Ride ---
exports.completeRide = async (req, res) => {
  try {
    const ride = await Ride.findOne({ RAID_ID: req.params.rideId }).populate('user driver');
    if (!ride) return res.status(404).json({ error: 'Ride not found' });
    if (ride.status !== 'ongoing') return res.status(400).json({ error: 'Ride must be ongoing to complete' });

    ride.status = 'completed';
    await ride.save();

    // Update user points
    const user = await User.findById(ride.user._id);
    user.wallet.points = (user.wallet.points || 0) + (ride.pointsEarned || 0);
    await user.save();

    // Update driver earnings
    if (ride.driver) {
      const driver = await Driver.findById(ride.driver._id);
      driver.earnings = (driver.earnings || 0) + ride.fare;
      await driver.save();
    }

    res.json({ success: true, ride, newUserPoints: user.wallet.points });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
