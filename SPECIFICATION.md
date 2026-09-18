# Technical Specification: HabitFlow Pro
**Project Name:** HabitFlow Pro (RevenueCat Shipaton 2026)  
**Target Platform:** iOS / Android (React Native via Expo)  
**Status:** Native Expo / React Native app implemented (updated 2026-09-18)  

> **Implementation status (2026-09-18):** Migrated to a native **Expo / React Native** app (TypeScript, strict). Built: bottom-tab app shell (Today / Coach / Paywall / Settings), ported habit + streak engine and rule-based AI coach (`src/lib`), `react-native-purchases` wrapper with `pro_access` gating and a simulated-store fallback (`src/services/purchases.ts`), AsyncStorage persistence, and a pure-logic test suite. The old web prototype is preserved under `legacy-web/`. Still needs a device/EAS build to verify live App Store / Play Store purchases; push notifications and richer animations pending.
**Version:** 1.0.0  

---

## 1. Architecture Overview
HabitFlow Pro uses an offline-first architecture with local SQLite storage synchronized against cloud state. In-app monetization is managed exclusively via RevenueCat `react-native-purchases`.

```mermaid
graph TD
    A[Mobile App UI (React Native/Expo)] --> B[Local State / WatermelonDB / SQLite]
    A --> C[RevenueCat SDK (Purchases)]
    C -->|Fetch Offerings / Paywall UI| D[RevenueCat API / App Store / Play Store]
    D -->|Entitlement Active| E[Unlock Pro Features: AI Coach & Cloud Sync]
    C -->|Webhooks| F[Backend Verification Service (Supabase / Edge Function)]
    F --> B
```

---

## 2. Functional Modules

### 2.1 Habit Tracking Engine
- Daily streak tracking, habit checklists, categorized tags (Health, Focus, Mindset).
- Haptic feedback and confetti particle physics upon completion of daily targets.

### 2.2 Adaptive AI Flow Coach
- Dynamic personalized coaching insights based on completion rates and time of day.
- Contextual advice to prevent streak fatigue and burnout.

### 2.3 RevenueCat Paywall Integration
- Support for multiple offerings:
  - Monthly Subscription ($4.99/mo)
  - Annual Subscription ($39.99/yr with 7-day free trial)
  - Lifetime Access ($89.99 one-time)
- Dynamic RevenueCat Paywalls (`RevenueCatUI.Paywall`) with zero-code visual updates.
- Entitlement checks guarding Pro AI coaching and cloud backup features.

---

## 3. Data Schema & Entitlements

### 3.1 RevenueCat Entitlement Schema
- **Entitlement ID:** `pro_access`
  - Identifier for all paid tiers (Monthly, Annual, Lifetime).
- **Offerings Configuration:**
  - `default`: Main onboarding paywall.
  - `retention_discount`: Discounted annual plan shown upon cancellation intent.

### 3.2 Local Habit Model
```typescript
interface Habit {
  id: string;
  title: string;
  category: 'focus' | 'health' | 'learning' | 'mindfulness';
  targetDaysPerWeek: number;
  completedTimestamps: number[];
  currentStreak: number;
  isArchived: boolean;
  createdAt: number;
}
```

---

## 4. Store Compliance & Acceptance Criteria
1. RevenueCat SDK initializes with anonymous user ID and seamlessly bridges to authenticated user ID on sign-in.
2. Paywall displays accurate localized pricing and links to Privacy Policy and Terms of Service.
3. Test sandbox purchase successfully unlocks `pro_access` entitlement instantly.
4. "Restore Purchases" button correctly queries and refreshes active customer entitlements.
