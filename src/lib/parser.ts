import { GoogleGenerativeAI } from "@google/generative-ai";
import { BattleReportSchema } from "./schemas"; // Ваша Zod схема

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY as string);

export async function parseBattleReportWithAI(text: string) {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const prompt = `Аналізуй бойове донесення. Видай ТІЛЬКИ JSON. Текст: ${text}`;

    const result = await model.generateContent(prompt);
    const textResponse = result.response.text();
    
    // Надійне витягування JSON
    const jsonMatch = textResponse.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("JSON не знайдено");
    
    const rawJson = JSON.parse(jsonMatch[0]);
    
    // Валідація через Zod перед поверненням
    return BattleReportSchema.parse(rawJson);
  } catch (error) {
    console.error("AI Parser Error:", error);
    return null; 
  }
}