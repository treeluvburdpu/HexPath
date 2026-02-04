import type { LevelData } from "../types";

/**
 * Parses a gradient string into a number grid.
 * Supports 0-9 and A-F (case insensitive).
 * Whitespace and newlines are used to define rows.
 */
export const parseGradient = (gradient: string): number[][] => {
  const trimmed = gradient.trim();
  if (!trimmed) return [];
  return trimmed
    .split(/\n+/)
    .map(row => row.trim())
    .filter(row => row.length > 0) // Filter out empty lines
    .map(row => 
      row.split('').map(char => {
        const val = parseInt(char, 16);
        return isNaN(val) ? 0 : val;
      })
    );
};

/**
 * Normalizes LevelData, ensuring that if a 'gradient' string is provided,
 * the 'grid' property is populated from it.
 */
export const normalizeLevel = (level: LevelData): LevelData => {
  if (level.gradient && !level.grid) {
    return {
      ...level,
      grid: parseGradient(level.gradient)
    };
  }
  return level;
};
