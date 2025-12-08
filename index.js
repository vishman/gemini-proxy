import express from "express";
import fetch from "node-fetch";

const app = express();
app.use(express.json());

// 1) TEST ROUTE — this is the one we are checking
app.get("/test", (req, res) => {
  res.send("Proxy is running!");
});

// 2) GEMINI PROXY ENDPOINT
app.post("/gemini", async (req, res) => {
  try {
    const response = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=" +
        process.env.GEMINI_API_KEY,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(req.body),
      }
    );

    const data = await response.json();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 3) START SERVER
app.listen(10000, () => console.log("Proxy running on port 10000"));
