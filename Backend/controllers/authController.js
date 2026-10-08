import dotenv from "dotenv";
dotenv.config();

import crypto from "crypto";
import User from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from 'jsonwebtoken';
import sendEmail from '../utils/sendEmail.js';

async function loginUser(req, res) {
    try {
        const { email, password } = req.body;
        const userExist = await User.findOne({ email: email });
        if (!userExist) {
            return res.status(401).json({ message: 'invalid email or password' })
        }
        const userFind = await bcrypt.compare(password, userExist.password);
        if (!userFind) {
            return res.status(401).json({ message: 'invalid email or password' })
        };
        const token = jwt.sign(
            {
                id: userExist._id,
                role: userExist.role
            },
            process.env.JWT_SECRET,
            {
                expiresIn: '7d'
            }
        );
        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000,
        });

        // ⚡ FIX: userExist use kiya aur return statement ko ek hi line me properly structural format kiya
        return res.status(200).json({
            message: "Loggin successfully",
            user: {
                _id: userExist._id,
                name: userExist.name,
                email: userExist.email,
                role: userExist.role
            }
        });

    }
    catch (error) {
        return res.status(500).json({ message: error.message })
    }
}

export const googleAuthCallback = async (req, res) => {
    const profile = req.user;
    try {
        let user = await User.findOne({ googleId: profile.id });
        if (!user) {
            const email = profile.emails[0]?.value;
            user = await User.findOne({ email });
            if (user) {
                user.googleId = profile.id;
                user.avatar = (user.avatar || profile.photos[0]?.value);
                await user.save();
            }
            else {
                user = new User({
                    googleId: profile.id,
                    name: profile.displayName,
                    email: email,
                    avatar: profile.photos[0]?.value,
                    role: 'user',
                })
                await user.save();
            }
        }
        const token = jwt.sign(
            {
                id: user._id,
                role: user.role,
            },
            process.env.JWT_SECRET,
            {
                expiresIn: '7d'
            }
        );
        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000,
        });
        return res.redirect('http://localhost:3000/dashboard');
    }
    catch (error) {
        console.log('Google Auth Error', error);
        return res.status(500).json({ message: error.message });
    };
};

// =========================================================================
// DAY-25 Update: PASSWORD RECOVERY SYSTEM CONTROLLERS
// =========================================================================

// 1. Forgot Password Flow
export const forgotPassword = async (req, res, next) => {
    try {
        const { email } = req.body;
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found with this email' });
        }

        // Unhashed temporary crypto string generate karein
        const resetToken = crypto.randomBytes(20).toString('hex');

        // Token ko createHash kar ke model attributes me update karein
        user.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
        user.resetPasswordExpire = Date.now() + 10 * 60 * 1000; // 10 minutes temporary expiry link duration

        await user.save({ validateBeforeSave: false });

        const resetUrl = `http://localhost:5173/reset-password/${resetToken}`;
        const htmlMessage = `
            <h1>ConnectHub Password Reset Request</h1>
            <p>Aapne apnay account ka password reset karne ki request ki hai. Please niche diye gaye link par click karein:</p>
            <a href="${resetUrl}" target="_blank">${resetUrl}</a>
            <p>Yeh token link sirf 10 minutes tak valid hai. Agar aapne yeh request nahi ki, to is email ko ignore karein.</p>
        `;

        try {
            await sendEmail({
                email: user.email,
                subject: 'ConnectHub Account Security - Password Reset Request Link',
                html: htmlMessage,
            });

            res.status(200).json({ success: true, message: 'Password recovery email sent successfully' });
        } catch (err) {
            user.resetPasswordToken = undefined;
            user.resetPasswordExpire = undefined;
            await user.save({ validateBeforeSave: false });
            return res.status(500).json({ success: false, message: 'Email could not be sent. Please try again later.' });
        }
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

// 2. Reset Password Action execution pipeline
export const resetPassword = async (req, res, next) => {
    try {
        const resetPasswordToken = crypto.createHash('sha256').update(req.params.token).digest('hex');

        const user = await User.findOne({
            resetPasswordToken,
            resetPasswordExpire: { $gt: Date.now() }, // Token validity window control trace validation
        });

        if (!user) {
            return res.status(400).json({ success: false, message: 'Invalid or expired password reset token' });
        }

        // Set fresh safe incoming body raw password hash parameters
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(req.body.password, salt);

        // State pointer clean up tracking elements reset execution handles
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;

        await user.save();

        res.status(200).json({ success: true, message: 'Password reset completed successfully. You can now login.' });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

export default loginUser;
