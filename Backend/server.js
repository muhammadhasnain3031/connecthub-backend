import dotenv from 'dotenv';
dotenv.config();
import express from 'express';
import mongoose from 'mongoose';
import { createServer } from 'http';
import { Server } from 'socket.io';

// ==========================================
// DAY 34 LOGGING SYSTEM IMPORTS
// ==========================================
import morgan from 'morgan';
import logger from './config/logger.js';

import userRoutes from './routes/userRoutes.js';
import passport from 'passport';
import './config/passport.js';
import helmet from 'helmet';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import sanitizeInput from './middleware/sanitizeInput.js';
import cookieParser from 'cookie-parser';
import compression from 'compression';
import serviceRoutes from './routes/serviceRoutes.js';
import bookingRoutes from './routes/bookingRoutes.js';
import paymentRoutes from './routes/paymentRoutes.js';
import errorMiddleware from './middleware/errorMiddleware.js';

import { initNotificationListeners } from './listeners/notificationListener.js';

const app = express();
const httpServer = createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: 'http://localhost:5173',
    credentials: true,
  },
});

// ==========================================
// DAY 34 LOGGING & RATE LIMITER CONFIGURATIONS
// ==========================================
// 1. Morgan Stream setup to pipe logs into Winston
const morganStream = {
  write: (message) => logger.http(message.trim()),
};

const morganMiddleware = morgan(
  ':method :url :status :res[content-length] - :response-time ms',
  { stream: morganStream }
);

// 2. Global Rate Limiter for general endpoints
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  message: { success: false, message: 'Too many requests, try again later.' },
});

// 3. Strict Rate Limiter for Sensitive Auth Routes (Brute-Force Protection)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 15, // Only 15 attempts allowed
  message: {
    success: false,
    message:
      'Boht zyada koshish ki gayi hai. Meharbani kar ke 15 minutes baad dobara try karein.',
  },
  handler: (req, res, next, options) => {
    logger.warn(
      `⚠️ Rate Limit Hit: IP ${req.ip} tried to abuse endpoint: ${req.originalUrl}`
    );
    res.status(options.statusCode).send(options.message);
  },
});

// ==========================================
// MIDDLEWARES PIPELINE (ORDER MATTERS)
// ==========================================
app.use(cors({ origin: 'http://localhost:5173', credentials: true }));
app.use(helmet());
app.use(globalLimiter);
app.use(morganMiddleware); // Injected right after security layers to track every request

// Apply strict rate limiting to auth routes before mounting endpoints
app.use('/api/users/login', authLimiter);
app.use('/api/users/register', authLimiter);

app.use('/api/payments', paymentRoutes);
app.use(express.json());
app.use(cookieParser());
app.use(passport.initialize());
app.use(sanitizeInput);
app.use(compression());

// ==========================================
// ROUTES ROUTING
// ==========================================
app.use('/api/services', serviceRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/users', userRoutes);

app.get('/', (req, res) => {
  res.send('Server is running ');
});

// ==========================================
// DATABASE CONNECTION WITH WINSTON LOGGING
// ==========================================
async function connectDB() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    logger.info('Database status: MongoDB connected successfully');
  } catch (error) {
    logger.error(`Database connection failed: ${error.message}`);
  }
}
connectDB();

// Boot background Pub/Sub event listeners
initNotificationListeners();

// ==========================================
// SOCKET.IO REAL-TIME ROUTINES
// ==========================================
io.on('connection', (socket) => {
  logger.info(`⚡ Socket status: User connected with ID: ${socket.id}`);

  socket.on('joinRoom', (conversationId) => {
    socket.join(conversationId);
    logger.info(
      `🚪 Room event: Socket ${socket.id} joined conversation room: ${conversationId}`
    );
  });

  socket.on('sendMessage', (messageData) => {
    const { conversationId } = messageData;
    socket.to(conversationId).emit('receiveMessage', messageData);
  });

  socket.on('disconnect', () => {
    logger.info(`❌ Socket status: User disconnected properly: ${socket.id}`);
  });
});

// Centralized Custom Error Handling Middleware (Always at the end)
app.use(errorMiddleware);

// ==========================================
// SERVER BOOTUP CONTROL
// ==========================================
const PORT = process.env.PORT || 5000;
if (process.env.NODE_ENV !== 'test') {
  httpServer.listen(PORT, () => {
    logger.info(`🚀 Production Server is running on port ${PORT}`);
  });
}

export default app;
