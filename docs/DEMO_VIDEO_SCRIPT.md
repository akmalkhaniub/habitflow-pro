# HabitFlow Pro — 3-minute demo script

Record the Expo app. Do not show the old web prototype in `legacy-web/`. There is no Paywalls v2 countdown, no exit offer, and no Customer Center in this build.

## Before you record

1. `npx expo start` and open the app.
2. If RevenueCat public SDK keys are in `app.json`, use a preview build (`eas build --profile preview`) and complete one sandbox purchase plus one restore.
3. If the keys are empty, the amber banner reads **Sandbox / Demo store**. Say that on camera. Do not call it a live purchase.

## Shot list (about 3 minutes)

1. **Today (0:00–0:40).** Show the two seeded habits, toggle one complete (haptic on device), and point at the streak-risk line if a streak is unfinished.
2. **Free limit (0:40–1:20).** Add a third habit, then try a fourth. The paywall opens. Point at **SANDBOX / SIMULATED STORE** or, with keys, the live package prices. Annual is marked Best value.
3. **Purchase (1:20–2:00).** Buy the annual package. Pro unlocks. Coach tab shows insights that were locked on Free.
4. **Restore (2:00–2:20).** Settings → Restore purchases. Say whether the store is simulated or RevenueCat live.
5. **Funnel (2:20–2:40).** Settings shows `paywall_viewed → purchase_started → purchase_completed` for this session. It stays on the device.
6. **Close (2:40–3:00).** Entitlement id is `pro_access`. Unlimited habits and the coach are what Pro unlocks.

## What not to say

- No flash sale, exit offer, or 28% rescue rate.
- No Customer Center.
- No localhost:3001 web demo.
