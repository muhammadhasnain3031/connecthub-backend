import User from "../models/User.js";
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';


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
async function loginUser(req,res){
    const {email,password}=req.body;
    try{
    if(!email || !password){
        return res.status(400).json({message:'Please fill all data'})
    }
    const loggedUser = await User.findOne({email:email})
    if(!loggedUser){
        return res.status(401).json({message:'invalid credentials'})
    }
    const isMatch = await bcrypt.compare(password, loggedUser.password);
    if(!isMatch){
        return res.status(401).json({message:'invalid credentials'})
    }
    const token = jwt.sign({
        id:loggedUser._id,
        role:loggedUser.role,
    },
    process.env.JWT_SECRET,
    {expiresIn: '7d'}
)
return res.json({ message: 'Login Success', token });
   }
   catch(error){
    return res.status(500).json({message:error.message})
   }
}

export {registerUser,loginUser};