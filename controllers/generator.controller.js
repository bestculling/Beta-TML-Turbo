import {
    GoogleGenerativeAI,
    HarmCategory,
    HarmBlockThreshold
} from "@google/generative-ai";
import { saveConversation } from '../utils/conversation.js';
import dotenv from 'dotenv';

dotenv.config();

const MAX_HISTORY_LENGTH = 4;
let history = [
    {
        role: "user",
        parts: [
            { text: process.env.PROMPT },
        ],
    },
    {
        role: "model",
        parts: [
            { text: "สวัสดีครับ มีอะไรให้ช่วยไหมครับ? 🤩 \n" },
        ],
    },
];

export const generateText = (req, res) => {
    // model setup
    const apiKey = process.env.API_KEY;
    const genAI = new GoogleGenerativeAI(apiKey);

    const safetySetting = [
        {
            category: HarmCategory.HARM_CATEGORY_HARASSMENT,
            threshold: HarmBlockThreshold.BLOCK_NONE,
        },
        {
            category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
            threshold: HarmBlockThreshold.BLOCK_NONE,
        },
        {
            category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
            threshold: HarmBlockThreshold.BLOCK_NONE,
        },
        {
            category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
            threshold: HarmBlockThreshold.BLOCK_NONE,
        },
        {
            category: HarmCategory.HARM_CATEGORY_UNSPECIFIED,
            threshold: HarmBlockThreshold.BLOCK_NONE,
        },
    ];

    const model = genAI.getGenerativeModel({
        model: "gemini-1.5-pro",
        safetySetting
    });

    const generationConfig = {
        temperature: 1,
        topP: 0.95,
        topK: 64,
        maxOutputTokens: 8192,
        responseMimeType: "text/plain",
    };

    // run model
    async function run() {
        try {
            const { prompt, userId } = req.body;
            const chatSession = model.startChat({
                generationConfig,
                history: history,
            });

            console.log(prompt);
            const result = await chatSession.sendMessageStream(prompt);
            const response = await result.response;
            const text = response.text();

            // จำกัดความยาวของ history
            if (history.length >= MAX_HISTORY_LENGTH) {
                history.splice(0, 2); // ลบข้อความเก่าที่สุดออก (FIFO)
                console.log(history)
            }

            history.push({
                role: "user",
                parts: [{ text: prompt }],
            });
            history.push({
                role: "model",
                parts: [{ text: text }],
            });

            await saveConversation(userId, prompt, text);
            res.json({ response: text });
        } catch (error) {
            console.error("An error occurred:", error);
            res.json({ response: "เกิดข้อผิดพลาดขณะประมวลผลคำขอของคุณ กรุณาลองใหม่อีกครั้ง" });
        }
    }

    run();
};
