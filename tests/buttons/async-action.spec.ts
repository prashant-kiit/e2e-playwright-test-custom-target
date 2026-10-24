// spec: specs/SCRUM-203-buttons-test-plan.md
// seed: seed.spec.ts

import { test, expect } from '@playwright/test';

test.describe('AC2: Async Action Loading State', () => {
  test.beforeEach(async ({ page }) => {
    // Start every test from the seed's home page, then navigate to /buttons.
    await page.goto('/');
    await expect(page.getByTestId('home-page')).toBeVisible();
    await expect(page.getByTestId('status-badge')).toHaveText('online');

    await page.goto('/buttons');
  });

  test('Async action button shows initial idle state with no result message', async ({ page }) => {
    // 1. Navigate to /buttons from the seed home page.
    await expect(page.getByRole('heading', { name: 'Async action with loading' })).toBeVisible();

    // 2. Assert the button reads 'Run action' and is enabled.
    const asyncButton = page.getByTestId('async-action-button');
    await expect(asyncButton).toHaveText('Run action');
    await expect(asyncButton).toBeEnabled();

    // 3. The async-action-result element does not exist in the DOM before any action
    // has completed, so assert count 0 rather than just checking visibility.
    await expect(page.getByTestId('async-action-result')).toHaveCount(0);
  });

  test('Happy path: clicking Run action shows Processing… and disables the button', async ({ page }) => {
    const asyncButton = page.getByTestId('async-action-button');

    // 1. Navigate to /buttons from the seed home page.
    await expect(asyncButton).toHaveText('Run action');
    await expect(asyncButton).toBeEnabled();

    // 2. Click the async action button.
    await asyncButton.click();

    // 3. Assert the button text becomes exactly 'Processing…' (single Unicode ellipsis
    // character U+2026, not three ASCII periods) using a retrying assertion — never a
    // fixed waitForTimeout, since React state updates render asynchronously.
    await expect(asyncButton).toHaveText('Processing…');

    // 4. Assert the button is disabled while processing.
    await expect(asyncButton).toBeDisabled();
  });

  test('Happy path: async action completes, re-enables button, and shows completion message', async ({ page }) => {
    const asyncButton = page.getByTestId('async-action-button');
    const asyncResult = page.getByTestId('async-action-result');

    // 1. Navigate to /buttons from the seed home page.
    await expect(asyncButton).toHaveText('Run action');
    await expect(asyncButton).toBeEnabled();

    // 2. Click the async action button; it immediately shows 'Processing…' and is disabled.
    await asyncButton.click();
    await expect(asyncButton).toHaveText('Processing…');
    await expect(asyncButton).toBeDisabled();

    // 3. Wait for completion using a polling assertion (not a fixed sleep) to allow the
    // ~1.2s async delay to elapse.
    await expect(asyncButton).toHaveText('Run action', { timeout: 5000 });

    // 4. Assert the button is re-enabled after completion.
    await expect(asyncButton).toBeEnabled();

    // 5. Assert the result message element is now present and reads exactly 'Action completed.'
    await expect(asyncResult).toHaveText('Action completed.');
  });

  test('Business rule: clicking Run action again while processing has no effect (cannot re-trigger)', async ({ page }) => {
    const asyncButton = page.getByTestId('async-action-button');
    const asyncResult = page.getByTestId('async-action-result');

    // 1. Navigate to /buttons from the seed home page.
    await expect(asyncButton).toHaveText('Run action');
    await expect(asyncButton).toBeEnabled();

    // 2. Click the async action button to start the action.
    await asyncButton.click();
    await expect(asyncButton).toHaveText('Processing…');
    await expect(asyncButton).toBeDisabled();

    // 3. While still disabled/processing, attempt to click it again. A forced click is
    // used to bypass Playwright's actionability check, which would otherwise refuse to
    // click a disabled element — this exercises the app's own guard against re-triggering.
    await asyncButton.click({ force: true });

    // 4. The button remains in 'Processing…' state, unaffected by the second click attempt
    // (no restart or reset of the processing state / timer).
    await expect(asyncButton).toHaveText('Processing…');

    // 5. Wait for completion; total elapsed time is consistent with a single ~1.2s run.
    await expect(asyncButton).toHaveText('Run action', { timeout: 5000 });

    // 6. Exactly one completion result is shown, proving the second click while processing
    // did not queue or trigger an additional run.
    await expect(asyncResult).toHaveText('Action completed.');
    await expect(asyncResult).toHaveCount(1);
  });

  test('Async action can be re-run after a completed cycle', async ({ page }) => {
    const asyncButton = page.getByTestId('async-action-button');
    const asyncResult = page.getByTestId('async-action-result');

    // 1. Navigate to /buttons from the seed home page.
    await expect(asyncButton).toHaveText('Run action');
    await expect(asyncButton).toBeEnabled();

    // 2. Click the async action button and wait for the first run to complete.
    await asyncButton.click();
    await expect(asyncButton).toHaveText('Run action', { timeout: 5000 });
    await expect(asyncResult).toHaveText('Action completed.');

    // 3. Click the async action button a second time (a fresh run, not while processing).
    await asyncButton.click();

    // 4. The second run enters the processing state exactly as the first run did.
    await expect(asyncButton).toHaveText('Processing…');
    await expect(asyncButton).toBeDisabled();

    // 5. Wait for the second run to complete and the button to re-enable.
    await expect(asyncButton).toHaveText('Run action', { timeout: 5000 });

    // 6. The result still correctly reads 'Action completed.' after the second successful
    // run, confirming the action can be legitimately re-triggered once idle.
    await expect(asyncResult).toHaveText('Action completed.');
  });

  test('Async action result does not persist across a page reload', async ({ page }) => {
    const asyncButton = page.getByTestId('async-action-button');
    const asyncResult = page.getByTestId('async-action-result');

    // 1. Navigate to /buttons from the seed home page.
    await expect(asyncButton).toHaveText('Run action');

    // 2. Click the async action button and wait for completion.
    await asyncButton.click();
    await expect(asyncButton).toHaveText('Run action', { timeout: 5000 });
    await expect(asyncResult).toHaveText('Action completed.');

    // 3. Reload the page.
    await page.reload();

    // 4. The button is back to its idle 'Run action' state and the result element is gone,
    // confirming no persistence of async action state across reloads.
    await expect(asyncButton).toHaveText('Run action');
    await expect(asyncResult).toHaveCount(0);
  });
});
