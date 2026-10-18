import express from 'express';
import { getAIRecommendations } from '../controllers/aiController.js';
import {protect}  from '../middleware/authMiddleware.js';

const router = express.Router();

// POST request jo handle karegi query ko
// Aap chahein to protectRoute laga sakte hain taake sirf logged-in users use karein
router.post('/recommend', protect, getAIRecommendations);
router.get('/test', (req, res) => {
  res.send("AI Route Bilkul Sahi Kaam Kar Raha Hai!");
});


export default router;
