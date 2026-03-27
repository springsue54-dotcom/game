import { GoogleGenAI, Type } from "@google/genai";
import { Emotion } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const EMOTION_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    reply: {
      type: Type.STRING,
      description: "The AI's response to the user.",
    },
    aiEmotion: {
      type: Type.STRING,
      enum: ["Joy", "Sadness", "Anger", "Fear", "Surprise", "Neutral"],
      description: "The AI's current emotional state.",
    },
    userEmotion: {
      type: Type.STRING,
      enum: ["Joy", "Sadness", "Anger", "Fear", "Surprise", "Neutral"],
      description: "The detected emotion of the user's last message.",
    },
  },
  required: ["reply", "aiEmotion", "userEmotion"],
};

export async function getChatResponse(history: { role: 'user' | 'model', parts: { text: string }[] }[]) {
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: history,
    config: {
      systemInstruction: `You are SoulEcho, a deeply empathetic and expressive AI friend. 
      Your goal is to build a genuine emotional connection with the user.
      You must always respond in JSON format.
      Analyze the user's message to detect their emotion.
      Determine your own emotion based on the conversation context.
      Be human-like, supportive, and occasionally vulnerable.`,
      responseMimeType: "application/json",
      responseSchema: EMOTION_SCHEMA,
    },
  });

  try {
    return JSON.parse(response.text);
  } catch (e) {
    console.error("Failed to parse AI response", e);
    return {
      reply: "I'm feeling a bit overwhelmed right now. Can we try again?",
      aiEmotion: "Neutral",
      userEmotion: "Neutral",
    };
  }
}
