import { describe, it, expect } from 'vitest';
import { parseGradient } from '../utils/mapParser';

describe('mapParser', () => {
  it('parses a simple square gradient string', () => {
    const gradient = `
      12
      34
    `;
    const grid = parseGradient(gradient);
    expect(grid).toEqual([
      [1, 2],
      [3, 4]
    ]);
  });

  it('parses hexadecimal costs', () => {
    const gradient = `
      9A
      BF
    `;
    const grid = parseGradient(gradient);
    expect(grid).toEqual([
      [9, 10],
      [11, 15]
    ]);
  });

  it('handles jagged rows', () => {
    const gradient = `
      123
      45
      6
    `;
    const grid = parseGradient(gradient);
    expect(grid).toEqual([
      [1, 2, 3],
      [4, 5],
      [6]
    ]);
  });

  it('handles empty input', () => {
    expect(parseGradient('')).toEqual([]);
  });
});
