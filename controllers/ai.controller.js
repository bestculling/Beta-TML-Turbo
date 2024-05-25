import { GoogleGenerativeAI } from "@google/generative-ai";
import { safety_types } from '../safety_types.js';
import { User, Conversation } from '../model/model.js';

const history = [];

export const newGenerateResponse = async (req, res) => {
    const genAI = new GoogleGenerativeAI(process.env.API_KEY);
    const prompt = `
      ${process.env.PROMPT}
      
      ${req.body.prompt}?`;

    async function run() {
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        const chat = model.startChat({
            history: history,
            generationConfig: {
                maxOutputTokens: 100,
            },
        });

        const msg = prompt;

        const result = await chat.sendMessage(msg);
        const response = await result.response;
        const text = response.text();

        // อัปเดต history ด้วยข้อความล่าสุด
        history.push({
            role: "user",
            parts: [{ text: req.body.prompt }],
        });
        history.push({
            role: "model",
            parts: [{ text: text }],
        });

        res.json({ response: text, history: history });
    }

    run();
};


export const generateResponse = async (req, res) => {
    const genAI = new GoogleGenerativeAI(process.env.API_KEY);
    try {
        const userId = req.body.userId;
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro-latest" });
        const prompt = `
      ${process.env.PROMPT}
      
      ${req.body.prompt}?`;

        const safety_settings = [
            {
                "category": safety_types.HarmCategory.HARM_CATEGORY_DEROGATORY,
                "threshold": safety_types.HarmBlockThreshold.BLOCK_LOW_AND_ABOVE,
            },
            {
                "category": safety_types.HarmCategory.HARM_CATEGORY_VIOLENCE,
                "threshold": safety_types.HarmBlockThreshold.BLOCK_LOW_AND_ABOVE,
            },
        ];

        const result = await model.generateContentStream(prompt, { safety_settings });
        let text = '';
        for await (const chunk of result.stream) {
            const chunkText = chunk.text();
            // console.log(chunkText);
            text += chunkText;
        }

        // บันทึกประวัติการสนทนา
        const conversation = new Conversation({
            userId,
            prompt: req.body.single,
            response: text
        });
        await conversation.save();

        res.json({ response: text });
        console.log("Prompt: ", req.body.single)
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'An error occurred while processing the request.' });
    }
};

export const getConversations = async (req, res) => {
    try {
        const { userId } = req.params;
        const conversations = await Conversation.find({ userId }).sort({ createdAt: -1 });
        res.json(conversations);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'An error occurred while fetching conversations.' });
    }
}