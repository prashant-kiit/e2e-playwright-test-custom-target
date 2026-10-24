# SCRUM-203 Button Interactions Test Plan

## Application Overview

This test plan covers SCRUM-203 (Button Interactions) for the Playwright Practice Target app, scoped strictly to two button patterns on the /buttons page: (1) the Click Counter and (2) the Async Action with Loading State. No authentication is required to access /buttons. All tests assume a fresh page load (counter starts at 0, no async result shown) unless otherwise noted. Per target quirks, tests must never assert on HTTP status codes and must use built-in Playwright auto-retrying assertions (e.g. expect(locator).toHaveText(...), expect(locator).toBeDisabled()) instead of fixed waitForTimeout calls to detect state changes.

Key locators (data-testid, accessed via page.getByTestId):
- counter-button: the click counter button, starts as "Clicked 0 times"
- async-action-button: the "Run action" button; becomes "Processing…" and disabled while running, reverts to "Run action" and re-enables on completion
- async-action-result: paragraph that appears only after the async action completes, containing "Action completed." (this element does not exist in the DOM until the first successful completion)

Verified-live behavior used as the source of truth for exact text:
- Counter text sequence: "Clicked 0 times" -> "Clicked 1 time" (singular, no trailing s) -> "Clicked 2 times" -> "Clicked 3 times" ...
- Async button text sequence: "Run action" -> "Processing…" (single ellipsis character, U+2026) -> "Run action"
- Async result text: exactly "Action completed."
- While processing, async-action-button is disabled; attempting to click it again (including a forced click) during processing has no effect — it does not restart the timer, does not show a new "Processing…" cycle, and the result text appears only once per run
- A full page reload resets the counter to "Clicked 0 times" and removes the async-action-result element entirely (no persistence across reloads)

## Test Scenarios

### 1. AC1: Click Counter

**Seed:** `seed.spec.ts`

#### 1.1. Counter displays initial zero state on page load

**File:** `tests/buttons/click-counter.spec.ts`

**Steps:**
  1. Start from the seed (home page), then navigate to /buttons.
    - expect: Page URL is /buttons
    - expect: Page displays heading 'Buttons'
  2. Locate the counter button using page.getByTestId('counter-button').
    - expect: Element is visible
  3. Assert the button's text using expect(page.getByTestId('counter-button')).toHaveText('Clicked 0 times').
    - expect: Button text is exactly 'Clicked 0 times'

#### 1.2. Clicking once shows singular grammar ("1 time")

**File:** `tests/buttons/click-counter.spec.ts`

**Steps:**
  1. Navigate to /buttons from the seed home page.
    - expect: Counter button reads 'Clicked 0 times'
  2. Click page.getByTestId('counter-button') once.
    - expect: Click registers without error
  3. Assert expect(page.getByTestId('counter-button')).toHaveText('Clicked 1 time') (singular, no trailing 's').
    - expect: Button text is exactly 'Clicked 1 time', not 'Clicked 1 times'

#### 1.3. Clicking twice shows plural grammar ("2 times")

**File:** `tests/buttons/click-counter.spec.ts`

**Steps:**
  1. Navigate to /buttons from the seed home page.
    - expect: Counter button reads 'Clicked 0 times'
  2. Click page.getByTestId('counter-button') a first time.
    - expect: Button text becomes 'Clicked 1 time' (verify via toHaveText before proceeding)
  3. Click page.getByTestId('counter-button') a second time.
    - expect: Click registers without error
  4. Assert expect(page.getByTestId('counter-button')).toHaveText('Clicked 2 times').
    - expect: Button text is exactly 'Clicked 2 times'

#### 1.4. Rapid/many sequential clicks increment the counter correctly (edge case)

**File:** `tests/buttons/click-counter.spec.ts`

