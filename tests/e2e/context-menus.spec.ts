import { expect, test } from '@playwright/test';

test.describe('Context Menus', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/');
        // Wait for the app to load
        await page.waitForSelector('[role="tablist"]');
    });

    test.describe('Tab Context Menu', () => {
        test('should show context menu on tab right-click', async ({ page }) => {
            // Right-click on a tab
            const tab = page.locator('[role="tab"]').first();
            await tab.click({ button: 'right' });

            // Context menu should appear
            await expect(page.locator('[role="menu"]')).toBeVisible();
        });

        test('should show close options in tab context menu', async ({ page }) => {
            const tab = page.locator('[role="tab"]').first();
            await tab.click({ button: 'right' });

            // Check menu items exist
            await expect(page.getByText(/close tab/i).first()).toBeVisible();
            await expect(page.getByText(/close other/i).first()).toBeVisible();
            await expect(page.getByText(/close all/i).first()).toBeVisible();
        });

        test('should close context menu on outside click', async ({ page }) => {
            const tab = page.locator('[role="tab"]').first();
            await tab.click({ button: 'right' });

            // Menu should be visible
            await expect(page.locator('[role="menu"]')).toBeVisible();

            // Click outside
            await page.click('body', { position: { x: 10, y: 10 } });

            // Menu should be hidden
            await expect(page.locator('[role="menu"]')).not.toBeVisible();
        });

        test('should show export submenu', async ({ page }) => {
            const tab = page.locator('[role="tab"]').first();
            await tab.click({ button: 'right' });

            // Hover over Export As to open submenu
            await page.getByText(/export as/i).hover();

            // Submenu items should appear
            await expect(page.getByText(/markdown/i)).toBeVisible();
            await expect(page.getByText(/html/i)).toBeVisible();
        });
    });

    test.describe('Editor Context Menu', () => {
        test('should show context menu on editor right-click', async ({ page }) => {
            // Right-click on the editor
            const editor = page.locator('.cm-editor');
            await editor.click({ button: 'right' });

            // Context menu should appear with clipboard options
            await expect(page.locator('[role="menu"]')).toBeVisible();
        });

        test('should show format and insert submenus', async ({ page }) => {
            const editor = page.locator('.cm-editor');
            await editor.click({ button: 'right' });

            // Check for submenus
            await expect(page.getByText(/format selection/i)).toBeVisible();
            await expect(page.getByText(/insert/i).first()).toBeVisible();
        });

        test('should show format options in submenu', async ({ page }) => {
            const editor = page.locator('.cm-editor');
            await editor.click({ button: 'right' });

            // Hover over Format Selection
            await page.getByText(/format selection/i).hover();

            // Check format options
            await expect(page.getByText(/bold/i)).toBeVisible();
            await expect(page.getByText(/italic/i)).toBeVisible();
        });
    });

    test.describe('Preview Context Menu', () => {
        test('should show context menu on preview right-click', async ({ page }) => {
            // Make sure preview is visible
            await page.waitForSelector('[data-preview-content]');

            // Right-click on preview
            const preview = page.locator('[data-preview-content]');
            await preview.click({ button: 'right' });

            // Context menu should appear
            await expect(page.locator('[role="menu"]')).toBeVisible();
        });

        test('should show copy options', async ({ page }) => {
            await page.waitForSelector('[data-preview-content]');

            const preview = page.locator('[data-preview-content]');
            await preview.click({ button: 'right' });

            await expect(page.getByText(/copy/i).first()).toBeVisible();
            await expect(page.getByText(/select all/i)).toBeVisible();
        });
    });

    test.describe('Keyboard Navigation', () => {
        test('should navigate menu items with arrow keys', async ({ page }) => {
            const tab = page.locator('[role="tab"]').first();
            await tab.click({ button: 'right' });

            // Menu should be visible
            await expect(page.locator('[role="menu"]')).toBeVisible();

            // Navigate with arrow down
            await page.keyboard.press('ArrowDown');
            await page.keyboard.press('ArrowDown');

            // Press Enter to select
            await page.keyboard.press('Enter');

            // Menu should close after selection (or action should be performed)
            // This depends on the specific action
        });

        test('should close menu with Escape key', async ({ page }) => {
            const tab = page.locator('[role="tab"]').first();
            await tab.click({ button: 'right' });

            await expect(page.locator('[role="menu"]')).toBeVisible();

            // Press Escape
            await page.keyboard.press('Escape');

            // Menu should be hidden
            await expect(page.locator('[role="menu"]')).not.toBeVisible();
        });
    });
});
