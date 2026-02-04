const fs = require('fs');
const path = require('path');

const TILESET_NAME = 'concentric';
const OUTPUT_DIR = path.join(__dirname, '..', 'public', 'assets', 'tilesets', TILESET_NAME);

if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

const getHexPoints = (cx, cy, r) => {
    const points = [];
    const angleOffset = 30 * (Math.PI / 180);
    for (let i = 0; i < 6; i++) {
        const theta = (i * 60 * (Math.PI / 180)) + angleOffset;
        points.push(`${cx + r * Math.cos(theta)},${cy + r * Math.sin(theta)}`);
    }
    return points.join(' ');
};

const getStepColor = (step) => {
    if (step <= 1) return '#4ADE80';
    const factor = (step - 1) / 14;
    const hue = 140 - (factor * 110);
    const lightness = 60 - (factor * 35);
    const saturation = 70 - (factor * 25);
    return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
};

const generateSymbol = (cost) => {
    const cx = 50;
    const cy = 50;
    const r = 48;
    const minPadding = r * 0.1;
    const usableR = r - minPadding;

    let layers = '';
    if (cost === 0) {
        layers = `<polygon points="${getHexPoints(cx, cy, r)}" fill="#FCD34D" />`;
    } else {
        for (let i = 1; i <= cost; i++) {
            const ringR = minPadding + (usableR / cost) * (cost - i + 1);
            layers += `<polygon points="${getHexPoints(cx, cy, ringR)}" fill="${getStepColor(i)}" />\n        `;
        }
    }

    return `<symbol id="tile-${cost.toString(16)}" viewBox="0 0 100 100">
        ${layers}
    </symbol>`;
};

let symbols = '';
for (let i = 0; i <= 15; i++) {
    symbols += generateSymbol(i) + '\n    ';
}

const sprite = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" style="display: none;">
    ${symbols}
</svg>`;

fs.writeFileSync(path.join(OUTPUT_DIR, 'sprite.svg'), sprite);
console.log('Generated sprite.svg');