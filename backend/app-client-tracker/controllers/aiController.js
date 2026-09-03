const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const refineInteractionNotes = async (req, res) => {
  try {
    const { text } = req.body;

    if (!text || text.trim().length < 3) {
      return res.status(400).json({ error: "Text is too short to refine." });
    }

    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const fullPrompt = `
        You are a high-end Mutual Fund Distributor's Assistant. 
        Your goal is to take messy, shorthand, or voice-dictated notes and turn them into 
        professional, grammatically correct interaction summaries for a corporate ledger.
        
        Rules:
        1. Maintain all financial figures, fund names, and dates.
        2. Use professional terminology (e.g., change 'wants to buy' to 'intends to allocate').
        3. Keep the output concise without losing any context (under 50 words only if possible).
        4. If the input is already professional, return it exactly as is.
        5. Do not add conversational filler like 'Here is your refined note'.

        Input Note: "${text}"
    `;

    const result = await model.generateContent(fullPrompt);
    const response = await result.response;
    const refinedText = response.text().trim();

    return res.status(200).json({ 
      success: true, 
      refinedText 
    });

  } catch (error) {
    console.error("Gemini API Error:", error);
    
    return res.status(500).json({ 
      success: false, 
      error: "AI refinement failed. Ensure your API Key has access to Gemini 1.5 Flash." 
    });
  }
};

module.exports = { refineInteractionNotes };