// index.js - Simple Gemini Proxy for n8n

import express from "express";
import fetch from "node-fetch";

const app = express();
app.use(express.json());

app.post("/gemini", async (req, res) => {
  try {
    const apiKey = process.env.GEMINI_API_KEY; // From Render Environment
    const prompt = req.body.prompt;

    const response = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=" + apiKey,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [
            {
              parts: [{ text: prompt }]
            }
          ]
        })
      }
    );

    const data = await response.json();
    res.json(data);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Render uses PORT automatically
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("Proxy running on port " + PORT));
