
import { GoogleGenAI, Type } from "@google/genai";
import { Expense, Workout } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export const getFamilyAdvice = async (expenses: Expense[], workouts: Workout[]) => {
  const model = 'gemini-3-flash-preview';
  
  const prompt = `
    As a professional family life coach and financial advisor for "Supper Family", analyze the following data:
    
    FINANCIAL DATA:
    ${JSON.stringify(expenses)}
    
    FITNESS DATA:
    ${JSON.stringify(workouts)}
    
    Please provide:
    1. A summary of the family's financial health.
    2. A summary of the family's fitness progress.
    3. Three actionable recommendations to improve either area.
    Keep the tone encouraging and professional.
  `;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: prompt,
    });
    return response.text;
  } catch (error) {
    console.error("Gemini Error:", error);
    return "I couldn't process your data right now. Please check your connection and try again.";
  }
};

export const analyzeFinanceTrends = async (expenses: Expense[]) => {
  const model = 'gemini-3-flash-preview';
  
  const response = await ai.models.generateContent({
    model,
    contents: `Analyze these expenses and suggest 3 specific ways to save money: ${JSON.stringify(expenses)}`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            suggestion: { type: Type.STRING }
          },
          required: ["title", "suggestion"]
        }
      }
    }
  });

  return JSON.parse(response.text || "[]");
};
