import express from 'express';
import {registerUser,loginUser} from '../controllers/userController.js';
import protect from '../middlewares/authMiddleware.js';


const router = express.Router();


router.post('/register', registerUser);
router.post('/login', loginUser)
router.get('/profile', protect, (req,res)=>{
    res.json({message : 'Protected Data',user: req.user})
});


export default router;
