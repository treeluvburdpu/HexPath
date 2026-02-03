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

const generateSVG = (cost) => {
    const size = 50;
    const cx = 50;
    const cy = 50;
    const r = 48; // Max radius
    
    const minPadding = r * 0.1;
    const usableR = r - minPadding;

    const getStepColor = (step) => {
        if (step <= 1) return '#4ADE80'; // Pure Green for step 1
        
        // factor: 0 at step 1, 1 at step 15
        const factor = (step - 1) / 14;
        
        // Hue: 140 (Green) -> 30 (Brown)
        const hue = 140 - (factor * 110);
        // Lightness: 60% -> 25%
        const lightness = 60 - (factor * 35);
        // Saturation: 70% -> 45%
        const saturation = 70 - (factor * 25);
        
        return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
    };

    let layers = '';
    // If cost is 0, just the yellow base
    if (cost === 0) {
        layers = `<polygon points="${getHexPoints(cx, cy, r)}" fill="#FCD34D" />`;
    } else {
        // Render layers from largest (outer) to smallest (inner)
        for (let i = 1; i <= cost; i++) {
            // i=1: size=r, i=cost: size=minPadding + (usableR/cost)
            const ringR = minPadding + (usableR / cost) * (cost - i + 1);
            const color = getStepColor(i);
            layers += `<polygon points="${getHexPoints(cx, cy, ringR)}" fill="${color}" />\n    `;
        }
    }

    return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="100" height="100" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
    ${layers}
</svg>`;
};

for (let i = 0; i <= 15; i++) {
    const svg = generateSVG(i);
    const fileName = `${i.toString(16)}.svg`;
    fs.writeFileSync(path.join(OUTPUT_DIR, fileName), svg);
    console.log(`Generated ${fileName}`);
}
