import React, { useRef, useState, useEffect } from 'react';
import Hexagon from './Hexagon';
import type { LevelData, Coordinate, GameStatus } from '../types';
import { Layer } from '../types';
import { getHexNeighbors, isSameCoord, hexToPixel } from '../utils/hexUtils';
import { DEFAULT_START, DEFAULT_END } from '../constants';

interface HexGridProps {
  levelData: LevelData;
  currentPath: Coordinate[];
  onCellClick: (coord: Coordinate, cost: number) => void;
  viewMode: 'none' | 'heat' | 'topo';
  gameStatus: GameStatus;
}

const NOMINAL_HEX_SIZE = 100;

const HexGrid: React.FC<HexGridProps> = ({ 
  levelData, 
  currentPath, 
  onCellClick, 
  viewMode,
  gameStatus
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0.6);
  const [spriteContent, setSpriteContent] = useState<string | null>(null);

  const grid = levelData.grid || [];
  const startPos = levelData.start || DEFAULT_START(grid.length);
  const maxColsAcrossGrid = Math.max(...grid.map(r => r.length), 1);
  const endPos = levelData.end || DEFAULT_END(maxColsAcrossGrid);

  // Preload tileset sprite
  useEffect(() => {
    if (levelData.tileset) {
      fetch(`/HexPath/assets/tilesets/${levelData.tileset}/sprite.svg`)
        .then(res => res.text())
        .then(svg => {
          // Extract the inner content of the SVG
          const content = svg.replace(/<\?xml.*?\?>|<\/?svg.*?>/g, '');
          setSpriteContent(content);
        })
        .catch(err => console.error('Failed to load sprite:', err));
    }
  }, [levelData.tileset]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleResize = () => {
      const { width, height } = container.getBoundingClientRect();
      const rows = grid.length || 1;
      const maxCols = Math.max(...grid.map(r => r.length), 1);
      const unscaledWidth = (maxCols + 0.5) * Math.sqrt(3) * NOMINAL_HEX_SIZE + NOMINAL_HEX_SIZE;
      const unscaledHeight = (rows * 1.5 + 0.5) * NOMINAL_HEX_SIZE + NOMINAL_HEX_SIZE;
      
      const scaleX = (width * 0.9) / unscaledWidth;
      const scaleY = (height * 0.9) / unscaledHeight;
      const newScale = Math.min(scaleX, scaleY);
      setScale(newScale);
    };
    
    const observer = new ResizeObserver(handleResize);
    observer.observe(container);
    handleResize();
    return () => observer.disconnect();
  }, [grid.length, maxColsAcrossGrid]);

  const backgrounds: React.ReactElement[] = [];
  const heatmaps: React.ReactElement[] = [];
  const selections: React.ReactElement[] = [];
  const foregrounds: React.ReactElement[] = [];

  const lastPathCell = currentPath.length > 0 ? currentPath[currentPath.length - 1] : undefined;
  const currentNeighbors = lastPathCell ? getHexNeighbors(lastPathCell, grid) : [];

  grid.forEach((row, r) => {
    if (!row || row.length === 0) return;

    row.forEach((cost, c) => {
      const coord = { row: r, col: c };
      const isStart = isSameCoord(coord, startPos);
      const isEnd = isSameCoord(coord, endPos);
      const isSelected = currentPath.some(p => isSameCoord(p, coord));
      const isNeighbor = currentNeighbors.some(n => isSameCoord(n, coord));
      const isWalkable = (isNeighbor && !isSelected) || (isSelected && !isStart);
      const template = levelData.templateMap?.[cost.toString(16).toUpperCase()] || 
                       levelData.templateMap?.[cost.toString()];

      const commonProps = {
        data: { cost, coord },
        size: NOMINAL_HEX_SIZE,
        isSelected,
        isStart,
        isEnd,
        isWalkable,
        template,
        tileset: levelData.tileset,
        viewMode,
        onClick: () => onCellClick(coord, cost)
      };

      backgrounds.push(<Hexagon key={`bg-${r}-${c}`} {...commonProps} layer={Layer.BACKGROUND} />);
      heatmaps.push(<Hexagon key={`hm-${r}-${c}`} {...commonProps} layer={Layer.HEATMAP} />);
      selections.push(<Hexagon key={`sel-${r}-${c}`} {...commonProps} layer={Layer.SELECTION} />);
      foregrounds.push(<Hexagon key={`fg-${r}-${c}`} {...commonProps} layer={Layer.FOREGROUND} />);
    });
  });

  const renderTopoMap = () => {
    if (viewMode !== 'topo') return null;
    const layers = [];
    const elevationColors = ['#dcfce7', '#86efac', '#4ade80', '#22c55e', '#16a34a', '#15803d', '#14532d'];

    for (let threshold = 1; threshold <= 7; threshold++) {
      const shapePoints: React.ReactElement[] = [];
      const color = elevationColors[Math.min(threshold - 1, elevationColors.length - 1)];

      grid.forEach((row, r) => {
        row.forEach((cost, c) => {
          if (cost >= threshold && cost > 0) {
            const { x, y } = hexToPixel(r, c, NOMINAL_HEX_SIZE);
            shapePoints.push(<circle key={`t-${threshold}-${r}-${c}`} cx={x} cy={y} r={NOMINAL_HEX_SIZE * 0.9} fill={color} />);
          }
        });
      });

      if (shapePoints.length > 0) {
        layers.push(<g key={`layer-${threshold}`} filter="url(#topo-goo)">{shapePoints}</g>);
      }
    }
    return <g className="topo-layer">{layers}</g>;
  };

  const maxCols = Math.max(...grid.map(r => r.length), 1);
  const svgWidth = (maxCols + 0.5) * Math.sqrt(3) * NOMINAL_HEX_SIZE + NOMINAL_HEX_SIZE;
  const svgHeight = (grid.length * 1.5 + 0.5) * NOMINAL_HEX_SIZE + NOMINAL_HEX_SIZE;

  return (
    <div ref={containerRef} className="w-full h-full flex justify-center items-center z-10 relative overflow-hidden">
      <svg
        viewBox={`-${NOMINAL_HEX_SIZE} -${NOMINAL_HEX_SIZE} ${svgWidth} ${svgHeight}`}
        className="overflow-visible transition-transform duration-[700ms] ease-in-out"
        style={{ 
          width: svgWidth,
          height: svgHeight,
          transform: `scale(${scale})`,
          transformOrigin: 'center center'
        }}
      >
        <defs>
          {spriteContent && <g dangerouslySetInnerHTML={{ __html: spriteContent }} />}
          <filter id="heatmap-blur" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur in="SourceGraphic" stdDeviation={NOMINAL_HEX_SIZE * 0.4} />
          </filter>
          <filter id="topo-goo" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur in="SourceGraphic" stdDeviation={NOMINAL_HEX_SIZE * 0.25} result="blur" />
            <feColorMatrix in="blur" type="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 18 -7" result="goo" />
            <feComposite in="SourceGraphic" in2="goo" operator="atop"/>
          </filter>
        </defs>
        <g className="layer-background">{backgrounds}</g>
        <g className="layer-heatmap">{heatmaps}</g>
        {renderTopoMap()}
        <g className="layer-selection">{selections}</g>
        <g className="layer-foreground">{foregrounds}</g>
      </svg>
    </div>
  );
};

export default HexGrid;
