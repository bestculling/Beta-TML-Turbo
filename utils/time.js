export const getCurrentTime = () => {
    const now = new Date();
    return now.toLocaleTimeString();
};

export const checkTimePhrase = (sentence) => {
    const regex = /เวลา|โมง/gi;
    return regex.test(sentence);
};
