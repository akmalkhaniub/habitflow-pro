# Changelog

## [Unreleased]

### Toward L3 (2026-09-19)
- **Analytics funnel** (`src/services/analytics.ts`): typed events for the conversion
  funnel (paywall_viewed → purchase_started → purchase_completed/cancelled/failed →
  restore), pluggable sinks, and a conversionRate() helper. Wired through the purchase
  flow, habit actions, coach views, and app open.
- **Purchase robustness**: `purchases.purchase()` now returns a typed result and
  distinguishes user-cancellation from a real error, so a cancel is silent (not a failure
  alert). Paywall handles each outcome.
- **Streak-risk reminders** (`src/services/notifications.ts`): pure, unit-tested schedule
  logic (at-risk selection, evening reminder time, body copy) plus an expo-notifications
  wrapper that no-ops without permission; rescheduled on every habit change.
- **Paywall attribution**: the paywall carries a `source` (habit_limit / coach_lock /
  settings) for funnel analysis.
- **Build-ready**: `eas.json` (development / preview / production profiles);
  expo-notifications plugin in app.json.
- **Tests**: +analytics suite (10) and +notifications suite (9); `npm run verify`
  (typecheck + all suites). Total 31 pure-logic assertions.
- **docs/DEMO_SCRIPT.md**: turnkey 3-minute demo beat sheet.

### Pivoted to a native mobile app (Expo / React Native) — 2026-09-18
See prior entry: migrated from the Node web prototype (preserved under `legacy-web/`) to
Expo + React Native with RevenueCat `react-native-purchases`.

### Notes
- Live App Store / Play Store sandbox purchases + the demo video require a device/EAS
  build and a RevenueCat account (native modules don't run in Expo Go).
