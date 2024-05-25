import { GoogleGenerativeAI } from "@google/generative-ai";
import { safetySettings } from '../utils/safety_settings.js';
import { saveConversation } from '../utils/conversation.js';
import { getCurrentTime, checkTimePhrase } from '../utils/time.js';
import { User, Conversation } from '../model/model.js';
import { TextLoader } from "langchain/document_loaders/fs/text";

const history = [];
const currentTime = getCurrentTime();

export const newGenerateResponse = async (req, res) => {

    const { userId } = req.body;

    const genAI = new GoogleGenerativeAI(process.env.API_KEY);
    const userPrompt = req.body.prompt;

    const isNextJsRelated = /nextjs\s*15/i.test(userPrompt);
    const isPromptEngineeringRelated = /prompt\s*engineering/i.test(userPrompt);

    let fileContent = '';
    if (isNextJsRelated) {
        const loader = new TextLoader("docs/nextjs.txt");
        const docs = await loader.load();
        fileContent = docs[0].pageContent;
    } else if (isPromptEngineeringRelated) {
        const loader = new TextLoader("docs/prompt_engineering.txt");
        const docs = await loader.load();
        fileContent = docs[0].pageContent;
    }

    console.log(isNextJsRelated, isPromptEngineeringRelated);

    if (checkTimePhrase(userPrompt)) {

        history.push({
            role: "user",
            parts: [{ text: userPrompt }],
        });
        history.push({
            role: "model",
            parts: [{ text: currentTime }],
        });

        await saveConversation(userId, userPrompt, currentTime);
        res.json({ response: currentTime, history: history });
    } else {

        // สร้าง prompt ตามเนื้อหาที่เกี่ยวข้อง
        let prompt;
        if (isNextJsRelated) {
            prompt = `
                ${process.env.PROMPT}
                
                ข้อมูลเพิ่มเติมเกี่ยวกับ Next.js 14:
                ${fileContent}
                
                คำถามจากผู้ใช้:
                ${userPrompt}?`;
        } else if (isPromptEngineeringRelated) {
            prompt = `
                ${process.env.PROMPT}
                
                ข้อมูลเพิ่มเติมเกี่ยวกับ Prompt Engineering:
                ${fileContent}
                
                คำถามจากผู้ใช้:
                ${userPrompt}?`;
        } else {
            prompt = `
                ${process.env.PROMPT}
                
                ${userPrompt}?`;
        }

        async function run() {
            const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro-latest" });

            const chat = model.startChat({
                history: history,
                generationConfig: {
                    maxOutputTokens: 8000,
                },
            });

            const msg = prompt;

            const result = await chat.sendMessage(msg, { safety_settings: safetySettings });
            const response = await result.response;
            const text = response.text();

            history.push({
                role: "user",
                parts: [{ text: userPrompt }],
            });
            history.push({
                role: "model",
                parts: [{ text: text }],
            });

            if (!isNextJsRelated && !isPromptEngineeringRelated) {
                await saveConversation(userId, userPrompt, text);
            }
            // await saveConversation(userId, userPrompt, text);
            res.json({ response: text, history: history });
        }

        run();
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