import { GoogleGenerativeAI } from "@google/generative-ai";
import { safety_types } from '../utils/safety_types.js';
import { User, Conversation } from '../model/model.js';

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
            text += chunkText;
        }

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
