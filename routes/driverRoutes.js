// const express = require('express');
// const router = express.Router();
// const driverController = require('../controllers/driver/driverController');
// const auth = require('../middleware/authMiddleware');

// // Public routes
// router.post('/login', driverController.loginDriver);
// router.post('/change-password', driverController.changePassword);

// // Protected routes (require authentication)
// router.use(auth); // Apply auth middleware to all routes below

// router.post('/update-location', driverController.updateLocation);
// router.get('/rides/:rideId', driverController.getRideById);

// router.get('/', driverController.getDrivers);
// router.get('/nearest', driverController.getNearestDrivers);
// router.put('/:driverId', driverController.updateDriver);
// router.delete('/:driverId', driverController.deleteDriver);
// router.post('/logout', driverController.logoutDriver);
// router.put('/rides/:rideId', driverController.updateRideStatus);

// module.exports = router;


// In driverRoutes.js, make sure the route is correctly defined:
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



// // D:\eazyGo\fullbackend-main\fullbackend-main\routes\driverRoutes.js

// const express = require('express');
// const router = express.Router();
// const driverController = require('../controllers/driver/driverController');
// const auth = require('../middleware/authMiddleware');

// // Public routes
// router.post('/login', driverController.loginDriver);
// router.post('/change-password', driverController.changePassword);

// // Protected routes (require authentication)
// router.use(auth); // Apply auth middleware to all routes below

// // Add this missing route
// router.post('/update-location', driverController.updateLocation);

// // Add route to get ride by ID
// router.get('/rides/:rideId', driverController.getRideById);

// // Other routes
// router.get('/', driverController.getDrivers);
// router.get('/nearest', driverController.getNearestDrivers);
// router.put('/:driverId', driverController.updateDriver);
// router.delete('/:driverId', driverController.deleteDriver);
// router.post('/logout', driverController.logoutDriver);
// router.put('/rides/:rideId', driverController.updateRideStatus);

// module.exports = router;