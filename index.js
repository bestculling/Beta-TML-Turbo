import express from 'express'
import mongoose from 'mongoose';
import { GoogleGenerativeAI } from "@google/generative-ai"
import cors from 'cors'
import dotenv from 'dotenv';
import authRoutes from './routes/auth.route.js';
import cookieParser from 'cookie-parser';

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.API_KEY);

const app = express();

app.use(cors());
app.use(express.json());
app.use(cookieParser());

app.use('/api/auth', authRoutes);

mongoose
  .connect(process.env.MONGO)
  .then(() => {
    console.log('Connected to MongoDB');
  })
  .catch((err) => {
    console.log(err);
  });


app.post('/api/generate', async (req, res) => {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro-latest" });
    const prompt = `
    ${process.env.PROMPT}
    
    ฉัน: ${req.body.prompt}?`;

    const result = await model.generateContentStream(prompt);
    let text = ''
    for await (const chunk of result.stream) {
      const chunkText = chunk.text();
      console.log(chunkText)
      text += chunkText
    }

    res.json({ response: text })

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