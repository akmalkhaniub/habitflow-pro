# Changelog

## [Unreleased]

### Pivoted to a native mobile app (Expo / React Native) — 2026-09-18
The RevenueCat Shipaton requires a shipped mobile app with a real IAP lifecycle, so the
project was migrated from the Node.js web prototype to an **Expo / React Native** app
(TypeScript, strict). The previous web server is preserved under `legacy-web/`.

### Added
- Expo managed app: `App.tsx` (providers + bottom-tab navigation + paywall modal),
  `app.json`, `tsconfig.json` (extends `expo/tsconfig.base`), `babel.config.js`.
- **RevenueCat integration** via `react-native-purchases`: `src/services/purchases.ts`
  wraps configure / offerings / purchase / restore / entitlement checks, with a
  deterministic simulated-store fallback when no SDK key is configured.
- Screens: Today (habits + progress + add), Coach (Pro-gated AI insights), Paywall
  (packages, purchase, restore), Settings.
- Offline-first persistence via `@react-native-async-storage/async-storage`.
- Ported the original habit engine and AI coach into pure, unit-tested modules
  (`src/lib/habitEngine.ts`, `src/lib/aiCoach.ts`).
- Pure-logic test suite runnable in Node via `tsx` (`__tests__/habit_logic.test.ts`).

### Changed
- Free tier limited to 3 habits; `pro_access` entitlement unlocks unlimited habits and
  the AI coach.

### Notes
- `react-native-purchases` needs native modules, so live purchases require a dev/EAS
  build (not Expo Go). Configure keys in `app.json` `expo.extra`. See README.
