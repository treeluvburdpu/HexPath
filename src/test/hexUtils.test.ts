import { describe, it, expect } from 'vitest';
import { getHexNeighbors, isSameCoord } from '../utils/hexUtils';

describe('hexUtils', () => {
  const grid = [
    [1, 1, 1],
    [1, 1, 1],
    [1, 1, 1]
  ];

  it('identifies same coordinates', () => {
    expect(isSameCoord({ row: 0, col: 0 }, { row: 0, col: 0 })).toBe(true);
    expect(isSameCoord({ row: 0, col: 0 }, { row: 1, col: 0 })).toBe(false);
  });

  it('gets neighbors for even row (row 0)', () => {
    const neighbors = getHexNeighbors({ row: 0, col: 1 }, grid);
    // Even row neighbors for (0, 1) should be (0, 0), (0, 2), (-1, 0), (-1, 1), (1, 0), (1, 1)
    // Clipped to grid: (0, 0), (0, 2), (1, 0), (1, 1)
    expect(neighbors).toContainEqual({ row: 0, col: 0 });
    expect(neighbors).toContainEqual({ row: 0, col: 2 });
    expect(neighbors).toContainEqual({ row: 1, col: 0 });
    expect(neighbors).toContainEqual({ row: 1, col: 1 });
    expect(neighbors.length).toBe(4);
  });

  it('gets neighbors for odd row (row 1)', () => {
    const neighbors = getHexNeighbors({ row: 1, col: 1 }, grid);
    // Odd row neighbors for (1, 1) should be (1, 0), (1, 2), (0, 1), (0, 2), (2, 1), (2, 2)
    // Clipped to grid: (1, 0), (1, 2), (0, 1), (0, 2), (2, 1), (2, 2)
    expect(neighbors).toContainEqual({ row: 1, col: 0 });
    expect(neighbors).toContainEqual({ row: 1, col: 2 });
    expect(neighbors).toContainEqual({ row: 0, col: 1 });
    expect(neighbors).toContainEqual({ row: 0, col: 2 });
    expect(neighbors).toContainEqual({ row: 2, col: 1 });
    expect(neighbors).toContainEqual({ row: 2, col: 2 });
    expect(neighbors.length).toBe(6);
  });
});
