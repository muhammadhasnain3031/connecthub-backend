import mongoose from "mongoose";
import dotenv from 'dotenv';
import express from 'express';
import connectDB from "./config/db.js";


dotenv.config();

const app = express();

app.use(express.json());



app.get('/',(req,res)=>{
    res.send('This is Home Page')
})



const PORT = process.env.PORT || 5000;

connectDB();

app.listen(PORT, (req,res)=>{
    console.log(`Server is Running  on PORT ${PORT}`)
})
