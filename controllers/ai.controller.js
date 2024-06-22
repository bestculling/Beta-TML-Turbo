import { User, Conversation } from '../model/model.js';
import { history } from './generator.controller.js';

// Existing getConversations function
export const getConversations = async (req, res) => {
    try {
        const { userId } = req.params;
        const conversations = await Conversation.find({ userId }).sort({ createdAt: -1 });
        res.json(conversations);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'An error occurred while fetching conversations.' });
    }
};

// New deleteConversations function
export const deleteConversations = async (req, res) => {
    try {
        const { userId } = req.params;
        await Conversation.deleteMany({ userId });
        // ลบ chat ใน history ทั้งหมด
        history.splice(0, history.length);
        res.json({ message: 'All conversations have been deleted.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'An error occurred while deleting conversations.' });
    }
};
