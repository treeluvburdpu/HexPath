import { test, expect } from '@playwright/test';

test('can click a walkable tile and update budget', async ({ page }) => {
  // Listen for console logs
  page.on('console', msg => console.log('BROWSER LOG:', msg.text()));

  await page.goto('./');

  // Wait for the game to hydrate
  await expect(page.getByText('HexPath Explorer')).toBeVisible();
  
  // Give it plenty of time to finish hydration and logs to settle
  await page.waitForTimeout(2000);

  // Initial budget should be 10
  const budgetDisplay = page.getByTestId('budget-display');
  await expect(budgetDisplay).toHaveText('10');

  // Find a walkable hexagon (should be {row: 3, col: 0} for Level 1)
  const walkableHex = page.locator('g[data-walkable="true"][data-row="3"][data-col="0"]');
  await expect(walkableHex).toBeVisible();

  console.log('Clicking walkable hex at row 3, col 0...');
  // Click it
  await walkableHex.click();

  // Wait for the budget to update
  console.log('Waiting for budget to update to 9...');
  await expect(budgetDisplay).toHaveText('9', { timeout: 5000 });
  
  // Also check if the path indicator is visible
  const pathIndicator = page.locator('circle.animate-pulse');
  await expect(pathIndicator).toBeVisible();
});
