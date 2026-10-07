import express from 'express';
import registerUser from '../controllers/userController.js';
import loginUser, { googleAuthCallback, forgotPassword, resetPassword } from '../controllers/authController.js';
import { protect, authorizeRoles } from '../middleware/authMiddleware.js';
import passport from 'passport';
import { upload } from '../middleware/upload.js';

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);

// Day-25 Update: Password Recovery endpoints mapping execution blocks
router.post('/forgot-password', forgotPassword);
router.put('/reset-password/:token', resetPassword);

router.put('/profile/avatar', protect, upload.single('avatar'), (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, message: "Koi file select nahi ki gayi." });
        }
        res.status(200).json({ 
            success: true, 
            message: "Profile picture upload ho gayi!", 
            url: req.file.path 
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

router.get('/admin-only-data', protect, authorizeRoles('admin'), (req, res) => {
    res.json({ message: "Welcome Admin! Yeh bohot secret data hai." });
});

router.get('/provider-dashboard', protect, authorizeRoles('admin', 'provider'), (req, res) => {
    res.json({ message: "Welcome! Yeh services manage karne ka dashboard hai." });
});

router.get('/auth/google', passport.authenticate('google', { scope: ['profile', 'email'], session: false }));
router.get(
    '/auth/google/callback',
    passport.authenticate('google', { failureRedirect: '/login', session: false }), googleAuthCallback
);

export default router;
