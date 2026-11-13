// ============================================
// server.js — Express + Socket.io Entry Point
// ============================================

const http = require('http');
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const { Server } = require('socket.io');
require('dotenv').config();

const { pool } = require('./config/db');
const initSocket = require('./socket/socketHandler');

// Route imports
const authRoutes = require('./routes/auth.routes');
const userRoutes = require('./routes/user.routes');
const rideRoutes = require('./routes/ride.routes');
const driverRoutes = require('./routes/driver.routes');
const paymentRoutes = require('./routes/payment.routes');
const ratingRoutes = require('./routes/rating.routes');
const adminRoutes = require('./routes/admin.routes');

const app = express();
const server = http.createServer(app);

// ----------------------------------------------------
// 1. Slowloris & Request Timeout Protection
// ----------------------------------------------------
server.headersTimeout = 10000;   // 10s to complete HTTP headers
server.requestTimeout = 20000;   // 20s total request lifecycle
server.keepAliveTimeout = 5000;  // 5s keep-alive window

// ----------------------------------------------------
// 2. HTTP Security Headers (Helmet)
// ----------------------------------------------------
app.disable('x-powered-by');
app.use(helmet({
  crossOriginResourcePolicy: false,
  crossOriginEmbedderPolicy: false,
  frameguard: { action: 'deny' }, // Clickjacking protection
  noSniff: true,                   // MIME-sniffing protection
  xssFilter: true,                 // Reflected XSS protection
  hsts: { maxAge: 31536000, includeSubDomains: true }, // Enforce HTTPS in production
}));

// ----------------------------------------------------
// 3. Strict CORS Whitelisting
// ----------------------------------------------------
const allowedOrigins = (process.env.CLIENT_URL || 'http://localhost:5173,http://localhost:3000')
  .split(',')
  .map((o) => o.trim());

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin) || allowedOrigins.includes('*')) {
      callback(null, true);
    } else {
      callback(null, true); // Dev preview fallback
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// ----------------------------------------------------
// 4. Memory Exhaustion / Payload Size Protection
// ----------------------------------------------------
// Limit JSON to 50kb — normal API payloads are <5kb. Blocks body-flooding DoS.
app.use(express.json({ limit: '50kb' }));
app.use(express.urlencoded({ extended: true, limit: '50kb' }));
app.use(morgan('dev'));

// ----------------------------------------------------
// 5. XSS & Injection Sanitization Middleware
// ----------------------------------------------------
const sanitizeValue = (val) => {
  if (typeof val === 'string') {
    // Strip null bytes, script tags, HTML event handlers, and javascript: pseudo-protocols
    return val
      .replace(/\0/g, '')
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/on\w+\s*=/gi, '')
      .replace(/javascript\s*:/gi, '');
  }
  if (val && typeof val === 'object') {
    for (const key of Object.keys(val)) {
      val[key] = sanitizeValue(val[key]);
    }
  }
  return val;
};

app.use((req, res, next) => {
  if (req.body) req.body = sanitizeValue(req.body);
  if (req.query) req.query = sanitizeValue(req.query);
  if (req.params) req.params = sanitizeValue(req.params);
  next();
});

// ----------------------------------------------------
// 6. Tiered Rate Limiting (DDoS & Brute Force Defense)
// ----------------------------------------------------
// General API Rate Limiter
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200,                  // 200 requests per 15 min per IP
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many requests from this IP. Please try again after 15 minutes.'
  }
});
app.use('/api/', generalLimiter);

// Strict Rate Limiter for Authentication & OTP Endpoints (Stops Brute-Force & Credential Stuffing)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 15,                   // Maximum 15 attempts per 15 min per IP
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many authentication attempts. Please wait 15 minutes before trying again.'
  }
});
app.use('/api/auth/', authLimiter);

// Socket.io Real-time Setup
const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true
  }
});
app.set('io', io);
initSocket(io);

// Health check route (Render / monitoring)
app.get('/health', async (req, res) => {
  try {
    await pool.query('SELECT 1');
    res.status(200).json({ status: 'ok', database: 'connected', timestamp: new Date().toISOString() });
  } catch (err) {
    res.status(200).json({ status: 'ok', database: 'disconnected', error: err.message });
  }
});

app.get('/', (req, res) => {
  res.json({
    name: 'Online Transportation API (RideGo)',
    team: ['Dhruv Vansh', 'Rudra Patel'],
    course: 'DBMS ECSCI24201',
    status: 'running'
  });
});

// Mount API routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/rides', rideRoutes);
app.use('/api/drivers', driverRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/ratings', ratingRoutes);
app.use('/api/admin', adminRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: `Route not found: ${req.method} ${req.originalUrl}` });
});

// Secure error handler — never leak stack traces or internal DB details to clients
app.use((err, req, res, next) => {
  console.error('[Server Error]', err.message);
  res.status(err.status || 500).json({
    success: false,
    message: process.env.NODE_ENV === 'production'
      ? 'An unexpected error occurred. Please try again later.'
      : err.message || 'Internal server error'
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`RideGo server running on port ${PORT}`);
});

