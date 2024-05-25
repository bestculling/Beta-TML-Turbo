import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.route.js';
import cookieParser from 'cookie-parser';
import { getConversations, newGenerateResponse } from './controllers/ai.controller.js';

dotenv.config();

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

// app.post('/api/generate', generateResponse);
app.post('/api/newGenerate', newGenerateResponse);

app.get('/api/conversations/:userId', getConversations);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
