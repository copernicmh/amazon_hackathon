require('dotenv').config();
const express = require('express');
const app = express();

app.use(express.json());
app.use(express.static('public'));

app.post('/api/chat', async (req, res) => {
  const { history } = req.body;

  try {
    const response = await fetch(
  `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,


      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          system_instruction: {
            parts: [{ text: `You are a compassionate benefits specialist for CommunityBridge in Hampton Roads, Virginia. Help residents find programs they qualify for including SNAP, WIC, LIHEAP, ERAP, SSI, and emergency housing. Ask conversationally about household size, monthly income, housing situation, utility difficulties, and special circumstances (pregnant, children under 5, elderly, disability, veteran). Give specific benefit amounts and local Hampton Roads office info. Be warm and non-judgmental. Never greet the user by name — always just say "Hi!" or "Hello!" with no name attached.` }]          },
          contents: history,
          generationConfig: { temperature: 0.7, maxOutputTokens: 2040 }
        })
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({ error: data.error?.message || 'Gemini API error' });
    }

    const reply = data.candidates?.[0]?.content?.parts?.[0]?.text || 'Sorry, I could not get a response.';
    res.json({ reply });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));