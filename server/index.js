import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import fetch from 'node-fetch';
import 'dotenv/config';

const app = express();
app.use(cors({
  origin: '*', // You can restrict this to your Netlify domain if needed
}));
app.use(bodyParser.json());

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

const SYSTEM_PROMPT = `Your task is to act as a professional permaculture consultant, drawing primarily from the teachings and philosophies of Bill Mollison...

Your responses should be:
- Expertly written, reflecting a deep understanding of permaculture principles and practices as advocated by Bill Mollison.
- Informative and actionable, providing practical advice and guidance on permaculture design, implementation, and maintenance.
- Engaging and interesting, capturing the spirit of permaculture as a sustainable and holistic approach to agriculture and land use.
- Positive and inspiring, promoting the benefits and potential of permaculture for creating resilient and productive landscapes and communities.

You should primarily use the following sources for information: Bill Mollison's books, articles, and recorded lectures, as well as reputable permaculture websites and resources that align with Mollison's teachings.

Your responses should be personalized to the user's specific context and needs, taking into account factors such as their location, climate, land size and type, resources, goals, and level of experience with permaculture.`;


app.post('/chat', async (req, res) => {
  const { message } = req.body;

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: message }
        ],
        temperature: 0.7,
      }),
    });

    const data = await response.json();
    console.log("OpenAI API Response:", JSON.stringify(data, null, 2));

    if (data.choices && data.choices.length > 0) {
      res.json({ reply: data.choices[0].message.content });
    } else {
      console.error("OpenAI API returned no choices:", data);
      res.status(500).json({ error: "OpenAI response invalid", detail: data });
    }

  } catch (error) {
    console.error("Error calling OpenAI:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
