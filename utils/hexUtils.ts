import { Coordinate } from '../types';
import { GRID_ROWS, GRID_COLS } from '../constants';

// We use "Odd-r" horizontal layout (shove odd rows right)
// This visualizes well as a rectangular block.

export const isSameCoord = (a: Coordinate, b: Coordinate): boolean => {
  return a.row === b.row && a.col === b.col;
};

export const getHexNeighbors = (coord: Coordinate): Coordinate[] => {
  const { row, col } = coord;
  // Odd-r offset neighbors
  const parity = row & 1;
  const directions = [
    { r: 0, c: -1 }, // Left
    { r: 0, c: 1 },  // Right
    { r: -1, c: parity ? 0 : -1 }, // Top Left
    { r: -1, c: parity ? 1 : 0 },  // Top Right
    { r: 1, c: parity ? 0 : -1 },  // Bottom Left
    { r: 1, c: parity ? 1 : 0 },   // Bottom Right
  ];

  const neighbors: Coordinate[] = [];
  for (const dir of directions) {
    const nextRow = row + dir.r;
    const nextCol = col + dir.c;
    if (
      nextRow >= 0 && nextRow < GRID_ROWS &&
      nextCol >= 0 && nextCol < GRID_COLS
    ) {
      neighbors.push({ row: nextRow, col: nextCol });
    }
  }
  return neighbors;
};

// Calculate pixel center for a hex in Odd-r layout
export const hexToPixel = (row: number, col: number, size: number) => {
  const width = Math.sqrt(3) * size;
  const height = 2 * size;
  
  // Odd-r:
  // x = size * sqrt(3) * (col + 0.5 * (row&1))
  // y = size * 3/2 * row
  const x = size * Math.sqrt(3) * (col + 0.5 * (row & 1));
  const y = size * (3 / 2) * row;
  
  return { x, y };
};
