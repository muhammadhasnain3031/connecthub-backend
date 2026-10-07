import dotenv from "dotenv";
dotenv.config();
import express from 'express';
import mongoose from "mongoose";
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
// 1. Payment routes ko import karein
import paymentRoutes from './routes/paymentRoutes.js'; 

import errorMiddleware from "./middleware/errorMiddleware.js";

const app = express();
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max : 100,
    message : { success: false, message : ' Too many requests, try again later'}
});

app.use(cors({origin: 'http://localhost:5173', credentials:true}));
app.use(helmet());
app.use(limiter);

// 2. STAGE 1: Stripe Payment Routes ko express.json() se PEHLE rakhein.
// Taa ke jab hum isme Webhook add karein, to raw body securely fetch ho sakay.
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

app.use(errorMiddleware);

const PORT = process.env.PORT || 5000;

app.listen(PORT,()=>{
    console.log(`Server is running on ${PORT}`)
});
