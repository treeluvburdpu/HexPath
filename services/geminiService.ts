import { GoogleGenAI, Type } from "@google/genai";
import { LevelData } from "../types";

export const generateLevel = async (difficulty: number = 1): Promise<LevelData> => {
  if (!process.env.API_KEY) {
    throw new Error("API Key missing");
  }

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  const systemInstruction = `
    You are a game designer for a 5-year-old's puzzle game. 
    Create a hexagonal grid pathfinding level.
    The grid can be slightly jagged (rows having different counts) or rectangular (5x5, 6x5, etc).
    The grid contains integers representing movement cost (1-8).
    
    You must provide:
    1. grid: 2D array of costs.
    2. start: {row, col} coordinate.
    3. end: {row, col} coordinate.
    4. budget: Tight but fair budget.
    
    Rules:
    - start and end values in the grid MUST be 0.
    - There MUST be a valid path from Start to End.
  `;

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    config: {
      systemInstruction: systemInstruction,
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          grid: {
            type: Type.ARRAY,
            items: {
              type: Type.ARRAY,
              items: { type: Type.INTEGER }
            }
          },
          start: {
            type: Type.OBJECT,
            properties: {
              row: { type: Type.INTEGER },
              col: { type: Type.INTEGER }
            }
          },
          end: {
            type: Type.OBJECT,
            properties: {
              row: { type: Type.INTEGER },
              col: { type: Type.INTEGER }
            }
          },
          budget: { type: Type.INTEGER },
          description: { type: Type.STRING }
        },
        required: ["grid", "budget", "start", "end"]
      }
    },
    contents: `Generate a level with difficulty ${difficulty} (1-5 scale).`,
  });

  if (!response.text) {
    throw new Error("No response from AI");
  }

  const data = JSON.parse(response.text);
  
  // Sanity check for start/end
  if (data.grid[data.start.row]) data.grid[data.start.row][data.start.col] = 0;
  if (data.grid[data.end.row]) data.grid[data.end.row][data.end.col] = 0;

  return {
    id: `ai-${Date.now()}`,
    grid: data.grid,
    budget: data.budget,
    start: data.start,
    end: data.end,
    description: data.description || "AI Mystery Map"
  };
};