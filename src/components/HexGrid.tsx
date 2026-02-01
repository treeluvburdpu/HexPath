import React, { useRef, useState, useEffect } from 'react';
import Hexagon from './Hexagon';
import type { LevelData, Coordinate, GameStatus } from '../types';
import { getHexNeighbors, isSameCoord, hexToPixel } from '../utils/hexUtils';
import { DEFAULT_START, DEFAULT_END } from '../constants';

interface HexGridProps {
  levelData: LevelData;
  currentPath: Coordinate[];
  onCellClick: (coord: Coordinate, cost: number) => void;
  viewMode: 'none' | 'heat' | 'topo';
  gameStatus: GameStatus;
}

const HexGrid: React.FC<HexGridProps> = ({ 
  levelData, 
  currentPath, 
  onCellClick, 
  viewMode,
  gameStatus
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [hexSize, setHexSize] = useState(40);

  const startPos = levelData.start || DEFAULT_START(levelData.grid.length);
  const maxColsAcrossGrid = Math.max(...levelData.grid.map(r => r.length), 1);
  const endPos = levelData.end || DEFAULT_END(maxColsAcrossGrid);

  // Responsive sizing
  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current) {
        const { width, height } = containerRef.current.getBoundingClientRect();
        const maxCols = Math.max(...levelData.grid.map(r => r.length), 1);
        const rows = levelData.grid.length || 1;
        
        const estWidth = width / (maxCols * 1.8);
        const estHeight = height / (rows * 1.6);
        setHexSize(Math.max(Math.min(estWidth, estHeight), 10));
      }
    };
    
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [levelData]);

  const renderHeatmap = () => {
    if (viewMode !== 'heat') return null;
    const heatPoints = [];
    const MAX_VISUAL_COST = 6; 

    levelData.grid.forEach((row, r) => {
      row.forEach((cost, c) => {
        if (cost === 0) return;
        const { x, y } = hexToPixel(r, c, hexSize);
        const intensity = Math.min(cost, MAX_VISUAL_COST) / MAX_VISUAL_COST; 
        const hue = 120 * (1 - intensity);
        const radius = hexSize * (0.6 + (0.4 * intensity));
        heatPoints.push(
          <circle key={`h-${r}-${c}`} cx={x} cy={y} r={radius} fill={`hsla(${hue}, 90%, 50%, 0.6)`} />
        );
      });
    });
    return <g filter="url(#heatmap-blur)" style={{ mixBlendMode: 'screen' }}>{heatPoints}</g>;
  };

  const renderTopoMap = () => {
    if (viewMode !== 'topo') return null;
    const layers = [];
    const elevationColors = ['#dcfce7', '#86efac', '#4ade80', '#22c55e', '#16a34a', '#15803d', '#14532d'];

    for (let threshold = 1; threshold <= 7; threshold++) {
      const shapePoints: React.ReactElement[] = [];
      const color = elevationColors[Math.min(threshold - 1, elevationColors.length - 1)];

      levelData.grid.forEach((row, r) => {
        row.forEach((cost, c) => {
          if (cost >= threshold && cost > 0) {
            const { x, y } = hexToPixel(r, c, hexSize);
            shapePoints.push(
              <circle 
                key={`t-${threshold}-${r}-${c}`} 
                cx={x} 
                cy={y} 
                r={hexSize * 0.9} 
                fill={color} 
              />
            );
          }
        });
      });

      if (shapePoints.length > 0) {
        layers.push(
          <g key={`layer-${threshold}`} filter="url(#topo-goo)">
             {shapePoints}
          </g>
        );
      }
    }

    return (
      <g>
        <rect x="-100%" y="-100%" width="300%" height="300%" fill="#f0fdf4" opacity="0.5" />
        {layers}
      </g>
    );
  };

  const cells = [];
  const lastPathCell = currentPath.length > 0 ? currentPath[currentPath.length - 1] : undefined;
  const currentNeighbors = lastPathCell ? getHexNeighbors(lastPathCell, levelData.grid) : [];

  levelData.grid.forEach((row, r) => {
    row.forEach((cost, c) => {
      const coord = { row: r, col: c };
      const isStart = isSameCoord(coord, startPos);
      const isEnd = isSameCoord(coord, endPos);
      const isSelected = currentPath.some(p => isSameCoord(p, coord));
      
      const isNeighbor = currentNeighbors.some(n => isSameCoord(n, coord));
      const isWalkable = (isNeighbor && !isSelected) || (isSelected && !isStart);

      cells.push(
        <Hexagon
          key={`${r}-${c}`}
          data={{ cost, coord }}
          size={hexSize}
          isSelected={isSelected}
          isStart={isStart}
          isEnd={isEnd}
          isWalkable={isWalkable}
          onClick={() => onCellClick(coord, cost)}
        />
      );
    });
  });

  const maxCols = Math.max(...levelData.grid.map(r => r.length), 1);
  const svgWidth = (maxCols + 0.5) * Math.sqrt(3) * hexSize + hexSize;
  const svgHeight = (levelData.grid.length * 1.5 + 0.5) * hexSize + hexSize;

  return (
    <div ref={containerRef} className="w-full h-full flex justify-center items-center z-10 relative">
      <svg
        width={svgWidth}
        height={svgHeight}
        viewBox={`-${hexSize} -${hexSize} ${svgWidth} ${svgHeight}`}
        className="overflow-visible"
        style={{ maxWidth: '100%', maxHeight: '100%' }}
      >
        <defs>
          <filter id="heatmap-blur" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur in="SourceGraphic" stdDeviation={hexSize * 0.4} />
          </filter>
          <filter id="topo-goo" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur in="SourceGraphic" stdDeviation={hexSize * 0.25} result="blur" />
            <feColorMatrix in="blur" type="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 18 -7" result="goo" />
            <feComposite in="SourceGraphic" in2="goo" operator="atop"/>
          </filter>
        </defs>
        {renderHeatmap()}
        {renderTopoMap()}
        {cells}
      </svg>
    </div>
  );
};

export default HexGrid;