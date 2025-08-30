
const express = require('express');
const router = express.Router();
const driverController = require('../controllers/driver/driverController');
const auth = require('../middleware/authMiddleware');

// Public routes
router.post('/login', driverController.loginDriver);
router.post('/change-password', driverController.changePassword);

// Protected routes (require authentication)
router.use(auth); // Apply auth middleware to all routes below

// Location update
router.post('/update-location', driverController.updateLocation);

// Ride management
router.get('/rides/:rideId', driverController.getRideById);
router.put('/rides/:rideId', driverController.updateRideStatus); // This is the important one

// Driver management
router.get('/', driverController.getDrivers);
router.get('/nearest', driverController.getNearestDrivers);
router.put('/:driverId', driverController.updateDriver);
router.delete('/:driverId', driverController.deleteDriver);
router.post('/logout', driverController.logoutDriver);

module.exports = router;

