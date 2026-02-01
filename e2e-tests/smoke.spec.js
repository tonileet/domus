import { test, expect } from '@playwright/test';

test.describe('Smoke Tests', () => {
  test('app loads successfully', async ({ page }) => {
    await page.goto('/');

    // Check that the page loads without errors
    await expect(page).toHaveTitle(/Domus/i);
  });

  test('navigation works', async ({ page }) => {
    await page.goto('/');

    // Verify the page content is visible
    await expect(page.locator('body')).toBeVisible();
  });
});
