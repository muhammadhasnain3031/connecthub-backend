import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    name:{type:String, required:true},
    email:{type:String, required:true, unique:true},
    password:{type:String, required:true},
    role:{type:String},
    avatar:{type:String},
    phone:{type:String},
    googleId: {
  type: String,
  unique: true,
  sparse: true,
}

})

const User =    mongoose.model('User', userSchema);
export default User;