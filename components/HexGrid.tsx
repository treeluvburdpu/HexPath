import React, { useRef, useState, useEffect } from 'react';
import Hexagon from './Hexagon';
import { LevelData, Coordinate } from '../types';
import { getHexNeighbors, isSameCoord } from '../utils/hexUtils';
import { START_POS, END_POS, GRID_ROWS, GRID_COLS } from '../constants';

interface HexGridProps {
  levelData: LevelData;
  currentPath: Coordinate[];
  onCellClick: (coord: Coordinate, cost: number) => void;
  showHeatmap: boolean;
  gameStatus: any;
}

const HexGrid: React.FC<HexGridProps> = ({ 
  levelData, 
  currentPath, 
  onCellClick, 
  showHeatmap 
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [hexSize, setHexSize] = useState(40);

  // Responsive sizing
  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current) {
        const { width, height } = containerRef.current.getBoundingClientRect();
        
        // We want the grid to fill the container as much as possible
        // The container already has padding applied by the parent (10% or 20%)
        // So we just fit into width/height here.
        
        const estWidth = width / (GRID_COLS * 1.8);
        const estHeight = height / (GRID_ROWS * 1.6);
        setHexSize(Math.min(estWidth, estHeight));
      }
    };
    
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const cells = [];
  const lastPathCell = currentPath[currentPath.length - 1];

  for (let r = 0; r < GRID_ROWS; r++) {
    for (let c = 0; c < GRID_COLS; c++) {
      const coord = { row: r, col: c };
      const isStart = isSameCoord(coord, START_POS);
      const isEnd = isSameCoord(coord, END_POS);
      const cost = levelData.grid[r][c];
      
      const isSelected = currentPath.some(p => isSameCoord(p, coord));
      
      // Calculate walkability
      const neighbors = getHexNeighbors(lastPathCell);
      const isNeighbor = neighbors.some(n => isSameCoord(n, coord));
      const isInPath = currentPath.some(p => isSameCoord(p, coord));
      
      // Walkable if:
      // 1. It is a valid next step (neighbor of current tip, and not already in path)
      // 2. It is an existing path step (backtracking), but not the start position
      const isWalkable = (isNeighbor && !isInPath) || (isInPath && !isStart);

      cells.push(
        <Hexagon
          key={`${r}-${c}`}
          data={{ cost, coord }}
          size={hexSize}
          isSelected={isSelected}
          isStart={isStart}
          isEnd={isEnd}
          isWalkable={isWalkable}
          showHeatmap={showHeatmap}
          onClick={() => onCellClick(coord, cost)}
        />
      );
    }
  }

  const svgWidth = (GRID_COLS + 0.5) * Math.sqrt(3) * hexSize + hexSize;
  const svgHeight = (GRID_ROWS * 1.5 + 0.5) * hexSize + hexSize;

  return (
    <div ref={containerRef} className="w-full h-full flex justify-center items-center z-10 relative">
      <svg
        width={svgWidth}
        height={svgHeight}
        viewBox={`-${hexSize} -${hexSize} ${svgWidth} ${svgHeight}`}
        className="overflow-visible"
        style={{ maxWidth: '100%', maxHeight: '100%' }}
      >
        {cells}
      </svg>
    </div>
  );
};

export default HexGrid;