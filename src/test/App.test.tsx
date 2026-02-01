import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import App from '../App';
import React from 'react';

// Mock the Gemini service to avoid API calls
vi.mock('../services/geminiService', () => ({
  generateLevel: vi.fn(),
}));

describe('App Pathfinding', () => {
  it('updates the path when a neighboring cell is clicked', async () => {
    render(<App />);
    
    // Let's look for a clickable hexagon.
    // In INITIAL_LEVELS[0], grid[0][1] usually has a cost.
    
    // Find all hexagons
    const hexagons = screen.getAllByTestId('hexagon');
    // Find the first walkable hexagon that is NOT the start (start is at 0,0)
    const walkableHex = hexagons.find(h => h.getAttribute('data-walkable') === 'true');
    
    if (!walkableHex) throw new Error("Could not find walkable hex");
    
    fireEvent.click(walkableHex);
    
    // The budget is displayed in a large span in the background.
    // It starts at 10. The first walkable hex in Level 1 has cost 1.
    await vi.waitFor(() => {
      const budgetDisplay = screen.getByText(/^[0-9]+$/);
      console.log('Current Budget in test:', budgetDisplay.textContent);
      expect(budgetDisplay.textContent).toBe('9');
    }, { timeout: 2000 });
  });
});
