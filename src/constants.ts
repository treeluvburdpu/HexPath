import type { LevelData } from './types';

// Default Fallbacks if not provided in level data
export const DEFAULT_START = (rows: number) => ({ row: rows - 1, col: 0 });
export const DEFAULT_END = (cols: number) => ({ row: 0, col: cols - 1 });

export const INITIAL_LEVELS: LevelData[] = [
  {
    id: 1,
    description: "The Beginning",
    budget: 10,
    grid: [
      [3, 2, 3, 2, 0], 
      [2, 1, 4, 1, 1],
      [2, 2, 2, 4, 2],
      [1, 5, 1, 1, 2],
      [0, 1, 2, 3, 3] 
    ],
    start: { row: 4, col: 0 },
    end: { row: 0, col: 4 }
  },
  {
    id: 2,
    description: "The Walkabout",
    budget: 10,
    grid: [
      [3, 2, 3, 2, 0,1,2,3], 
      [2, 1, 4, 1, 1,2,1,1],
      [2, 2, 2, 4, 2,3],
      [1, 5, 1, 1, 2,0,1,0],
      [0, 1, 2, 3, 3,1,1,1] 
    ],
    start: { row: 4, col: 0 },
    end: { row: 0, col: 4 }
  },
  {
    id: 3,
    description: "Jagged Valley",
    budget: 15,
    grid: [
      [4, 4, 3, 2, 0],
      [3, 5, 2], // Jagged row
      [2, 2, 1, 5, 3],
      [3, 1, 6, 1],      // Jagged row
      [0, 2, 1, 2, 4]
    ],
    start: { row: 4, col: 0 },
    end: { row: 0, col: 4 }
  },
  {
    id: 4,
    description: "The Deep Woods",
    budget: 20,
    grid: [
      [5, 1, 1, 1, 0, 2],
      [4, 2, 5, 2, 2, 1],
      [3, 1, 6, 4, 1, 3],
      [2, 2, 2, 1, 2, 2],
      [0, 5, 1, 2, 3, 4]
    ],
    start: { row: 4, col: 0 },
    end: { row: 0, col: 4 }
  }
];