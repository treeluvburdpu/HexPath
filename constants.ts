import { LevelData } from './types';

export const GRID_ROWS = 5;
export const GRID_COLS = 5;

// Start: Bottom Left (Row 4, Col 0)
// End: Top Right (Row 0, Col 4)
export const START_POS = { row: 4, col: 0 };
export const END_POS = { row: 0, col: 4 };

export const INITIAL_LEVELS: LevelData[] = [
  {
    id: 1,
    description: "Let's start!",
    budget: 10,
    grid: [
      [3, 2, 3, 2, 0], // Row 0 (Top) - End at [0,4]
      [2, 1, 4, 1, 1],
      [2, 2, 2, 4, 2],
      [1, 5, 1, 1, 2],
      [0, 1, 2, 3, 3]  // Row 4 (Bottom) - Start at [4,0]
    ]
  },
  {
    id: 2,
    description: "Watch your step",
    budget: 15,
    grid: [
      [4, 4, 3, 2, 0],
      [3, 5, 2, 3, 2],
      [2, 2, 1, 5, 3],
      [3, 1, 6, 1, 2],
      [0, 2, 1, 2, 4]
    ]
  },
  {
    id: 3,
    description: "A longer path",
    budget: 20,
    grid: [
      [5, 1, 1, 1, 0],
      [4, 2, 5, 2, 2],
      [3, 1, 6, 4, 1],
      [2, 2, 2, 1, 2],
      [0, 5, 1, 2, 3]
    ]
  }
];
