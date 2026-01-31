import { GoogleGenAI, Type } from "@google/genai";
import { LevelData } from "../types";

export const generateLevel = async (difficulty: number = 1): Promise<LevelData> => {
  if (!process.env.API_KEY) {
    throw new Error("API Key missing");
  }

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  const systemInstruction = `
    You are a game designer for a 5-year-old's puzzle game. 
    Create a 5x5 hexagonal grid pathfinding level.
    The grid contains integers representing movement cost.
    Start is at bottom-left [4,0] (value must be 0).
    End is at top-right [0,4] (value must be 0).
    
    Rules:
    - Costs should be between 1 and 8 (except start/end).
    - There MUST be at least one valid path from Start to End with total cost <= budget.
    - The budget should be tight but fair for a child (allow for 2-3 extra cost mistakes).
    - Higher difficulty means tighter budget and more obstacles (high cost cells).
  `;

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    config: {
      systemInstruction: systemInstruction,
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          grid: {
            type: Type.ARRAY,
            description: "5x5 integer array. grid[0][0] is top left.",
            items: {
              type: Type.ARRAY,
              items: { type: Type.INTEGER }
            }
          },
          budget: { type: Type.INTEGER, description: "Total budget available." },
          description: { type: Type.STRING, description: "Short fun name for the level." }
        },
        required: ["grid", "budget"]
      }
    },
    contents: `Generate a level with difficulty ${difficulty} (1-5 scale).`,
  });

  if (!response.text) {
    throw new Error("No response from AI");
  }

  const data = JSON.parse(response.text);
  
  // Force start/end to 0 just in case AI missed it
  if (data.grid && data.grid.length === 5) {
    data.grid[4][0] = 0;
    data.grid[0][4] = 0;
  }

  return {
    id: `ai-${Date.now()}`,
    grid: data.grid,
    budget: data.budget,
    description: data.description || "AI Mystery Map"
  };
};
