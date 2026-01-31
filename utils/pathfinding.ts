import { GRID_ROWS, GRID_COLS, START_POS, END_POS } from '../constants';
import { getHexNeighbors, isSameCoord } from './hexUtils';

export const findMinPathCost = (grid: number[][]): number => {
    // Dijkstra's Algorithm
    const dist: number[][] = Array(GRID_ROWS).fill(0).map(() => Array(GRID_COLS).fill(Infinity));
    dist[START_POS.row][START_POS.col] = 0;
    
    // Priority Queue (simple array for small grid)
    const pq = [{ coord: START_POS, cost: 0 }];
    
    while (pq.length > 0) {
        // Sort to simulate priority queue
        pq.sort((a, b) => a.cost - b.cost);
        const { coord, cost } = pq.shift()!;
        
        // If we found a cheaper way already, skip
        if (cost > dist[coord.row][coord.col]) continue;
        
        // Reached end?
        if (isSameCoord(coord, END_POS)) return cost;

        const neighbors = getHexNeighbors(coord);
        for (const n of neighbors) {
            // Cost to enter neighbor
            const moveCost = grid[n.row][n.col];
            const newCost = cost + moveCost;
            
            if (newCost < dist[n.row][n.col]) {
                dist[n.row][n.col] = newCost;
                pq.push({ coord: n, cost: newCost });
            }
        }
    }
    
    return -1; // Path not found
};