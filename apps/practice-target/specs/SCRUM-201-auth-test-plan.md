# Test Plan: SCRUM-201 - Authentication

> THROWAWAY FIXTURE used to verify `python -m app.delivery push` against the
> custom target repo during P1 closeout. Not agent output. Deleted after the run.

## Scenario 1: mock login reaches the dashboard
1. Go to `/`
2. Log in with `demo` / `password123`
3. Expect `/dashboard`
