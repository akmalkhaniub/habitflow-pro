import assert from 'assert';
import { HabitEngine } from '../src/habit_engine.js';
import { RevenueCatManager, REVENUECAT_CONFIG } from '../src/revenuecat_manager.js';
import { AdaptiveAICoach } from '../src/ai_coach.js';

console.log('🧪 Starting HabitFlow Pro Automated Verification Suite (RevenueCat Ship-a-thon 2026)...\n');

const engine = new HabitEngine();
const rc = new RevenueCatManager();
const coach = new AdaptiveAICoach(rc);

// Test 1: Habit Creation & Free Tier Gate
console.log('1️⃣ Testing Free Tier Habit Gating...');
assert(rc.canCreateHabit(engine.habits.size) === true, 'Should allow 1st habit');
const h1 = engine.addHabit({ title: 'Morning Deep Work', category: 'focus' });

assert(rc.canCreateHabit(engine.habits.size) === true, 'Should allow 2nd habit');
const h2 = engine.addHabit({ title: '30m Aerobic Zone 2 Cardio', category: 'health' });

assert(rc.canCreateHabit(engine.habits.size) === true, 'Should allow 3rd habit');
const h3 = engine.addHabit({ title: 'Read 15 Pages Systems Architecture', category: 'learning' });

// 4th habit should be blocked on free tier
assert(rc.canCreateHabit(engine.habits.size) === false, 'Free tier must block 4th habit');
console.log('   ✅ Free tier limit strictly enforced at 3 habits.');

// Test 2: Streak Tracking Mechanics
console.log('2️⃣ Testing Streak Calculation...');
const today = new Date();
const yesterday = new Date();
yesterday.setDate(today.getDate() - 1);
const twoDaysAgo = new Date();
twoDaysAgo.setDate(today.getDate() - 2);

const d0 = today.toISOString().split('T')[0];
const d1 = yesterday.toISOString().split('T')[0];
const d2 = twoDaysAgo.toISOString().split('T')[0];

engine.recordCompletion(h1.id, d2);
engine.recordCompletion(h1.id, d1);
engine.recordCompletion(h1.id, d0);

const streak = engine.calculateStreak(h1.id);
assert(streak === 3, `Expected streak of 3, got ${streak}`);
console.log(`   ✅ 3-day continuous streak verified: ${streak} days.`);

// Test 3: AI Coach Paywall Gating
console.log('3️⃣ Testing AI Coach Paywall Trigger on Free Tier...');
const freeCoachResult = coach.generateInsights(engine);
assert(freeCoachResult.locked === true, 'AI Coach must be locked on free tier');
assert(freeCoachResult.paywallTrigger === true, 'Must trigger paywall');
console.log('   ✅ Paywall triggered correctly:', freeCoachResult.message);

// Test 4: RevenueCat Paywalls v2 Offerings & Exit Offer metadata
console.log('4️⃣ Testing RevenueCat Paywalls v2 Offerings & Exit Offer Structure...');
const offerings = rc.getOfferings();
assert(offerings.current.availablePackages.length === 3, 'Must offer Annual, Monthly, Lifetime');
assert(offerings.current.paywall.exitOffer.packageIdentifier === '$rc_exit_offer', 'Exit offer must exist');
console.log('   📦 Available packages:', offerings.current.availablePackages.map(p => `${p.packageType}: $${p.product.priceUSD}`).join(', '));
console.log('   🎁 Exit offer verified:', offerings.current.paywall.exitOffer.title);

// Test 5: Execute Annual Subscription Purchase
console.log('5️⃣ Testing RevenueCat Subscription Purchase Flow...');
const purchaseResult = await rc.purchasePackage('$rc_annual');
assert(rc.isPro() === true, 'User must possess active pro_access entitlement');
assert(purchaseResult.customerInfo.entitlements.active[REVENUECAT_CONFIG.ENTITLEMENT_ID].isActive === true, 'Entitlement must be active');
console.log('   💳 Simulated purchase successful! Transaction ID:', purchaseResult.transaction.transactionId);
console.log('   👑 Pro Entitlement Active: true');

// Test 6: Pro Tier Capability Verification
console.log('6️⃣ Testing Pro Tier Unlocked Privileges...');
assert(rc.canCreateHabit(engine.habits.size) === true, 'Pro tier must allow unlimited habits');
const h4 = engine.addHabit({ title: 'Evening Digital Sunset & Journaling', category: 'mindfulness' });
console.log('   ✅ Successfully added 4th habit after upgrading to Pro:', h4.title);

// Test 7: AI Coach Personalized Output
console.log('7️⃣ Testing AI Coach Insights on Pro Account...');
const proCoachResult = coach.generateInsights(engine);
assert(proCoachResult.locked === false, 'AI Coach must be unlocked for Pro user');
assert(Array.isArray(proCoachResult.insights), 'Insights must be an array');
console.log('   💡 Generated AI Insights count:', proCoachResult.insights.length);

// Test 8: Customer Center Self-Service Portal
console.log('8️⃣ Testing Customer Center Data & Self-Service Capabilities...');
const customerCenter = rc.getCustomerCenterData();
assert(customerCenter.isSubscribed === true, 'Customer center must show active subscription');
assert(customerCenter.availableActions.includes('CHANGE_PLAN'), 'Must permit plan changes');
assert(customerCenter.availableActions.includes('CANCEL_SUBSCRIPTION'), 'Must support self-service cancellation');
console.log('   ⚙️ Customer Center verified with plan:', customerCenter.planTitle);

// Test 9: Webhook Lifecycle Handling
console.log('9️⃣ Testing RevenueCat Webhook Event Lifecycle...');
// Webhook: Cancellation
const cancelEvent = {
  type: 'CANCELLATION',
  app_user_id: rc.userId,
  event_timestamp_ms: Date.now()
};
const cancelRes = rc.handleWebhookEvent(cancelEvent);
assert(cancelRes.willExpireAtEndOfPeriod === true, 'Cancellation should mark autoRenew false');

// Webhook: Expiration
const expireEvent = {
  type: 'EXPIRATION',
  app_user_id: rc.userId,
  event_timestamp_ms: Date.now()
};
rc.handleWebhookEvent(expireEvent);
assert(rc.isPro() === false, 'Expiration must revoke pro_access entitlement');
console.log('   ✅ Webhook lifecycle: CANCELLATION & EXPIRATION revoked entitlement as expected.');

// Test 10: Exit Offer Purchase & Web Billing Checkout URL
console.log('🔟 Testing Exit Offer Re-engagement & React Native Web Billing Checkout...');
const exitPurchase = await rc.purchasePackage('$rc_exit_offer');
assert(rc.isPro() === true, 'Exit offer purchase must reinstate Pro entitlement');
const webCheckoutUrl = rc.createWebCheckoutUrl('$rc_annual');
assert(webCheckoutUrl.includes('checkout.revenuecat.com'), 'Web billing URL must point to RevenueCat Checkout');
console.log('   🌐 React Native Web Billing URL verified:', webCheckoutUrl);

console.log('\n🎉 ALL 10 HABITFLOW PRO & REVENUECAT 2026 TESTS PASSED WITH 100% SUCCESS!\n');
