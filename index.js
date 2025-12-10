import express from 'express';
import { GoogleGenerativeAI } from '@google/generative-ai';

const app = express();
app.use(express.json());

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

app.post('/assess-risk', async (req, res) => {
  try {
    console.log("Received request for:", req.body.business_name);
    const merchant = req.body;
    
    // CHANGE: Using 'gemini-pro' which is the standard stable model
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });

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

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    // Clean up JSON formatting
    const cleanJson = text.replace(/^```json/g, '').replace(/```$/g, '').trim();
    
    res.json(JSON.parse(cleanJson));

  } catch (error) {
    console.error("Gemini Error:", error);
    // Respond with the specific error message to see it in n8n
    res.status(500).json({ error: error.message });
  }
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
