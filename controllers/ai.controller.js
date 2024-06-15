import { User, Conversation } from '../model/model.js';

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
        res.json({ message: 'All conversations have been deleted.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'An error occurred while deleting conversations.' });
    }
};
