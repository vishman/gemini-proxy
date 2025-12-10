import express from 'express';
import { GoogleGenerativeAI } from '@google/generative-ai';

const app = express();
app.use(express.json());

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// CANDIDATES: The code will try these in order until one works.
const MODEL_CANDIDATES = [
  "gemini-1.5-flash",
  "gemini-1.5-flash-latest",
  "gemini-pro",
  "gemini-1.0-pro",
  "gemini-1.5-pro"
];

app.post('/assess-risk', async (req, res) => {
  try {
    console.log("------------------------------------------------");
    console.log("Received Request for:", req.body.business_name);
    
    const merchant = req.body;
    const prompt = `
      Act as a Risk Compliance Officer. Evaluate: 
      Business: ${merchant.business_name}, Industry: ${merchant.industry}, Revenue: ${merchant.revenue}, Years: ${merchant.years}
      
      Rules:
      1. Crypto/Gambling = High Risk.
      2. Years < 1 = Medium Risk.
      3. Else = Low Risk.

      Return ONLY valid JSON:
      { "risk_score": number, "decision": "APPROVED" or "MANUAL_REVIEW", "reason": "short explanation" }
    `;

    // SMART LOOP: Try models until one succeeds
    for (const modelName of MODEL_CANDIDATES) {
      try {
        console.log(`Attempting model: ${modelName}...`);
        const model = genAI.getGenerativeModel({ model: modelName });
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();
        
        console.log(`✅ SUCCESS with ${modelName}!`);
        
        const cleanJson = text.replace(/^```json/g, '').replace(/```$/g, '').trim();
        return res.json(JSON.parse(cleanJson)); // Exit loop and return data
        
      } catch (innerError) {
        console.warn(`❌ Failed ${modelName}: ${innerError.message}`);
        // Continue to the next model in the list
      }
    }

    // If we get here, ALL models failed
    throw new Error("All model candidates failed. Check API Key permissions.");

  } catch (error) {
    console.error("FATAL ERROR:", error);
    res.status(500).json({ error: error.message });
  }
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
