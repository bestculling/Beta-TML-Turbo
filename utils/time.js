export const getCurrentTime = () => {
    const now = new Date();
    const hours = now.getHours();
    const minutes = now.getMinutes();
    return `ขณะนี้เป็นเวลา ${hours} ${minutes} นาที นะจ๊ะ 😊`;
};

export const checkTimePhrase = (sentence) => {
    const regex = /เวลา|โมง/gi;
    return regex.test(sentence);
};

export const checkDatePhrase = (sentence) => {
    const regexToday = /วันนี้/gi;
    const regexHowMuch = /เท่าไหร/gi;
    return regexToday.test(sentence) && regexHowMuch.test(sentence);
};
