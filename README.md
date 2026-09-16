# ⚡ HabitFlow Pro — Adaptive AI Routine & Flow Coach

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![RevenueCat: Paywalls v2](https://img.shields.io/badge/RevenueCat-Paywalls%20v2-red.svg)](https://www.revenuecat.com)
[![Web Billing: Stripe](https://img.shields.io/badge/RevenueCat-Web%20Billing-blueviolet.svg)](https://www.revenuecat.com/docs/web/web-billing)
[![Tests: 100% Passing](https://img.shields.io/badge/Tests-10%2F10%20Passed-emerald.svg)](./test)

> **Built for the [RevenueCat Ship-a-thon (Devpost)](https://revenuecat-ship-a-thon.devpost.com/)**  
> *Submission Deadline: October 4, 2026*

HabitFlow Pro is an intelligent, cross-platform habit tracking application powered by **RevenueCat's 2026 Monetization Stack**. It showcases dynamic in-app subscriptions, **Paywalls v2** with countdown timers, automatic downsell **Exit Offers**, an **In-App Customer Center** for self-service subscription management, and unified cross-platform entitlement gating across iOS, Android, and React Native Web (via RevenueCat Web Billing + Stripe).

---

## 💎 Monetization Architecture & 2026 Features

```
[ Mobile App / React Native Web ]
        │
        ├──► Free Tier (Up to 3 active habits)
        └──► Pro Tier (Unlimited habits + Adaptive AI Behavioral Coach)
                 │
        ┌────────┴──────────────────────────┐
        ▼                                   ▼
 [ Paywalls v2 Engine ]            [ Customer Center Portal ]
  ├── Countdown Flash Sale          ├── In-App Plan Changes
  ├── Multipage Offerings           ├── Self-Service Retention Surveys
  │   ├── Annual ($39.99/yr)        ├── Restore Purchases
  │   ├── Monthly ($4.99/mo)        └── Auto-Renew Management
  │   └── Lifetime ($89.99)                 │
  └── Exit Rescue Offer ($2.49/mo)          │
        │                                   │
        ▼                                   ▼
[ Unified Entitlement Manager ] ◄─── [ Webhook Event Lifecycle ]
  ├── pro_access active status        ├── INITIAL_PURCHASE
  ├── Cross-platform sync             ├── RENEWAL & UNCANCELLATION
  └── RevenueCat Web Checkout         ├── CANCELLATION (Grace Period)
                                      └── EXPIRATION
```

### 1. Paywalls v2 with Interactive Components & Countdown Timers
Features dynamic paywall templates with real-time countdown banners, tier comparison matrices, and 7-day free trial options.

### 2. High-Converting Exit Offer Rescue Deals
Detects when a user attempts to dismiss the paywall without purchasing and immediately presents a targeted 50% discount rescue offer ($2.49/mo), salvaging conversion drop-offs.

### 3. In-App Customer Center
Gives subscribers a native, self-service dashboard to manage their renewal state, inspect billing transaction histories, restore purchases across devices, or participate in cancelation retention surveys.

### 4. Cross-Platform Entitlement & Web Billing Support
Provides unified entitlement verification (`isPro()`) that synchronizes mobile App Store and Google Play subscriptions with RevenueCat Web Billing sessions.

### 5. Automated Server Webhook Processor
Handles real-time server-to-server webhook notifications: `INITIAL_PURCHASE`, `RENEWAL`, `CANCELLATION`, and `EXPIRATION`.

---

## 📁 Repository Structure

```
revenuecat-shipaton/
├── src/
│   ├── habit_engine.js         # Habit state, streaks, and completion logger
│   ├── revenuecat_manager.js   # Paywalls v2, Exit Offers, Customer Center & Webhooks
│   ├── ai_coach.js             # Behavioral habit stacking & burnout prevention
│   ├── server.js               # Node.js HTTP & Webhook receiver server
│   └── public/
│       └── index.html          # Interactive HabitFlow Pro & Paywall v2 web application
├── test/
│   └── verify_habitflow.js     # 10-step automated verification suite
├── SPECIFICATION.md            # Monetization & software specification
├── ROADMAP.md                  # Development sprint roadmap
├── package.json
└── README.md
```

---

## 🚀 Quickstart & Interactive Demo

### Prerequisites
- Node.js `v20.0.0+`

### Setup & Run
```bash
# Clone the repository
git clone https://github.com/akmalkhaniub/habitflow-pro.git
cd habitflow-pro

# Install dependencies
npm install

# Start the interactive server
node src/server.js
# Access the web app at http://localhost:3001
```

### Exploring the Interactive UI
1. **Free Tier Limit**: Add a 3rd and 4th habit to see the 3-habit limit trigger the **Paywall v2 modal**.
2. **Paywall v2 & Countdown**: View the 24h countdown banner, select Annual/Monthly/Lifetime packages, or test purchasing.
3. **Exit Offer**: Click the Paywall close (`✕`) button to trigger the **50% Off Rescue Offer ($2.49/mo)**.
4. **AI Habit Coach**: Upgrade to Pro to immediately unlock personalized behavioral habit stacking.
5. **Customer Center**: Click **"Customer Center"** in the top navigation to view subscription status and simulate auto-renewal cancellations.

---

## 🧪 Automated Verification Suite

Run all 10 automated unit and integration tests:
```bash
node test/verify_habitflow.js
```

### Verification Results
```
🧪 Starting HabitFlow Pro Automated Verification Suite (RevenueCat Ship-a-thon 2026)...

1️⃣ Testing Free Tier Habit Gating...
   ✅ Free tier limit strictly enforced at 3 habits.
2️⃣ Testing Streak Calculation...
   ✅ 3-day continuous streak verified: 3 days.
3️⃣ Testing AI Coach Paywall Trigger on Free Tier...
   ✅ Paywall triggered correctly: Upgrade to HabitFlow Pro to unlock personalized AI Routine Coaching...
4️⃣ Testing RevenueCat Paywalls v2 Offerings & Exit Offer Structure...
   📦 Available packages: ANNUAL: $39.99, MONTHLY: $4.99, LIFETIME: $89.99
   🎁 Exit offer verified: Wait! Claim 50% Off Pro
5️⃣ Testing RevenueCat Subscription Purchase Flow...
   💳 Simulated purchase successful! Transaction ID: txn_1789510632023
   👑 Pro Entitlement Active: true
6️⃣ Testing Pro Tier Unlocked Privileges...
   ✅ Successfully added 4th habit after upgrading to Pro
7️⃣ Testing AI Coach Insights on Pro Account...
   💡 Generated AI Insights count: 1
8️⃣ Testing Customer Center Data & Self-Service Capabilities...
   ⚙️ Customer Center verified with plan: habitflow_3999_1y
9️⃣ Testing RevenueCat Webhook Event Lifecycle...
   ✅ Webhook lifecycle: CANCELLATION & EXPIRATION revoked entitlement as expected.
🔟 Testing Exit Offer Re-engagement & React Native Web Billing Checkout...
   🌐 React Native Web Billing URL verified: https://checkout.revenuecat.com/v1/sessions?...

🎉 ALL 10 HABITFLOW PRO & REVENUECAT 2026 TESTS PASSED WITH 100% SUCCESS!
```

---

## ⚖️ License
MIT License. Created by Akmal Khan for the RevenueCat Ship-a-thon 2026.
