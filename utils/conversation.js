import { Conversation } from '../model/model.js';

export const saveConversation = async (userId, prompt, response) => {
    const conversation = new Conversation({
        userId,
        prompt,
        response
    });
    await conversation.save();
};
