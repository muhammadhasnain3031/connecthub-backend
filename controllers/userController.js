import User from "../models/User.js";
import bcrypt from 'bcryptjs';

async function registerUser(req,res) {
    try{
        const{name,email,password,role} = req.body;
        if(!name || !email || !password){
           return res.status(400).json({message: 'Please Fill All the Data '})
        }
        const userFind = await User.findOne({email:email})
        if(userFind){
         return res.status(409).json({message:'user already exist'})
        }
        const hashedPassword = await bcrypt.hash(password,10)

        const newUser = await User.create({
            name,
            email,
            role,
            password:hashedPassword})
        res.status(201).json({message:'User created successfully'})

    }
    catch(error){
        res.status(500).json({message:error.message})
    }
}

export default registerUser;