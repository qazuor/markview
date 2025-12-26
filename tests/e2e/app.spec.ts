import { expect, test } from '@playwright/test';

test.describe('MarkView App', () => {
    test('should display the app name', async ({ page }) => {
        await page.goto('/');

        await expect(page.locator('h1')).toContainText('MarkView');
    });

    test('should display the tagline', async ({ page }) => {
        await page.goto('/');

        await expect(page.locator('text=Markdown, visualized')).toBeVisible();
    });

    test('should have sidebar', async ({ page }) => {
        await page.goto('/');

        await expect(page.locator('aside')).toBeVisible();
    });

    test('should have status bar', async ({ page }) => {
        await page.goto('/');

        await expect(page.locator('footer')).toBeVisible();
    });
});
