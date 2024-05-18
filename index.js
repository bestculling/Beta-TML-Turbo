const express = require('express')
const { GoogleGenerativeAI } = require("@google/generative-ai");
const cors = require('cors');
require('dotenv').config()

const genAI = new GoogleGenerativeAI(process.env.API_KEY);

const app = express();
app.use(cors()); 
app.use(express.json());

app.post('/api/generate', async (req, res) => {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro-latest" });
    const prompt = `
    ${process.env.PROMPT}
    Me: ${req.body.prompt}?
    TML 🚀:`;

    console.log(prompt)

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    res.json({ response: text });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'An error occurred while processing the request.' });
  }
});

app.post('/api/pin', (req, res) => {

  if (req.body.pin != process.env.PIN) {
    return res.status(400).json({ error: 'PIN is required' });
  }
  res.json({ message: 'PIN set successfully' });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});