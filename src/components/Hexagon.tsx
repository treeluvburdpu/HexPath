import React from 'react';
import type { HexData } from '../types';
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
        fillColor = 'rgba(96, 165, 250, 0.16)';
        strokeColor = '#60A5FA';
        textColor = '#ffffff';
    }

    // Interactive states
    if (isWalkable && !isSelected && !isStart) {
        strokeColor = '#3B82F6';
        strokeWidth = 3;
    }

    // Tileset Asset Logic
    const tilesetPath = tileset ? `/HexPath/assets/tilesets/${tileset}/${data.cost}.svg` : null;

        // Concentric Fallback Logic (if no tileset or image fails)

        const concentricRings = [];

        if (!tilesetPath && template === 'concentric' && data.cost > 0 && !isStart && !isEnd) {

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

                    <polygon

                        key={`ring-${i}`}

                        points={getPoints(ringSize)}

                        fill={color}

                        className="pointer-events-none"

                    />

                );

            }

        }

    

        return (

            <g 

                onClick={() => {

                    if (isWalkable) onClick();

                }}

                style={{ cursor: isWalkable ? 'pointer' : 'default', transition: 'all 0.3s ease' }}

                className={isWalkable ? "hover:opacity-90 active:scale-95" : ""}

                data-testid="hexagon"

                data-walkable={isWalkable}

                data-row={row}

                data-col={col}

                data-is-selected={isSelected}

            >

                {/* Base Layer: Either a Tileset Image or a Polygon */}

                {tilesetPath ? (

                    <image 

                        href={tilesetPath} 

                        x={x - size} 

                        y={y - size} 

                        width={size * 2} 

                        height={size * 2}

                        className="pointer-events-none"

                    />

                ) : (

                    <polygon

                        points={points}

                        fill={isStart || isEnd ? fillColor : (data.cost === 0 ? fillColor : 'transparent')}

                        className="transition-colors duration-300"

                    />

                )}

                

                {/* Procedural Layers (if no tileset) */}

                {!tilesetPath && concentricRings}

    

            {/* Selection Overlay (if selected) */}
            {isSelected && (
                <polygon
                    points={points}
                    fill="rgba(96, 165, 250, 0.16)"
                    className="pointer-events-none"
                />
            )}

            {/* Interaction Surface (Invisible but catches all clicks on the hex) */}
            <polygon
                points={points}
                fill="transparent"
                className="cursor-pointer"
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
                fillOpacity={0.7}
                className="pointer-events-none select-none drop-shadow-md"
                style={{ textShadow: '0px 0px 4px rgba(0,0,0,0.8)' }}
            >
                {isEnd ? '★' : data.cost}
            </text>
        </g>
    );
};

export default Hexagon;