**Steps:**
  1. Navigate to /buttons from the seed home page.
    - expect: Counter button reads 'Clicked 0 times'
  2. Click page.getByTestId('counter-button') 10 times in a tight loop (await each click sequentially, no manual delay between clicks).
    - expect: All 10 clicks register without error or being dropped
  3. Assert expect(page.getByTestId('counter-button')).toHaveText('Clicked 10 times').
    - expect: Button text is exactly 'Clicked 10 times', confirming no click was lost or double-counted and plural grammar holds for counts greater than 1

#### 1.5. Counter resets to zero after a full page reload (state does not persist)

**File:** `tests/buttons/click-counter.spec.ts`

**Steps:**
  1. Navigate to /buttons from the seed home page.
    - expect: Counter button reads 'Clicked 0 times'
  2. Click page.getByTestId('counter-button') 3 times.
    - expect: Button text becomes 'Clicked 3 times' (verify via toHaveText)
  3. Reload the page with page.reload() (or page.goto('/buttons') again).
    - expect: Page reloads successfully and shows the Buttons page content
  4. Assert expect(page.getByTestId('counter-button')).toHaveText('Clicked 0 times').
    - expect: Counter has reset to 'Clicked 0 times', confirming click count is held only in client-side state and is not persisted across reloads

#### 1.6. Counter button remains enabled and clickable after multiple clicks

**File:** `tests/buttons/click-counter.spec.ts`

**Steps:**
  1. Navigate to /buttons from the seed home page.
    - expect: Counter button reads 'Clicked 0 times'
  2. Click page.getByTestId('counter-button') once, then assert expect(page.getByTestId('counter-button')).toBeEnabled().
    - expect: Button is enabled and not disabled after a click, unlike the async action button
  3. Click the counter button several more times (e.g. 5 additional clicks).
    - expect: Each click is accepted immediately with no disabled/loading state ever appearing on this button
  4. Assert expect(page.getByTestId('counter-button')).toHaveText('Clicked 6 times').
    - expect: Final count reflects all 6 clicks

### 2. AC2: Async Action Loading State

**Seed:** `seed.spec.ts`

#### 2.1. Async action button shows initial idle state with no result message

**File:** `tests/buttons/async-action.spec.ts`

**Steps:**
  1. Navigate to /buttons from the seed home page.
    - expect: Page displays the 'Async action with loading state' section
  2. Assert expect(page.getByTestId('async-action-button')).toHaveText('Run action') and expect(page.getByTestId('async-action-button')).toBeEnabled().
    - expect: Button reads 'Run action' and is enabled
  3. Assert expect(page.getByTestId('async-action-result')).toHaveCount(0) (or not.toBeVisible()).
    - expect: The async-action-result element does not exist in the DOM before any action has completed

#### 2.2. Happy path: clicking Run action shows Processing… and disables the button

**File:** `tests/buttons/async-action.spec.ts`

**Steps:**
  1. Navigate to /buttons from the seed home page.
    - expect: Async action button reads 'Run action' and is enabled
  2. Click page.getByTestId('async-action-button').
    - expect: Click registers
  3. Assert expect(page.getByTestId('async-action-button')).toHaveText('Processing…') using the built-in retrying assertion (do not use page.waitForTimeout to detect this).
    - expect: Button text becomes exactly 'Processing…' (single ellipsis character)
  4. Assert expect(page.getByTestId('async-action-button')).toBeDisabled().
    - expect: Button is disabled while processing

#### 2.3. Happy path: async action completes, re-enables button, and shows completion message

**File:** `tests/buttons/async-action.spec.ts`

**Steps:**
  1. Navigate to /buttons from the seed home page.
    - expect: Async action button reads 'Run action' and is enabled
  2. Click page.getByTestId('async-action-button').
    - expect: Button immediately shows 'Processing…' and is disabled (optionally assert this as an intermediate check)
  3. Wait for completion using expect(page.getByTestId('async-action-button')).toHaveText('Run action', { timeout: 5000 }) — a polling assertion, not a fixed sleep — to allow the ~1.2s async delay to elapse.
    - expect: Button text reverts to 'Run action' once processing finishes
  4. Assert expect(page.getByTestId('async-action-button')).toBeEnabled().
    - expect: Button is re-enabled after completion
  5. Assert expect(page.getByTestId('async-action-result')).toHaveText('Action completed.').
    - expect: Result message element is now present and reads exactly 'Action completed.'

