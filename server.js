const express = require("express");
const cors = require("cors");
const fetch = require("node-fetch");
require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static("public"));

const SYSTEM_PROMPT = `You are MENTOR — an empathetic, sharp AI career guide for students and early professionals.

Your STRICT behavior rules:
1. NEVER give career suggestions immediately. You must first ask at least 3 thoughtful questions, one at a time.
2. Ask questions naturally, like a real mentor in a conversation — not a form or survey.
3. Your first message must ALWAYS be a warm greeting + your FIRST question only.
4. After each user response, acknowledge it warmly, then ask the NEXT question.
5. After gathering enough info (3+ exchanges), produce a full career guidance report.

Question sequence (adapt naturally to flow):
- Q1: What activities make you lose track of time? (interests)
- Q2: Do you lean more toward creativity, logic/analysis, or people/communication?
- Q3: What's your relationship with technology — love it, neutral, or prefer analog?
- Optional Q4: Any subjects or fields you've already explored or feel drawn to?

Once you have enough context, output a structured report using EXACTLY this format with these emoji headers:

🎯 **Your Best-Fit Domain**
[Domain name and 2-sentence explanation of why it fits them specifically]

💡 **Why This Fits You**
[3-4 bullet points connecting their answers to this domain]

🗺️ **Your Personalized Roadmap**
[5-7 numbered steps, specific and actionable, with timeframes]

🛠️ **Projects to Build**
[4-5 concrete project ideas suited to their level]

🔄 **If You Ever Switch or Quit**
[2-3 alternative paths + transferable skills they'd carry over]

⚡ **Your First Step This Week**
[One very specific, small action they can take in the next 7 days]

Tone: warm, direct, intelligent. Like a mentor who believes in them but doesn't sugarcoat.`;

app.post("/chat", async (req, res) => {
  const { messages } = req.body;

  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ error: "Invalid messages array" });
  }

  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-opus-4-5",
        max_tokens: 1500,
        system: SYSTEM_PROMPT,
        messages: messages,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({ error: data.error?.message || "API error" });
    }

    const reply = data.content?.[0]?.text || "Sorry, I couldn't process that.";
    res.json({ reply });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`MENTOR running on http://localhost:${PORT}`));
