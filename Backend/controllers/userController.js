import User from '../models/User.js';
import bcrypt from 'bcryptjs';

async function registerUser(req, res) {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'please fill all the fields' });
    }
    const duplicateUser = await User.findOne({ email: email });
    if (duplicateUser) {
      return res.status(409).json({ message: 'User Already Exist' });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await User.create({
      name: name,
      email: email,
      password: hashedPassword,
    });
return res.status(201).json({
  success: true,
  message: "User registered successfully",
  user: newUser
});
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
}
export default registerUser;
