import express from "express";
import fetch from "node-fetch";
import dotenv from "dotenv";
import cors from "cors";

dotenv.config();
const app = express();

app.use(express.json());
app.use(cors());

// ---------------------------
// 🔹 HEALTH CHECK ROUTE
// ---------------------------
app.get("/test", (req, res) => {
  res.json({ status: "OK", message: "Your Gemini proxy is running on Render!" });
});

// ---------------------------
// 🔹 MAIN GEMINI PROXY ROUTE
// ---------------------------
app.post("/gemini", async (req, res) => {
  try {
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return res.status(500).json({
        error: "API key missing in environment variables",
      });
    }

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(req.body),
    });

    const data = await response.json();
    res.json(data);
  } catch (err) {
    console.error("Proxy Error:", err);
    res.status(500).json({
      error: "Proxy failed",
      details: err.message,
    });
  }
});

// ---------------------------
// 🔹 PORT HANDLER
// ---------------------------
const PORT = process.env.PORT || 10000;

app.listen(PORT, () => {
  console.log(`Gemini Proxy running on Render, port: ${PORT}`);
});

export default app;
