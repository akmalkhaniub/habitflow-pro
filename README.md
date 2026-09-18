# ⚡ HabitFlow Pro — Adaptive AI Habit Coach (iOS & Android)

[![Platform: Expo / React Native](https://img.shields.io/badge/Expo-React%20Native-000020.svg)](https://expo.dev)
[![TypeScript: strict](https://img.shields.io/badge/TypeScript-strict-3178c6.svg)](https://www.typescriptlang.org)
[![RevenueCat: react-native-purchases](https://img.shields.io/badge/RevenueCat-react--native--purchases-red.svg)](https://www.revenuecat.com)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)

> **Built for the [RevenueCat Shipaton 2026](https://revenuecat-shipaton-2026.devpost.com/)** — a shipped mobile app with a real in-app-purchase lifecycle.

HabitFlow Pro is a cross-platform **Expo / React Native** habit tracker with an adaptive
AI coach, gated behind a **RevenueCat** `pro_access` entitlement. Free users get up to
3 habits; Pro unlocks unlimited habits, the AI coach, streak shielding, and cloud sync.

> **Note:** this repository was migrated from an earlier Node.js web prototype (now kept
> under [`legacy-web/`](./legacy-web)) to a native mobile app, which is what the Shipaton
> requires. The core habit + AI-coach logic was ported verbatim into `src/lib`.

## ✨ Features

- **Offline-first habit tracking** — create habits, complete them, track streaks and
  streak-break risk. Persisted locally via `AsyncStorage`.
- **RevenueCat monetization** — `react-native-purchases` with a Paywall screen, three
  packages (Monthly / Annual / Lifetime), purchase + restore flows, and the `pro_access`
  entitlement gating premium features.
- **Adaptive AI Coach** (Pro) — deterministic, rule-based insights: streak-preservation
  nudges, habit-stacking suggestions, and burnout defense.
- **Simulated store fallback** — with no RevenueCat key configured, the app runs a
  simulated store so the entire purchase UX is demoable in Expo Go / web.

## 🏗️ Architecture

```
App.tsx                       Providers + bottom-tab navigation + paywall modal
src/
  lib/
    habitEngine.ts            Pure habit/streak logic (ported, unit-tested)
    aiCoach.ts                Pure rule-based coaching (ported)
    products.ts               RevenueCat products / entitlement / free limit
  services/
    purchases.ts              react-native-purchases wrapper + mock fallback
    storage.ts                AsyncStorage persistence
  state/
    HabitStore.tsx            Habit context (load/save/toggle)
    PurchasesProvider.tsx     Entitlement + offerings context
    PaywallProvider.tsx       App-wide paywall modal controller
  screens/                    Today, Coach, Settings, Paywall
```

## 🚀 Getting started

```bash
npm install
npm run typecheck     # tsc --noEmit
npm test              # pure ported-logic suite (Node via tsx)
npm start             # Expo dev server (press i / a for iOS / Android)
```

Requires the Expo toolchain; run on a simulator/device or Expo Go.

## 💳 Enabling live RevenueCat purchases

1. Create a project in the [RevenueCat dashboard](https://app.revenuecat.com); add the
   `pro_access` entitlement and the three products from `src/lib/products.ts`.
2. Put your **public SDK keys** in `app.json` under `expo.extra.revenueCatIosKey` /
   `revenueCatAndroidKey` (or wire them via EAS secrets).
3. Build a dev/production client (`eas build`) — `react-native-purchases` needs native
   modules, so live purchases don't run in Expo Go. Without keys the app uses the
   simulated store.

## 🧪 Testing

`npm test` runs `__tests__/habit_logic.test.ts` (pure logic, no native modules): habit
creation + free-tier gate, streak math, today-toggle, AI-coach entitlement gating, and a
persistence round-trip. `npm run typecheck` type-checks the whole app in strict mode.
