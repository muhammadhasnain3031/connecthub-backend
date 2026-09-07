import User from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from 'jsonwebtoken';

async function loginUser(req,res){
    try{
        const {email, password} = req.body;
        const userExist = await User.findOne({email:email});
        if(!userExist){
            return res.status(401).json({message :'invalid email or password'})
        }
        const userFind = await bcrypt.compare(password, userExist.password);
        if(!userFind){
            return res.status(401).json({message: 'invalid email or password'})
        };
        const token = jwt.sign(
            {id:userExist._id,
                role:userExist.role
            },
            process.env.JWT_SECRET,
            {
                expiresIn:'7d'
            }
        );
        res.cookie('token',token,{
            httpOnly:true,
            secure : process.env.NODE_ENV === 'production',
            sameSite : 'strict',
            maxAge : 7 * 24 * 60 * 60 * 1000,
        })
        return res.status(200).json({message:'Loggin successfully'})
    }
    catch(error){
            return res.status(500).json({message: error.message})
    }
}
export default loginUser;
