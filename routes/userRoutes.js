import express from 'express';
import registerUser from '../controllers/userController.js';
import loginUser from '../controllers/authController.js';
import { protect, authorizeRoles } from '../middleware/authMiddleware.js';



const router = express.Router();
router.post('/register',registerUser);
router.post('/login', loginUser)
router.get('/admin-only-data', protect, authorizeRoles('admin'), (req, res) => {
    res.json({ message: "Welcome Admin! Yeh bohot secret data hai." });
});
router.get('/provider-dashboard', protect, authorizeRoles('admin', 'provider'), (req, res) => {
    res.json({ message: "Welcome! Yeh services manage karne ka dashboard hai." });
});
export default router;
