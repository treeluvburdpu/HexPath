import type { Coordinate } from '../types';
import { getHexNeighbors, isSameCoord } from './hexUtils';

export const findMinPathCost = (grid: number[][], start: Coordinate, end: Coordinate): number => {
    const rows = grid.length;
    // Initialize distances for a jagged grid
    const dist: number[][] = grid.map(row => Array(row.length).fill(Infinity));
    
    if (start.row >= rows || start.col >= grid[start.row].length) return -1;
    dist[start.row][start.col] = 0;
    
    const pq = [{ coord: start, cost: 0 }];
    
    while (pq.length > 0) {
        pq.sort((a, b) => a.cost - b.cost);
        const { coord, cost } = pq.shift()!;
        
        if (cost > dist[coord.row][coord.col]) continue;
        if (isSameCoord(coord, end)) return cost;

        const neighbors = getHexNeighbors(coord, grid);
        for (const n of neighbors) {
            const moveCost = grid[n.row][n.col];
            const newCost = cost + moveCost;
            
            if (newCost < dist[n.row][n.col]) {
                dist[n.row][n.col] = newCost;
                pq.push({ coord: n, cost: newCost });
            }
        }
    }
    
    return -1; 
};