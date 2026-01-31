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
  grid: number[][]; // 5x5 matrix of costs
  budget: number;
  description?: string;
}

export enum GameStatus {
  PLAYING,
  WON,
  LOST,
  LOADING
}
