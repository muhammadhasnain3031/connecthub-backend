import dotenv from "dotenv";
dotenv.config();

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
export const googleAuthCallback = async (req,res)=>{
    const profile = req.user;
    try{
        let user = await User.findOne({googleId:profile.id});
    if(!user){
        const email = profile.emails[0]?.value;
        user = await User.findOne({email});
        if(user){
            user.googleId = profile.id;
            user.avatar = (user.avatar || profile.photos[0]?.value);
             await user.save();

        }
        else{
            user = new User ({
                googleId: profile.id,
                name:profile.displayName,
                email : email,
                avatar : profile.photos[0]?.value,
                role : 'user',
            })
            await user.save();
        }
    }
    const token = jwt.sign(
        {
            id : user._id,
            role : user.role,
        },
        process.env.JWT_SECRET,
        {
            expiresIn : '7d'
        }
    );
    res.cookie('token',token, {
        httpOnly : true,
        secure : process.env.NODE_ENV === 'production',
        sameSite : 'strict',
        maxAge : 7 * 24 * 60 * 60 * 1000,
    });
    return res.redirect('http://localhost:3000/dashboard');
    }
    catch(error){
        console.log('Google Auth Error', error);
                return res.status(500).json({ message: error.message });

        
    };

};



export default loginUser;
