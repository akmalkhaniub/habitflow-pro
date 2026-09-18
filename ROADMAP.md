# Roadmap & Milestones: HabitFlow Pro
**Hackathon:** RevenueCat Shipaton 2026  
**Target Submission Deadline:** October 01, 2026 (~15 Days Sprint)  

---

> **Status legend (updated 2026-09-18):** `[x]` implemented in code · `[~]` partial / needs a device build to verify · `[ ]` not started.
> **Reality note:** **Migrated to a native Expo / React Native app (TypeScript, strict).** Habit engine, AI coach, and RevenueCat `pro_access` entitlement logic ported into `src/lib` + `src/services`; screens (Today / Coach / Paywall / Settings) built with bottom-tab navigation. `react-native-purchases` is wired with a simulated-store fallback. The old web prototype is preserved under `legacy-web/`. Live purchases + on-device polish still need a dev/EAS build to verify.

## Phase 1: App Shell, State & Core UI (Days 1–4)
- [x] Initialize Expo project with TypeScript and React Navigation (bottom tabs).
- [x] Implement core habit creation, checklist rendering, and streak calculation engine.
- [x] Setup local persistent storage (AsyncStorage) for offline-first usage.
- [~] Add smooth animations, gesture handlers, and haptic feedback. *(haptics on toggle wired; richer animations pending)*

## Phase 2: RevenueCat SDK & Paywall Integration (Days 5–8)
- [x] Install and configure `react-native-purchases` (wrapper service + provider).
- [x] Configure Products & Entitlement (`pro_access`) — modeled in `src/lib/products.ts`; create in dashboard to go live.
- [x] Build custom paywall screen (packages, features, plan selection).
- [x] Implement purchase flow, restore purchases handler, and entitlement state.

## Phase 3: AI Coaching & Analytics (Days 9–11)
- [x] Port the AI routine/coach engine into the app (rule-based insights).
- [x] Gate AI coaching features behind `pro_access` entitlement check.
- [~] Add streak risk warning push notifications (Expo Notifications). *(risk computed + surfaced in UI; push notifications pending)*

## Phase 4: Production Polish, Demo & Submission (Days 12–15)
- [ ] Test purchase sandbox flows on both iOS simulator and Android emulator (needs EAS/dev build).
- [ ] Create promotional mockups, app screenshots, and record high-res video demonstration.
- [ ] Finalize Devpost project submission page, public GitHub repository, and documentation.
