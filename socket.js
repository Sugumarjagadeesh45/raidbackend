// D:\EazyGo\easyGobackend-main\socket.js
const socketIo = require('socket.io');

let io;

module.exports = {
  init: (server) => {
    io = socketIo(server, {
      cors: {
        origin: ['http://localhost:3000', 'http://192.168.1.107:3000', 'http://10.0.2.2:5000', '*'],
        methods: ['GET', 'POST']
      }
    });

    io.on('connection', (socket) => {
      console.log('New client connected');

      // Join a room based on user type and ID
      socket.on('join', (data) => {
        socket.join(data.userId);
        console.log(`${data.userType} with ID ${data.userId} joined room`);
      });

      // Rider requests a ride
      socket.on('requestRide', (rideData) => {
        // Broadcast to all drivers
        socket.broadcast.emit('newRideRequest', rideData);
      });

      // Driver accepts a ride
      socket.on('acceptRide', (data) => {
        // Send to the specific rider
        io.to(data.riderId).emit('rideAccepted', data);
      });

      // Driver updates location
      socket.on('updateLocation', (data) => {
        // Broadcast to the rider of the current ride
        io.to(data.riderId).emit('driverLocationUpdate', data);
      });

      // Ride completed
      socket.on('completeRide', (data) => {
        io.to(data.riderId).emit('rideCompleted', data);
      });

      socket.on('disconnect', () => {
        console.log('Client disconnected');
      });
    });

    return io;
  },
  getIO: () => {
    if (!io) {
      throw new Error('Socket.IO not initialized!');
    }
    return io;
  }
};