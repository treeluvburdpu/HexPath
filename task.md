# HexPath GitHub Pages & Astro Integration Task List

## Preparation
- [x] Research and confirm chosen wrapper (Astro)
- [x] Configure Vite `base` path for GitHub Pages compatibility
- [x] Update `package.json` scripts for deployment

## Astro Integration
- [x] Scaffold Astro structure
- [x] Migrate `index.html` logic into Astro layout/components
- [x] Integrate React components as Astro Islands (`client:load`)
- [x] Ensure Tailwind CSS configuration is shared or correctly integrated
- [x] Fix hydration issues (type imports and enum conversion)
- [x] Make browser-only APIs SSR-safe

## GitHub Actions & Deployment
- [x] Create `.github/workflows/deploy.yml`
- [x] Configure deployment to GitHub Actions environment
- [x] Verify build and asset pathing

## Testing
- [x] Set up Vitest for unit testing
- [x] Set up Playwright for E2E testing
- [x] Verify interactivity and pathfinding logic via E2E tests

## Cleanup & Documentation
- [x] Finalize `README.md` with usage instructions
- [x] Verify all paths (images, scripts, styles) work in production
- [x] Remove debug logging