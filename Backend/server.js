import dotenv from 'dotenv';
dotenv.config();
import express from 'express';
import mongoose from 'mongoose';
import { createServer } from 'http';
import { Server } from 'socket.io';
import aiRoutes from './routes/aiRoutes.js';

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
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';

const io = new Server(httpServer, {
  cors: {
    origin: FRONTEND_URL,
    credentials: true,
  },
});

// ==========================================
// DAY 34 LOGGING & RATE LIMITER CONFIGURATIONS
// ==========================================
const morganStream = {
  write: (message) => logger.http(message.trim()),
};

const morganMiddleware = morgan(
  ':method :url :status :res[content-length] - :response-time ms',
  { stream: morganStream }
);

const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { success: false, message: 'Too many requests, try again later.' },
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 15,
  message: {
    success: false,
    message: 'Boht zyada koshish ki gayi hai. Meharbani kar ke 15 minutes baad dobara try karein.',
  },
  handler: (req, res, next, options) => {
    logger.warn(`⚠️ Rate Limit Hit: IP ${req.ip} tried to abuse endpoint: ${req.originalUrl}`);
    res.status(options.statusCode).send(options.message);
  },
});

// ==========================================
// MIDDLEWARES PIPELINE (ORDER MATTERS)
// ==========================================
app.use(cors({ origin: FRONTEND_URL, credentials: true }));
app.use(helmet());
app.use(globalLimiter);
app.use(morganMiddleware);

app.use('/api/users/login', authLimiter);
app.use('/api/users/register', authLimiter);

app.use('/api/payments', paymentRoutes);
app.use(express.json());
app.use(cookieParser());
app.use(passport.initialize());
app.use(sanitizeInput);
app.use(compression());

// ==========================================
// DAY 39: SOCKET.IO REQUEST INJECTION MIDDLEWARE
// ==========================================
// Yeh pipeline routes chalne se pehle har request mein socket inject karega
app.use((req, res, next) => {
  req.io = io;
  next();
});

// ==========================================
// ROUTES ROUTING
// ==========================================
app.use('/api/services', serviceRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/users', userRoutes);
app.use('/api/ai', aiRoutes);

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

initNotificationListeners();

// ==========================================
// SOCKET.IO REAL-TIME ROUTINES (DAY 39 UPDATED)
// ==========================================
io.on('connection', (socket) => {
  logger.info(`⚡ Socket status: User connected with ID: ${socket.id}`);

  // 1. Dynamic User/Provider Room Connection Handler
  socket.on('joinUserRoom', (userId) => {
    socket.join(userId);
    logger.info(`👤 User Room Active: Socket ${socket.id} joined personal identity room: ${userId}`);
  });

  // 2. Chat Conversation Room Handler
  socket.on('joinRoom', (conversationId) => {
    socket.join(conversationId);
    logger.info(`🚪 Room event: Socket ${socket.id} joined conversation room: ${conversationId}`);
  });

  socket.on('sendMessage', (messageData) => {
    const { conversationId } = messageData;
    socket.to(conversationId).emit('receiveMessage', messageData);
  });

  socket.on('disconnect', () => {
    logger.info(`❌ Socket status: User disconnected properly: ${socket.id}`);
  });
});

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
