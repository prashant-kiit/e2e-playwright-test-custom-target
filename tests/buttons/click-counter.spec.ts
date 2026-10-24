// spec: specs/SCRUM-203-buttons-test-plan.md
// seed: seed.spec.ts

import { test, expect } from '@playwright/test';

test.describe('AC1: Click Counter', () => {
  test.beforeEach(async ({ page }) => {
    // Start every test from the seed's home page, then navigate to /buttons.
    await page.goto('/');
    await expect(page.getByTestId('home-page')).toBeVisible();
    await expect(page.getByTestId('status-badge')).toHaveText('online');

    await page.goto('/buttons');
  });

  test('Counter displays initial zero state on page load', async ({ page }) => {
    // 1. Start from the seed (home page), then navigate to /buttons.
    await expect(page).toHaveURL(/\/buttons$/);
    await expect(page.getByRole('heading', { name: 'Buttons' })).toBeVisible();

    // 2. Locate the counter button using page.getByTestId('counter-button').
    const counterButton = page.getByTestId('counter-button');
    await expect(counterButton).toBeVisible();

    // 3. Assert the button's text using toHaveText.
    await expect(counterButton).toHaveText('Clicked 0 times');
  });

  test('Clicking once shows singular grammar ("1 time")', async ({ page }) => {
    const counterButton = page.getByTestId('counter-button');

    // 1. Navigate to /buttons from the seed home page.
    await expect(counterButton).toHaveText('Clicked 0 times');

    // 2. Click the counter button once.
    await counterButton.click();

    // 3. Assert singular grammar: 'Clicked 1 time', not 'Clicked 1 times'.
    await expect(counterButton).toHaveText('Clicked 1 time');
  });

  test('Clicking twice shows plural grammar ("2 times")', async ({ page }) => {
    const counterButton = page.getByTestId('counter-button');

    // 1. Navigate to /buttons from the seed home page.
    await expect(counterButton).toHaveText('Clicked 0 times');

    // 2. Click the counter button a first time.
    await counterButton.click();
    await expect(counterButton).toHaveText('Clicked 1 time');

    // 3. Click the counter button a second time.
    await counterButton.click();

    // 4. Assert plural grammar: 'Clicked 2 times'.
    await expect(counterButton).toHaveText('Clicked 2 times');
  });

  test('Rapid/many sequential clicks increment the counter correctly (edge case)', async ({ page }) => {
    const counterButton = page.getByTestId('counter-button');

    // 1. Navigate to /buttons from the seed home page.
    await expect(counterButton).toHaveText('Clicked 0 times');

    // 2. Click the counter button 10 times in a tight loop (await each click sequentially, no manual delay).
    for (let i = 0; i < 10; i++) {
      await counterButton.click();
    }

    // 3. Assert no click was lost or double-counted; plural grammar holds for counts greater than 1.
    await expect(counterButton).toHaveText('Clicked 10 times');
  });

  test('Counter resets to zero after a full page reload (state does not persist)', async ({ page }) => {
    const counterButton = page.getByTestId('counter-button');

    // 1. Navigate to /buttons from the seed home page.
    await expect(counterButton).toHaveText('Clicked 0 times');

    // 2. Click the counter button 3 times.
    await counterButton.click();
    await counterButton.click();
    await counterButton.click();
    await expect(counterButton).toHaveText('Clicked 3 times');

    // 3. Reload the page.
    await page.reload();

    // 4. Assert the counter has reset to 'Clicked 0 times' (no persistence across reloads).
    await expect(counterButton).toHaveText('Clicked 0 times');
  });

  test('Counter button remains enabled and clickable after multiple clicks', async ({ page }) => {
    const counterButton = page.getByTestId('counter-button');

    // 1. Navigate to /buttons from the seed home page.
    await expect(counterButton).toHaveText('Clicked 0 times');

    // 2. Click the counter button once, then assert it is enabled (unlike the async action button).
    await counterButton.click();
    await expect(counterButton).toBeEnabled();

    // 3. Click the counter button several more times (5 additional clicks).
    for (let i = 0; i < 5; i++) {
      await counterButton.click();
    }

    // 4. Assert the final count reflects all 6 clicks.
    await expect(counterButton).toHaveText('Clicked 6 times');
  });
});
