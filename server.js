import dotenv from "dotenv";
dotenv.config();
import express from 'express';
import mongoose from "mongoose";
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





const app = express();
app.get('/', (req,res)=>{
    res.send('Server is running ')
});

const PORT = process.env.PORT || 5000;

app.listen(PORT,()=>{
    console.log(`Server is running on ${PORT}`)
});

