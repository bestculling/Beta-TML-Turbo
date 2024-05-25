import { safety_types } from './safety_types.js';

export const safetySettings = [
    {
        "category": safety_types.HarmCategory.HARM_CATEGORY_DEROGATORY,
        "threshold": safety_types.HarmBlockThreshold.BLOCK_LOW_AND_ABOVE,
    },
    {
        "category": safety_types.HarmCategory.HARM_CATEGORY_VIOLENCE,
        "threshold": safety_types.HarmBlockThreshold.BLOCK_LOW_AND_ABOVE,
    },
];
