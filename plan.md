# HexPath Modular Evolution Plan

## 1. Architectural Shift: Modular Game Engine
To support multiple games and a map designer, we will move away from monolithic React components toward a "headless" engine approach.

- **Effect TS Integration:** Wrap side-effects (LocalStorage, Gemini API, Sound) in Effect layers.
- **Effect Schema:** Define our Game Models (Grid, Hex, Coordinate, Level) using Schema. This provides:
    - Runtime validation of AI-generated maps.
    - Automatic TypeScript types.
    - Safe serialization for the Map Designer.

## 2. Component Modularity
- **Atomic Hex/Tile Components:** Refactor `Hexagon.tsx` into a base `Tile` that accepts "Layers" (Background, SVG Template, Interaction, Decorator).
- **Template System:** Create a registry of SVG templates with associated metadata (e.g., `Forest` template = cost 5, `Road` = cost 1).
- **Context-Aware Rendering:** Use a `GameContext` or an Effect-based store to let tiles know if they are in "Play Mode" or "Design Mode".

## 3. Map Designer Feature
- **State Serialization:** Use Effect Schema to `encode/decode` the map state to JSON/Base64 for sharing.
- **Toolbox Pattern:** Implement a "Brush" system where users select a template and "paint" onto the grid.

## 4. Multi-Game Integration
- **Astro Routes:** Each game will reside in `src/pages/games/[game-id].astro`.
- **Shared Layouts:** Use `Layout.astro` to provide a consistent navigation and "Learning Dashboard" experience across all games.

## 5. Deployment Readiness
- **GitHub Actions:** The current `.github/workflows/deploy.yml` is configured to use the `withastro/action`.
- **Requirements:** 
    1. The repo must be pushed to GitHub.
    2. GitHub Pages must be set to "GitHub Actions" as the source in the repository settings.
    3. The `base` path in `astro.config.mjs` is already set to `/HexPath/`, matching the repository name.
