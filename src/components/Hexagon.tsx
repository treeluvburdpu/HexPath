import React from 'react';
import type { HexData } from '../types';
import { Layer } from '../types';
import { hexToPixel } from '../utils/hexUtils';

interface HexagonProps {
  data: HexData;
  size: number;
  isSelected: boolean;
  isStart: boolean;
  isEnd: boolean;
  isWalkable: boolean;
  template?: string;
  tileset?: string;
  layer: Layer;
  viewMode?: 'none' | 'heat' | 'topo';
  onClick: () => void;
}

const Hexagon: React.FC<HexagonProps> = ({
  data,
  size,
  isSelected,
  isStart,
  isEnd,
  isWalkable,
  template,
  tileset,
  layer,
  viewMode,
  onClick
}) => {
  const { row, col } = data.coord;
  const { x, y } = hexToPixel(row, col, size);

  const angleOffset = 30; // degrees
  const getPoints = (s: number) => Array.from({ length: 6 }).map((_, i) => {
    const theta = (i * 60 + angleOffset) * (Math.PI / 180);
    return `${x + s * Math.cos(theta)},${y + s * Math.sin(theta)}`;
  }).join(' ');

  const points = getPoints(size);

  // Colors
  let fillColor = 'transparent';
  let strokeColor = 'rgba(255, 255, 255, 0.3)';
  let textColor = '#ffffff';

  if (isStart) {
    fillColor = 'rgba(252, 211, 77, 0.6)';
    strokeColor = '#FCD34D';
  } else if (isEnd) {
    fillColor = 'rgba(74, 222, 128, 0.6)';
    strokeColor = '#4ADE80';
  }

  // Interactive states (hint only)
  if (isWalkable && !isSelected && !isStart) {
    strokeColor = '#3B82F6';
  }

  // Tileset Asset Logic
  const symbolId = tileset ? `tile-${data.cost.toString(16)}` : null;

  // --- Layer: BACKGROUND ---
  if (layer === Layer.BACKGROUND) {
    const concentricRings = [];
    if (!symbolId && template === 'concentric' && data.cost > 0 && !isStart && !isEnd) {
      const minPadding = size * 0.1; 
      const usableSize = size - minPadding;

      for (let i = 1; i <= data.cost; i++) {
        const ringSize = minPadding + (usableSize / data.cost) * (data.cost - i + 1);
        const factor = (i - 1) / 14;
        const hue = 140 - (factor * 110);
        const lightness = 60 - (factor * 35);
        const saturation = 70 - (factor * 25);
        const color = `hsl(${hue}, ${saturation}%, ${lightness}%)`;

        concentricRings.push(
          <polygon key={`ring-${i}`} points={getPoints(ringSize)} fill={color} className="pointer-events-none" />
        );
      }
    }

    return (
      <g 
        onClick={() => isWalkable && onClick()}
        style={{ cursor: isWalkable ? 'pointer' : 'default' }}
        className={isWalkable ? "hover:opacity-90 active:scale-95" : ""}
      >
        {symbolId ? (
          <use href={`#${symbolId}`} x={x - size} y={y - size} width={size * 2} height={size * 2} className="pointer-events-none" />
        ) : (
          <polygon points={points} fill={isStart || isEnd ? fillColor : (data.cost === 0 ? fillColor : 'transparent')} />
        )}
        {!symbolId && concentricRings}
        {/* Interaction Surface (Transparent but catches clicks) */}
        <polygon points={points} fill="transparent" />
      </g>
    );
  }

  // --- Layer: HEATMAP ---
  if (layer === Layer.HEATMAP && viewMode === 'heat' && data.cost > 0) {
    const MAX_VISUAL_COST = 6;
    const intensity = Math.min(data.cost, MAX_VISUAL_COST) / MAX_VISUAL_COST;
    const hue = 120 * (1 - intensity);
    const radius = size * (0.6 + (0.4 * intensity));
    return (
      <circle cx={x} cy={y} r={radius} fill={`hsla(${hue}, 90%, 50%, 0.6)`} filter="url(#heatmap-blur)" style={{ mixBlendMode: 'screen' }} className="pointer-events-none" />
    );
  }

  // --- Layer: SELECTION ---
  if (layer === Layer.SELECTION && isSelected) {
    return (
      <polygon points={points} fill="rgba(96, 165, 250, 0.16)" className="pointer-events-none transition-colors duration-300" />
    );
  }

  // --- Layer: FOREGROUND (Numbers/Stars) ---
  if (layer === Layer.FOREGROUND) {
    return (
      <text x={x} y={y} dy=".35em" textAnchor="middle" fontSize={size * 0.8} fontWeight="bold" fill={textColor} fillOpacity={0.7} className="pointer-events-none select-none drop-shadow-md" style={{ textShadow: '0px 0px 4px rgba(0,0,0,0.8)' }}>
        {isEnd ? '★' : data.cost}
      </text>
    );
  }

  return null;
};

export default Hexagon;