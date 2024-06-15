import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.route.js';
import cookieParser from 'cookie-parser';
import { getConversations, deleteConversations } from './controllers/ai.controller.js';
import { generateText } from './controllers/generator.controller.js'

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
app.post('/api/newGenerate', generateText);
app.delete('/api/conversations/:userId', deleteConversations);
app.get('/api/conversations/:userId', getConversations);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
