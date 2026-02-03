import type { LevelData } from './types';

// Default Fallbacks if not provided in level data
export const DEFAULT_START = (rows: number) => ({ row: rows - 1, col: 0 });
export const DEFAULT_END = (cols: number) => ({ row: 0, col: cols - 1 });

export const INITIAL_LEVELS: LevelData[] = [
  {
    id: 1,
    description: "The Beginning",
    budget: 10,
    gradient: `
      32320
      21411
      22242
      15112
      01233
    `,
    start: { row: 4, col: 0 },
    end: { row: 0, col: 4 }
  },
  {
    id: 2,
    description: "The Walkabout",
    budget: 10,
    gradient: `
      32320123
      21411211
      222423
      15112010
      01233111
    `,
    start: { row: 4, col: 0 },
    end: { row: 0, col: 4 }
  },
  {
    id: 3,
    description: "Jagged Valley",
    budget: 15,
    gradient: `
      44320
      352
      22153
      3161
      02124
    `,
    start: { row: 4, col: 0 },
    end: { row: 0, col: 4 }
  },
  {
    id: 4,
    description: "The Deep Woods",
    budget: 20,
    gradient: `
      511102
      425221
      316413
      222122
      051234
    `,
    start: { row: 4, col: 0 },
    end: { row: 0, col: 4 }
  }
];
