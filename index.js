const express = require('express');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const app = express();
app.use(express.json());

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

app.post('/assess-risk', async (req, res) => {
  try {
    console.log("Received request:", req.body); // Log for debugging
    const merchant = req.body;
    
    const prompt = `
      You are a Risk Officer. Evaluate this merchant.
      Name: ${merchant.business_name}
      Industry: ${merchant.industry}
      Revenue: ${merchant.revenue}
      Years: ${merchant.years}

      Rules:
      - Crypto/Gambling = High Risk (Score > 90)
      - Years < 1 = Medium Risk (Score > 60)
      - Otherwise = Low Risk (Score < 20)

      Output strictly valid JSON:
      { "risk_score": number, "decision": "APPROVED" or "MANUAL_REVIEW", "reason": "string" }
    `;

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    // Clean markdown
    const cleanJson = text.replace(/```json/g, '').replace(/```/g, '').trim();
    res.json(JSON.parse(cleanJson));

  } catch (error) {
    console.error("Proxy Error:", error);
    res.status(500).json({ error: error.message });
  }
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Proxy listening on port ${port}`);
});
