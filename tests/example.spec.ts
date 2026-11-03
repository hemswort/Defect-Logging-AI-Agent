import { expect, test } from '@playwright/test';
import './hooks';

test('should load the home page', async ({ page }) => {
  await page.goto('https://example.com');
  await expect(page).toHaveTitle(/Example Domain/);
});
