# HabitFlow Pro — 3-Minute Demo Script (turnkey)

Goal: a judge sees a shipped mobile app with a working RevenueCat purchase lifecycle.
Record on a real device or simulator (screen recording), portrait.

## Pre-flight
1. Configure RevenueCat: `pro_access` entitlement + the three products from
   `src/lib/products.ts`; put the public SDK keys in `app.json` `expo.extra`.
2. `eas build --profile preview` (or `npx expo run:ios`) → install on the device.
3. Sign in to a sandbox App Store / Play tester account.

## Beat sheet (3:00)

**0:00–0:20 — Hook.** "HabitFlow Pro turns streaks into a habit. Free for three habits —
Pro unlocks unlimited habits and an AI coach." Show the Today tab with the progress ring.

**0:20–1:00 — Core loop.** Create a couple of habits, complete one (haptic + streak ticks
up). Show the daily completion percentage move. Mention offline-first: kill the network,
it still works, relaunch — state persists.

**1:00–1:40 — The gate (conversion).** Try to add a 4th habit → the paywall appears
(source `habit_limit`). Or open the Coach tab → it's locked with an upgrade CTA
(source `coach_lock`). Point out these are the funnel entry points we track.

**1:40–2:30 — Purchase (the money shot).** On the paywall pick Annual → run the **sandbox
purchase**. Pro unlocks: the 4th habit saves, the AI Coach fills with insights. Then show
**Restore purchases** works. Cancel path: start a purchase and back out — the app stays
quiet (a cancel isn't an error).

**2:30–3:00 — Retention + close.** Show a streak-risk state; mention the evening reminder
that fires when a streak is unfinished. Close: "Three habits free, unlimited with Pro,
monetized end-to-end with RevenueCat — shipped, not a mockup."

## Notes
- With no RC key the app runs a **simulated store** so the full flow still demos; say so
  up-front if you record without a live key.
- Funnel events (`paywall_viewed → purchase_started → purchase_completed`) are tracked via
  `src/services/analytics.ts` — swap MemorySink for RevenueCat/PostHog in production.
