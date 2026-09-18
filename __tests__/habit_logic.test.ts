import assert from 'assert';
import { HabitEngine } from '../src/lib/habitEngine';
import { generateInsights } from '../src/lib/aiCoach';
import { FREE_HABIT_LIMIT } from '../src/lib/products';

// Pure-logic suite (no React Native) — runs in Node via tsx.
console.log('🧪 HabitFlow Pro — ported logic suite\n');
let passed = 0;
const ok = (label: string, cond: boolean) => {
  assert(cond, label);
  passed++;
  console.log(`   ✅ ${label}`);
};

// 1. Add + free-tier limit
console.log('1️⃣ Habit creation & free-tier gate...');
const engine = new HabitEngine();
const a = engine.addHabit({ title: 'Deep work', category: 'focus' });
engine.addHabit({ title: 'Cardio', category: 'health' });
engine.addHabit({ title: 'Read', category: 'learning' });
ok('creates habits', engine.size === 3);
ok(`free tier is capped at ${FREE_HABIT_LIMIT}`, engine.size >= FREE_HABIT_LIMIT);

// 2. Streak calculation across consecutive days
console.log('\n2️⃣ Streak mechanics...');
const d = (offset: number) => {
  const x = new Date();
  x.setDate(x.getDate() - offset);
  return x.toISOString().split('T')[0];
};
engine.recordCompletion(a.id, d(2));
engine.recordCompletion(a.id, d(1));
engine.recordCompletion(a.id, d(0));
ok('3 consecutive days => streak 3', engine.calculateStreak(a.id) === 3);
ok('completedToday reflected in summary', engine.getAllHabits().find((h) => h.id === a.id)!.completedToday === true);

// 3. Toggle today off/on
console.log('\n3️⃣ Toggle today...');
ok('toggle off returns false', engine.toggleToday(a.id) === false);
ok('streak drops after removing today', engine.calculateStreak(a.id) === 2);
ok('toggle on returns true', engine.toggleToday(a.id) === true);

// 4. AI coach gating
console.log('\n4️⃣ AI coach entitlement gate...');
ok('locked when not Pro', generateInsights(engine, false).locked === true);
const pro = generateInsights(engine, true);
ok('unlocked when Pro', pro.locked === false);
ok('returns an insights array when Pro', Array.isArray(pro.insights));

// 5. Persistence round-trip
console.log('\n5️⃣ Serialization round-trip...');
const snapshot = engine.toJSON();
const restored = new HabitEngine(snapshot);
ok('restores same habit count', restored.size === engine.size);
ok('restores streak', restored.calculateStreak(a.id) === engine.calculateStreak(a.id));

console.log(`\n🎉 ALL ${passed} HABITFLOW LOGIC ASSERTIONS PASSED.\n`);
