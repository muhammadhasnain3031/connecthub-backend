import Groq from 'groq-sdk';
import Service  from '../models/Service.js';

// Groq Client Initialize kar rahe hain (.env se key utha kar)
if (!process.env.GROQ_API_KEY) {
  import('dotenv').then((dotenv) => dotenv.config());
}
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY});

/**
 * @desc    Get AI-powered service recommendations based on user query
 * @route   POST /api/ai/recommend
 * @access  Protected/Private (Logged-in users only)
 */
export const getAIRecommendations = async (req, res, next) => {
  try {
    const { query } = req.body;

    // 1. Input Validation
    if (!query) {
      return res.status(400).json({ 
        success: false, 
        message: 'Please provide a search query for the AI helper.' 
      });
    }

    // 2. Fetch Available Services from Database
    // lean() use kar rahe hain (Day 21 pattern) taake performance fast ho aur plain JSON mile
    const availableServices = await Service.find({})
      .populate('providerId', 'name email') // Provider ki basic details sath lanay k liye
      .lean();

    if (availableServices.length === 0) {
      return res.status(200).json({
        success: true,
        message: "Humare paas abhi koi services available nahi hain.",
        recommendations: []
      });
    }

    // 3. Format Services Data for LLM Context
    // Saari services ka ahem data ek string mein convert kar rahe hain taake AI ise samajh sakay
    const servicesContext = availableServices.map(srv => (
      `ID: ${srv._id}, Title: ${srv.title}, Category: ${srv.category}, Price: $${srv.price}, Description: ${srv.description}, Provider: ${srv.providerId?.name || 'Unknown'}`
    )).join('\n\n');

    // 4. Construct System Prompt (Prompt Engineering)
    const systemPrompt = `
      You are the expert AI Recommendation Assistant for "ConnectHub", a freelance and service booking platform.
      Your job is to read the user's requirement and match them with the BEST relevant services from our database.
      
      Here is the list of available services in our database:
      ${servicesContext}
      
      Instructions:
      - Analyze the user's query carefully.
      - Recommend 1 to 3 best matching services from the list above.
      - For each recommendation, provide the Service ID, Title, Provider Name, and a short 1-sentence reason why it matches their need.
      - If NO services match the query, politely tell the user that we don't have an exact match right now, and suggest what category they should look for instead.
      - Keep your response clear, professional, concise, and structured.
    `;

    // 5. Call Groq Cloud API (Non-Streaming Call)
    // Hum fast aur efficient model llama-3.1-8b-instant use kar rahe hain
    // Sahi Model Name
// Final Stable Groq Call Setup
const chatCompletion = await groq.chat.completions.create({
  messages: [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: query }
  ],
   model: 'qwen/qwen3.8-27b', // Yeh model hamesha active aur verified rehta hai
  temperature: 0.3,
  max_tokens: 800
});


    // 6. Extract Response Text
    const aiResponse = chatCompletion.choices[0]?.message?.content;

    // 7. Send Response Back to Client
    return res.status(200).json({
      success: true,
      query,
      recommendations: aiResponse
    });

  } catch (error) {
    // Centralized error handling (Day 17/34 pattern)
        console.error("❌ Groq Client Error Details:", error.message);

    next(error); 
  }
};
