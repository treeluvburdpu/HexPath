import type { Coordinate } from '../types';

export const isSameCoord = (a: Coordinate, b: Coordinate): boolean => {
  return a.row === b.row && a.col === b.col;
};

export const getHexNeighbors = (coord: Coordinate | undefined, grid: number[][]): Coordinate[] => {
  if (!coord) return [];
  
  const { row, col } = coord;
  const parity = row & 1;
  const directions = [
    { r: 0, c: -1 }, 
    { r: 0, c: 1 },  
    { r: -1, c: parity ? 0 : -1 }, 
    { r: -1, c: parity ? 1 : 0 },  
    { r: 1, c: parity ? 0 : -1 },  
    { r: 1, c: parity ? 1 : 0 },   
  ];

  const neighbors: Coordinate[] = [];
  const rows = grid.length;

  for (const dir of directions) {
    const nextRow = row + dir.r;
    const nextCol = col + dir.c;
    
    if (nextRow >= 0 && nextRow < rows) {
      const rowCols = grid[nextRow].length;
      if (nextCol >= 0 && nextCol < rowCols) {
        neighbors.push({ row: nextRow, col: nextCol });
      }
    }
  }
  return neighbors;
};

export const hexToPixel = (row: number, col: number, size: number) => {
  // Odd-r:
  const x = size * Math.sqrt(3) * (col + 0.5 * (row & 1));
  const y = size * (3 / 2) * row;
  return { x, y };
};