// ============================================
// socket/socketHandler.js — Real-time Socket.io
// ============================================

const jwt = require('jsonwebtoken');

const initSocket = (io) => {
  // Optional JWT authentication on socket handshake
  io.use((socket, next) => {
    try {
      const token = socket.handshake.auth?.token;
      if (token && token !== 'demo-token' && process.env.JWT_SECRET) {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        socket.user = decoded;
      }
    } catch (err) {
      // Allow connection in demo mode, log warning
      console.warn('[Socket] Unverified token:', err.message);
    }
    next();
  });

  io.on('connection', (socket) => {
    console.log(`[Socket] Client connected: ${socket.id}`);

    // Join role/user-specific room
    socket.on('join', ({ userId, role }) => {
      if (!userId) return;
      if (role === 'driver') {
        socket.join(`driver_${userId}`);
        socket.join('drivers_online');
      } else if (role === 'rider') {
        socket.join(`rider_${userId}`);
      } else if (role === 'admin') {
        socket.join('admins');
      }
      socket.join(`user_${userId}`);
    });

    // Rider requests a ride
    socket.on('ride:request', (data) => {
      io.to('drivers_online').emit('ride:new-request', data);
    });

    // Driver streams GPS coordinates
    socket.on('driver:location-update', (data) => {
      const { rideId, riderId, lat, lng } = data || {};
      if (riderId) {
        io.to(`rider_${riderId}`).emit('ride:driver-location', { rideId, lat, lng });
      }
      io.emit('driver:moved', data);
    });

    // Ride lifecycle updates
    socket.on('ride:status-update', (data) => {
      const { riderId, status, ride } = data || {};
      if (riderId) {
        io.to(`rider_${riderId}`).emit(`ride:${status}`, { ride });
      }
    });

    socket.on('disconnect', () => {
      console.log(`[Socket] Client disconnected: ${socket.id}`);
    });
  });
};

module.exports = initSocket;

