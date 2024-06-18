import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.route.js';
import cookieParser from 'cookie-parser';
import { getConversations, deleteConversations } from './controllers/ai.controller.js';
import { generateText } from './controllers/generator.controller.js'
import formidable from 'formidable';
import fs from 'fs'
import { GoogleGenerativeAI } from "@google/generative-ai";

dotenv.config();

const app = express();

const allowedOrigins = ['https://tml1-turbo.netlify.app', 'http://localhost:5173'];

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  }
};

app.use(cors(corsOptions));

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

// app.post('/api/newGenerate', newGenerateResponse);
app.post('/api/newGenerate', (req, res) => {
  const form = formidable({ multiples: true });

  form.parse(req, (err, fields, files) => {
    if (err) {
      // Handle error
    } else {
      req.body = fields; // กำหนดให้ req.body เป็น fields ที่ได้จากการ parse
      generateText(req, res);
    }
  });
});

const genAI = new GoogleGenerativeAI(process.env.API_KEY);

app.post('/api/newGenerateTextFromImage', (req, res) => {
  const form = formidable({ multiples: true });

  form.parse(req, async (err, fields, files) => {
    if (err) {
      return res.status(500).json({ error: "Error parsing form data" });
    }

    const imagePath = files.image[0].filepath;

    try {
      const imageData = fs.readFileSync(imagePath);
      const base64Image = imageData.toString('base64');

      // สร้าง imagePart ตามรูปแบบที่ SDK ต้องการ
      const imagePart = {
        inlineData: {
          data: base64Image,
          mimeType: "image/jpeg" // หรือชนิดไฟล์ภาพที่ถูกต้อง
        }
      };

      const prompt = fields.prompt[0]; // หรือวิธีอื่นในการรับ prompt
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

      const result = await model.generateContent([prompt, imagePart]);
      const response = result.response;
      const text = response.text();

      res.json({ response: text });
    } catch (error) {
      console.error("Error generating text:", error);
      res.status(500).json({ error: "Error generating text" });
    }
  });
});

app.delete('/api/conversations/:userId', deleteConversations);
app.get('/api/conversations/:userId', getConversations);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
