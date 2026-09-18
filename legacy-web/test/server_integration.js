import assert from 'assert';
import { createHabitFlowServer } from '../src/server.js';

// End-to-end HTTP suite driving the real server on an ephemeral port.
// This is the layer that catches wiring bugs (startup crashes, missing methods,
// route/paywall behaviour) that pure unit tests on the engine miss.
console.log('🧪 Starting HabitFlow Pro Server Integration Suite...\n');

let passed = 0;
function ok(label, cond) {
  assert(cond, label);
  passed++;
  console.log(`   ✅ ${label}`);
}

const { server } = createHabitFlowServer();
await new Promise((resolve) => server.listen(0, resolve));
const { port } = server.address();
const base = `http://127.0.0.1:${port}`;
const get = (p) => fetch(base + p).then(async (r) => ({ status: r.status, body: await r.json().catch(() => ({})) }));
const post = (p, body, headers = {}) =>
  fetch(base + p, { method: 'POST', headers: { 'Content-Type': 'application/json', ...headers }, body: JSON.stringify(body) })
    .then(async (r) => ({ status: r.status, body: await r.json().catch(() => ({})) }));

try {
  // 1. Server boots and health reports the seeded state
  console.log('1️⃣ Health & startup...');
  const health = await get('/api/health');
  ok('server boots and /api/health returns 200', health.status === 200);
  ok('two habits seeded at startup', health.body.habitCount === 2);
  ok('starts on the free tier', health.body.isPro === false);

  // 2. State endpoint returns JSON-safe habits (no Sets leaking)
  console.log('\n2️⃣ State serialization...');
  const state = await get('/api/state');
  ok('/api/state returns 200', state.status === 200);
  ok('habits are serialized as an array', Array.isArray(state.body.habits));
  ok('habit exposes currentStreak', typeof state.body.habits[0].currentStreak === 'number');
  ok('offerings include 3 packages', state.body.offerings.current.availablePackages.length === 3);

  // 3. Free-tier paywall gate on the 4th habit
  console.log('\n3️⃣ Free-tier habit gating...');
  ok('validates missing title', (await post('/api/habits', {})).status === 400);
  const add3 = await post('/api/habits', { title: 'Read 15 pages' }); // 3rd habit
  ok('allows creating up to 3 habits', add3.status === 201);
  const add4 = await post('/api/habits', { title: 'Journaling' }); // 4th -> blocked
  ok('blocks 4th habit with 403 paywall', add4.status === 403 && add4.body.triggerPaywall === true);

  // 4. AI coach locked on free tier
  console.log('\n4️⃣ AI coach gating...');
  const coachFree = await get('/api/ai-coach');
  ok('AI coach locked before purchase', coachFree.body.locked === true);

  // 5. Purchase unlocks Pro, coach, and unlimited habits
  console.log('\n5️⃣ Purchase & Pro unlock...');
  const buy = await post('/api/purchase', { packageIdentifier: '$rc_annual' });
  ok('purchase succeeds', buy.status === 200 && buy.body.success === true);
  ok('now Pro', (await get('/api/health')).body.isPro === true);
  ok('AI coach unlocked after purchase', (await get('/api/ai-coach')).body.locked === false);
  ok('4th habit now allowed on Pro', (await post('/api/habits', { title: 'Journaling' })).status === 201);
  ok('invalid package identifier -> 400', (await post('/api/purchase', { packageIdentifier: 'bogus' })).status === 400);

  // 6. Habit completion + not-found handling
  console.log('\n6️⃣ Completion handling...');
  const firstId = (await get('/api/state')).body.habits[0].id;
  ok('recording completion returns 200', (await post('/api/habits/complete', { habitId: firstId })).status === 200);
  ok('unknown habit id -> 404', (await post('/api/habits/complete', { habitId: 'nope' })).status === 404);

  // 7. Webhook lifecycle
  console.log('\n7️⃣ Webhook lifecycle...');
  const expire = await post('/api/webhooks/revenuecat', { type: 'EXPIRATION', app_user_id: 'x' });
  ok('EXPIRATION webhook handled', expire.status === 200);
  ok('entitlement revoked after expiration', (await get('/api/health')).body.isPro === false);

  // 8. Security: path traversal + oversized body
  console.log('\n8️⃣ Security guards...');
  // Encoded so fetch forwards it literally (a raw '/../' is normalized client-side).
  const traversal = await fetch(base + '/..%2f..%2fserver.js');
  ok('encoded path traversal blocked (403)', traversal.status === 403);
  const big = await post('/api/habits', { title: 'x'.repeat(70 * 1024) });
  ok('oversized body rejected (413)', big.status === 413);

  console.log(`\n🎉 ALL ${passed} HABITFLOW SERVER INTEGRATION ASSERTIONS PASSED.\n`);
} finally {
  server.close();
}
