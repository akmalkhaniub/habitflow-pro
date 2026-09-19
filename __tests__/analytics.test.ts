import assert from 'assert';
import { analytics, MemorySink } from '../src/services/analytics';

// Pure analytics/funnel suite (no React Native) — runs in Node via tsx.
console.log('🧪 HabitFlow Pro — analytics & funnel suite\n');
let passed = 0;
const ok = (label: string, cond: boolean) => {
  assert(cond, label);
  passed++;
  console.log(`   ✅ ${label}`);
};

// Fresh instance state.
analytics.reset();
const sink = new MemorySink();
analytics.addSink(sink);
let now = 1000;
analytics.setClock(() => now);

// 1. Events are recorded with timestamps, in order.
console.log('1️⃣ Event capture...');
analytics.track({ name: 'app_opened' });
now = 1100;
analytics.track({ name: 'paywall_viewed', source: 'coach_lock' });
ok('records events in order', sink.names().join(',') === 'app_opened,paywall_viewed');
ok('stamps events with the clock', sink.events[1].ts === 1100);
ok('last() returns the newest event', sink.last()?.name === 'paywall_viewed');

// 2. Typed payloads survive.
const pv = sink.events[1].event;
ok('paywall source retained', pv.name === 'paywall_viewed' && pv.source === 'coach_lock');

// 3. Conversion funnel math.
console.log('\n2️⃣ Funnel conversion...');
analytics.track({ name: 'paywall_viewed', source: 'habit_limit' }); // 2 views total
analytics.track({ name: 'purchase_started', packageId: 'annual' });
analytics.track({ name: 'purchase_completed', packageId: 'annual', mock: true });
ok('view→purchase conversion = 1 completed / 2 views = 0.5', analytics.conversionRate(sink, 'paywall_viewed', 'purchase_completed') === 0.5);
ok('start→complete conversion = 1.0', analytics.conversionRate(sink, 'purchase_started', 'purchase_completed') === 1);
ok('unknown funnel = 0', analytics.conversionRate(sink, 'restore_completed', 'purchase_completed') === 0);

// 4. Cancellation is tracked distinctly from failure.
console.log('\n3️⃣ Cancel vs fail...');
analytics.track({ name: 'purchase_cancelled', packageId: 'monthly' });
analytics.track({ name: 'purchase_failed', packageId: 'monthly', reason: 'network' });
ok('cancel and fail are separate events', sink.names().includes('purchase_cancelled') && sink.names().includes('purchase_failed'));
const failed = sink.events.find((e) => e.event.name === 'purchase_failed')!.event;
ok('failure carries a reason', failed.name === 'purchase_failed' && failed.reason === 'network');

// 5. A throwing sink never breaks tracking.
console.log('\n4️⃣ Resilience...');
analytics.addSink({ track() { throw new Error('sink down'); } });
let threw = false;
try { analytics.track({ name: 'app_opened' }); } catch { threw = true; }
ok('a broken sink does not throw to the caller', threw === false);

console.log(`\n🎉 ALL ${passed} HABITFLOW ANALYTICS ASSERTIONS PASSED.\n`);
