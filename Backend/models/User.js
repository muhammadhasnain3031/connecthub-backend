import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String },
    avatar: { type: String },
    phone: { type: String },
    googleId: {
        type: String,
        unique: true,
        sparse: true,
    },
    // Day-25 Update: Cryptographic Reset Token & Expiration validation parameters
    resetPasswordToken: String,
    resetPasswordExpire: Date
});

const User = mongoose.model('User', userSchema);
export default User;