#### 2.4. Business rule: clicking Run action again while processing has no effect (cannot re-trigger)

**File:** `tests/buttons/async-action.spec.ts`

**Steps:**
  1. Navigate to /buttons from the seed home page.
    - expect: Async action button reads 'Run action' and is enabled
  2. Click page.getByTestId('async-action-button') to start the action.
    - expect: Button shows 'Processing…' and becomes disabled (assert via expect().toHaveText and toBeDisabled())
  3. While still disabled/processing, attempt to click page.getByTestId('async-action-button') again (e.g. using { force: true } or a programmatic click to bypass Playwright's actionability check that a disabled element can't normally be clicked).
    - expect: The click attempt does not throw an unhandled error that fails the test setup, and importantly does not restart or duplicate the action
  4. Assert the button text is still 'Processing…' immediately after the second click attempt (expect(...).toHaveText('Processing…')), confirming the second click did not reset the processing state or restart the timer.
    - expect: Button remains in 'Processing…' state, unaffected by the second click
  5. Wait for completion via expect(page.getByTestId('async-action-button')).toHaveText('Run action', { timeout: 5000 }).
    - expect: Action completes once, consistent with the original single trigger — total elapsed time is consistent with a single ~1.2s run, not two sequential runs
  6. Assert expect(page.getByTestId('async-action-result')).toHaveText('Action completed.') and confirm there is only one such result element on the page (expect(page.getByTestId('async-action-result')).toHaveCount(1)).
    - expect: Exactly one completion result is shown, proving the second click while processing did not queue or trigger an additional run

#### 2.5. Async action can be re-run after a completed cycle

**File:** `tests/buttons/async-action.spec.ts`

**Steps:**
  1. Navigate to /buttons from the seed home page.
    - expect: Async action button reads 'Run action' and is enabled
  2. Click page.getByTestId('async-action-button') and wait for expect(page.getByTestId('async-action-button')).toHaveText('Run action', { timeout: 5000 }) to confirm the first run completed.
    - expect: First run completes, button re-enabled, async-action-result shows 'Action completed.'
  3. Click page.getByTestId('async-action-button') a second time (a fresh run, not while processing).
    - expect: Button is clickable again since it is enabled; click registers
  4. Assert expect(page.getByTestId('async-action-button')).toHaveText('Processing…') and expect(page.getByTestId('async-action-button')).toBeDisabled().
    - expect: Second run enters processing state exactly as the first run did
  5. Wait for expect(page.getByTestId('async-action-button')).toHaveText('Run action', { timeout: 5000 }) again.
    - expect: Second run completes and button re-enables
  6. Assert expect(page.getByTestId('async-action-result')).toHaveText('Action completed.').
    - expect: Result still correctly reads 'Action completed.' after the second successful run, confirming the action can be legitimately re-triggered once idle (as opposed to while processing, per the business rule tested separately)

#### 2.6. Async action result does not persist across a page reload

**File:** `tests/buttons/async-action.spec.ts`

**Steps:**
  1. Navigate to /buttons from the seed home page.
    - expect: Async action button reads 'Run action'
  2. Click page.getByTestId('async-action-button') and wait for expect(page.getByTestId('async-action-button')).toHaveText('Run action', { timeout: 5000 }) to confirm completion.
    - expect: Action completes; async-action-result shows 'Action completed.'
  3. Reload the page with page.reload() (or navigate to /buttons again).
    - expect: Page reloads successfully
  4. Assert expect(page.getByTestId('async-action-button')).toHaveText('Run action') and expect(page.getByTestId('async-action-result')).toHaveCount(0).
    - expect: Button is back to its idle 'Run action' state and the result element is gone, confirming no persistence of async action state across reloads
