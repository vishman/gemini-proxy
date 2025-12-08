import express from "express";
import fetch from "node-fetch";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(express.json());

// 🔹 TEST ROUTE — WORKS IN YOUR BROWSER
app.get("/test", (req, res) => {
  res.json({ status: "OK", message: "Your Gemini proxy is running!" });
});

// 🔹 MAIN PROXY ROUTE — n8n will use this
app.post("/gemini", async (req, res) => {
  try {
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return res.status(500).json({ error: "API key missing in environment variables" });
    }

    const response = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=" + apiKey,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(req.body),
      }
    );

    const data = await response.json();
    res.json(data);

  } catch (err) {
    console.error("Proxy error:", err);
    res.status(500).json({ error: "Proxy failed", details: err.message });
  }
});

// Render provides PORT automatically
const PORT = process.env.PORT || 10000;

app.listen(PORT, () => {
  console.log(`Proxy running on port ${PORT}`);
});

export default app;
