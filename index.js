/* FILE: index.js
   ES Module version compatible with your package.json
*/
import express from 'express';
import { GoogleGenerativeAI } from '@google/generative-ai';

const app = express();
app.use(express.json());

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

app.post('/assess-risk', async (req, res) => {
  try {
    console.log("Processing Request for:", req.body.business_name);
    
    const merchant = req.body;
    const prompt = `
      Act as a Risk Compliance Officer. Evaluate this merchant:
      - Business: ${merchant.business_name}
      - Industry: ${merchant.industry}
      - Revenue: ${merchant.revenue}
      - Years: ${merchant.years}

      Rules:
      1. If Industry is 'Cryptocurrency' or 'Gambling' -> Score > 90 (High Risk).
      2. If Years < 1 -> Score > 60 (Medium Risk).
      3. Otherwise -> Score < 20 (Low Risk).

      Return ONLY valid JSON:
      { "risk_score": number, "decision": "APPROVED" or "MANUAL_REVIEW", "reason": "short explanation" }
    `;

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    // Clean up JSON if Gemini adds markdown formatting
    const cleanJson = text.replace(/^```json/g, '').replace(/```$/g, '').trim();
    
    res.json(JSON.parse(cleanJson));

  } catch (error) {
    console.error("Gemini Error:", error);
    res.status(500).json({ error: error.message });
  }
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
