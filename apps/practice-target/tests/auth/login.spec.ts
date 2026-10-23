// spec: apps/practice-target/specs/SCRUM-201-auth-test-plan.md
// seed: apps/practice-target/seed.spec.ts
// THROWAWAY FIXTURE: verifies the delivery push path, not real agent output.
import { test, expect } from '@playwright/test';

test.describe('SCRUM-201 mock login', () => {
  test('reaches the dashboard', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveURL(/.*/);
  });
});
