import dotenv from "dotenv";
dotenv.config();
import express from 'express';
import mongoose from "mongoose";
import { createServer } from "http"; // ⚡ Update: Added for Socket.io wrapper
import { Server } from "socket.io"; // ⚡ Update: Added Socket.io server package
import registerUser from './controllers/userController.js';
import userRoutes from './routes/userRoutes.js';
import passport from "passport";
import './config/passport.js';
import helmet from "helmet";
import cors from 'cors';
import rateLimit from "express-rate-limit";
import sanitizeInput from "./middleware/sanitizeInput.js";
import cookieParser from "cookie-parser";
import compression from "compression";
import serviceRoutes from './routes/serviceRoutes.js';
import bookingRoutes from './routes/bookingRoutes.js';
import paymentRoutes from './routes/paymentRoutes.js'; 
import errorMiddleware from "./middleware/errorMiddleware.js";

const app = express();

// ⚡ Update: Express app ko HTTP server mein wrap kiya
const httpServer = createServer(app);

// ⚡ Update: Socket.io ko separate CORS options ke sath initialize kiya
const io = new Server(httpServer, {
    cors: {
        origin: 'http://localhost:5173',
        credentials: true
    }
});

const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max : 100,
    message : { success: false, message : ' Too many requests, try again later'}
});

app.use(cors({origin: 'http://localhost:5173', credentials:true}));
app.use(helmet());
app.use(limiter);

// Stripe Payment Routes ko express.json() se PEHLE rakhein raw body ke liye
app.use('/api/payments', paymentRoutes);

app.use(express.json());
app.use(cookieParser());
app.use(passport.initialize());

app.use(sanitizeInput);
app.use(compression());
app.use('/api/services', serviceRoutes);
app.use('/api/bookings', bookingRoutes);

async function connectDB(){
    try{
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Mongodb connected')
    }
    catch(error){
        console.log(error)
    }
}
connectDB();

app.use('/api/users', userRoutes);
app.get('/', (req,res)=>{
    res.send('Server is running ')
});

// ⚡ Update: Socket.io Connection Event Listeners (Room Isolation Pattern)
io.on('connection', (socket) => {
    console.log(`⚡ User connected: ${socket.id}`);

    // User dynamically ek specific conversation room join karega
    socket.on('joinRoom', (conversationId) => {
        socket.join(conversationId);
        console.log(`🚪 User with socket id ${socket.id} joined room: ${conversationId}`);
    });

    // Message transmit karne ki logic
    socket.on('sendMessage', (messageData) => {
        const { conversationId } = messageData;
        // Room ke baki members ko event emit karna bina sender ko disturb kiye
        socket.to(conversationId).emit('receiveMessage', messageData);
    });

    socket.on('disconnect', () => {
        console.log(`❌ User disconnected: ${socket.id}`);
    });
});

app.use(errorMiddleware);

const PORT = process.env.PORT || 5000;

// ⚡ Update: App.listen ki jagah ab httpServer.listen chalega
httpServer.listen(PORT,()=>{
    console.log(`Server is running on ${PORT}`)
});
