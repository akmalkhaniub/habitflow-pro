# Roadmap & Milestones: HabitFlow Pro
**Hackathon:** RevenueCat Shipaton 2026  
**Target Submission Deadline:** October 01, 2026 (~15 Days Sprint)  

---

## Phase 1: App Shell, State & Core UI (Days 1–4)
- [ ] Initialize Expo project with TypeScript, NativeWind/Tailwind, and React Navigation.
- [ ] Implement core habit creation, checklist rendering, and streak calculation engine.
- [ ] Setup local persistent storage (AsyncStorage / SQLite) for offline-first usage.
- [ ] Add smooth animations, gesture handlers, and haptic feedback.

## Phase 2: RevenueCat SDK & Paywall Integration (Days 5–8)
- [ ] Install and configure `react-native-purchases` and `react-native-purchases-ui`.
- [ ] Create RevenueCat project in dashboard, configure Products & Entitlement (`pro_access`).
- [ ] Build custom paywall screen and integrate RevenueCat's native Paywall component.
- [ ] Implement purchase flow, restore purchases handler, and customer state listener.

## Phase 3: AI Coaching & Analytics (Days 9–11)
- [ ] Integrate lightweight AI routine/coach engine (OpenAI / Anthropic API via secure proxy).
- [ ] Gate AI coaching features behind `pro_access` entitlement check.
- [ ] Add streak risk warning push notifications (Expo Notifications).

## Phase 4: Production Polish, Demo & Submission (Days 12–15)
- [ ] Test purchase sandbox flows on both iOS simulator and Android emulator.
- [ ] Create promotional mockups, app screenshots, and record high-res video demonstration.
- [ ] Finalize Devpost project submission page, public GitHub repository, and documentation.
