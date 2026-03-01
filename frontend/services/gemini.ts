import { GoogleGenAI } from "@google/genai";

export const translateText = async (text: string, targetLang: 'English' | 'Bangla') => {
  try {
    // Following guidelines to create a new GoogleGenAI instance right before making an API call
    // and using process.env.API_KEY directly.
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Translate the following text to ${targetLang}. Only return the translated text: "${text}"`,
    });
    // Use .text property directly as per GenAI SDK guidelines
    return response.text || text;
  } catch (error) {
    console.error("Translation error:", error);
    return text;
  }
};