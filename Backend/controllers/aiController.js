import Groq from 'groq-sdk';
import Service from '../models/Service.js';
import logger from '../config/logger.js';

/**
 * @desc    Get AI-powered service recommendations based on user query
 * @route   POST /api/ai/recommend
 * @access  Protected/Private (Logged-in users only)
 */
export const getAIRecommendations = async (req, res, next) => {
  try {
    const { query } = req.body;
    const userId = req.user?.id || req.user?._id || 'Anonymous';

    // 1. Input Validation
    if (!query) {
      return res.status(400).json({ 
        success: false, 
        message: 'Please provide a search query for the AI helper.' 
      });
    }

    // ==========================================
    // DAY 39: LAZY INITIALIZATION ENGINE (ANTI-CRASH)
    // ==========================================
    // Client ab tabhi initialize hoga jab actual request function chalega
    const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

    if (!process.env.GROQ_API_KEY) {
      throw new Error("Critical: GROQ_API_KEY is missing from environment variables.");
    }

    // 2. Fetch Available Services from Database
    const availableServices = await Service.find({})
      .populate('providerId', 'name email') 
      .lean();

    if (availableServices.length === 0) {
      return res.status(200).json({
        success: true,
        message: "Humare paas abhi koi services available nahi hain.",
        recommendations: []
      });
    }

    // 3. Format Services Data for LLM Context
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

    // 5. Call Groq Cloud API with the active verified model
    const chatCompletion = await groq.chat.completions.create({
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: query }
      ],
      model: 'qwen/qwen3.8-27b', 
      temperature: 0.3,
      max_tokens: 800
    });

    // 6. Extract Response Text safely
    const aiResponse = chatCompletion.choices?.[0]?.message?.content || chatCompletion.choices?.message?.content;

    // ==========================================
    // DAY 39: AI ANALYTICS LOGGING GATEWAY
    // ==========================================
    logger.info(`📊 [AI Analytics]: User ${userId} searched for: "${query}". Model: qwen/qwen3.8-27b`);

    // 7. Send Response Back to Client
    return res.status(200).json({
      success: true,
      query,
      modelUsed: 'qwen/qwen3.8-27b',
      timestamp: new Date(),
      recommendations: aiResponse
    });

  } catch (error) {
    console.error("❌ Groq Client Error Details:", error.message);
    next(error); 
  }
};
