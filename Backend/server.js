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




    const app = express();
    const limiter = rateLimit({
        windowMs: 15 * 60 * 1000,
        max : 100,
        message : { success: false, message : ' Too many reques, try again later'}
    });
    app.use(cors({origin: 'http://localhost:5173', credentials:true}));
    app.use(helmet());
    app.use(limiter);
    app.use(express.json());
    app.use(cookieParser());
    app.use(passport.initialize());
    
    app.use(sanitizeInput);
    app.use(compression());
    app.use('/api/services', serviceRoutes);


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

   




    app.use('/api/users', userRoutes)
    app.get('/', (req,res)=>{
        res.send('Server is running ')
    });

    const PORT = process.env.PORT || 5000;

    app.listen(PORT,()=>{
        console.log(`Server is running on ${PORT}`)
    });

