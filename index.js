import express from 'express';
import mongoose from 'mongoose';
import { GoogleGenerativeAI } from "@google/generative-ai";
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.route.js';
import cookieParser from 'cookie-parser';
import { User, Conversation } from './model/model.js';

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
    const userId = req.body.userId;  // ควรจะได้ userId จาก request body
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro-latest" });
    const prompt = `
    ${process.env.PROMPT}
    
    ${req.body.prompt}?`;

    const result = await model.generateContentStream(prompt);
    let text = '';
    for await (const chunk of result.stream) {
      const chunkText = chunk.text();
      // console.log(chunkText);
      text += chunkText;
    }

    console.log("Prompt: ", req.body.single)

    // บันทึกประวัติการสนทนา
    const conversation = new Conversation({
      userId,
      prompt: req.body.single,
      response: text
    });
    await conversation.save();

    res.json({ response: text });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'An error occurred while processing the request.' });
  }
});

app.get('/api/conversations/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const conversations = await Conversation.find({ userId }).sort({ createdAt: -1 });
    res.json(conversations);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'An error occurred while fetching conversations.' });
  }
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
