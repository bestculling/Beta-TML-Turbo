// export const getCurrentTime = () => {
//     const now = new Date();
//     return now.toLocaleTimeString();
// };

export const getCurrentTime = () => {
    const now = new Date();
    const hours = now.getHours();
    const minutes = now.getMinutes();

    const thaiNumber = (num) => num.toString().replace(/\d/g, d => '๐๑๒๓๔๕๖๗๘๙'[d]);

    const formatHours = (h) => {
        if (h === 0) return 'เที่ยงคืน';
        if (h === 12) return 'เที่ยง';
        return h > 12 ? `บ่าย ${thaiNumber(h - 12)}` : `ตอนเช้า ${thaiNumber(h)}`;
    };

    const period = hours < 12 ? 'โมงเช้า' : (hours === 12 ? 'นาฬิกา' : (hours < 18 ? 'โมงเย็น' : 'โมงค่ำ'));

    const emojis = {
        'เที่ยงคืน': '🌙',
        'เที่ยง': '☀️',
        'โมงเช้า': '🌄',
        'โมงเย็น': '🌆',
        'โมงค่ำ': '🌃'
    };

    return `ขณะนี้เป็นเวลา ${formatHours(hours)} ${thaiNumber(minutes)} นาที ${period} ${emojis[period]} นะจ๊ะ 😊`;
};


export const checkTimePhrase = (sentence) => {
    const regex = /เวลา|โมง/gi;
    return regex.test(sentence);
};
