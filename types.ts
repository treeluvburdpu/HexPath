export interface Coordinate {
  row: number;
  col: number;
}

export interface HexData {
  cost: number;
  coord: Coordinate;
}

export interface LevelData {
  id: string | number;
  grid: number[][]; // Flexible matrix of costs
  budget: number;
  description?: string;
  start?: Coordinate; // Optional custom start
  end?: Coordinate;   // Optional custom end
}

export interface GameLogEntry {
  levelId: string | number;
  levelName: string;
  remainingBudget: number;
  timestamp: number;
  path: Coordinate[]; // The steps taken
  levelData: LevelData; // Snapshot of the level at that time
}

export enum GameStatus {
  PLAYING,
  WON,
  LOST,
  LOADING,
  HISTORY // New status for viewing past games
}