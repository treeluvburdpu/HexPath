import React from 'react';
import { HexData } from '../types';
import { hexToPixel } from '../utils/hexUtils';

interface HexagonProps {
  data: HexData;
  size: number;
  isSelected: boolean;
  isStart: boolean;
  isEnd: boolean;
  isWalkable: boolean;
  onClick: () => void;
}

const Hexagon: React.FC<HexagonProps> = ({
  data,
  size,
  isSelected,
  isStart,
  isEnd,
  isWalkable,
  onClick
}) => {
  const { row, col } = data.coord;
  const { x, y } = hexToPixel(row, col, size);
  
  const angleOffset = 30; // degrees
  const points = Array.from({ length: 6 }).map((_, i) => {
    const theta = (i * 60 + angleOffset) * (Math.PI / 180);
    return `${x + size * Math.cos(theta)},${y + size * Math.sin(theta)}`;
  }).join(' ');

  // Colors
  let fillColor = 'transparent'; 
  let strokeColor = 'rgba(255, 255, 255, 0.3)';
  let strokeWidth = 2;
  let textColor = '#ffffff';

  if (isStart) {
    fillColor = 'rgba(252, 211, 77, 0.6)'; // Yellow-300 transparent
    strokeColor = '#FCD34D';
    strokeWidth = 3;
  } else if (isEnd) {
    fillColor = 'rgba(74, 222, 128, 0.6)'; // Green-400 transparent
    strokeColor = '#4ADE80';
    strokeWidth = 3;
  } else if (isSelected) {
    fillColor = 'rgba(96, 165, 250, 0.3)'; // Blue-400 very transparent
    strokeColor = '#60A5FA';
    textColor = '#ffffff';
  }

  // Interactive states
  if (isWalkable && !isSelected && !isStart) {
    strokeColor = '#3B82F6'; // Blue-500 hint
    strokeWidth = 3;
  }

  return (
    <g 
      onClick={isWalkable ? onClick : undefined} 
      style={{ cursor: isWalkable ? 'pointer' : 'default', transition: 'all 0.3s ease' }}
      className={isWalkable ? "hover:opacity-90 active:scale-95" : ""}
    >
      <polygon
        points={points}
        fill={fillColor}
        stroke={strokeColor}
        strokeWidth={strokeWidth}
        strokeLinejoin="round"
        className="transition-colors duration-300"
      />
      {/* Cost Number */}
      <text
        x={x}
        y={y}
        dy=".35em"
        textAnchor="middle"
        fontSize={size * 0.8}
        fontWeight="bold"
        fill={textColor}
        className="pointer-events-none select-none drop-shadow-md"
        style={{ textShadow: '0px 0px 4px rgba(0,0,0,0.8)' }}
      >
        {isEnd ? '★' : data.cost}
      </text>
    </g>
  );
};

export default Hexagon;