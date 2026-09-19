import assert from 'assert';
import { HabitEngine } from '../src/lib/habitEngine';
import { generateInsights } from '../src/lib/aiCoach';

console.log('🧪 HabitFlow Pro — AI coach insight branches\n');
let passed = 0;
const ok = (l: string, c: boolean) => { assert(c, l); passed++; console.log(`   ✅ ${l}`); };

// Locked when not Pro
ok('locked without Pro', generateInsights(new HabitEngine(), false).locked === true);

// Onboarding when Pro + no habits
const empty = generateInsights(new HabitEngine(), true);
ok('onboarding insight when empty', empty.insights!.some((i) => i.type === 'ONBOARDING'));

// Habit stacking: two habits with different streak strength
const e2 = new HabitEngine();
const a = e2.addHabit({ title: 'Anchor', category: 'focus' });
e2.addHabit({ title: 'Emerging', category: 'health' });
const d = (o: number) => { const x = new Date(); x.setDate(x.getDate() - o); return x.toISOString().split('T')[0]; };
e2.recordCompletion(a.id, d(2)); e2.recordCompletion(a.id, d(1)); e2.recordCompletion(a.id, d(0));
const r2 = generateInsights(e2, true);
ok('habit-stacking insight surfaces', r2.insights!.some((i) => i.type === 'HABIT_STACKING'));
ok('reports a daily completion rate', typeof r2.dailyCompletionRate === 'number');

// Burnout: 8 habits, low completion
const e3 = new HabitEngine();
for (let i = 0; i < 8; i++) e3.addHabit({ title: `H${i}`, category: 'focus' });
const r3 = generateInsights(e3, true);
ok('burnout-defense insight when overloaded + low velocity', r3.insights!.some((i) => i.type === 'BURNOUT_DEFENSE'));

console.log(`\n🎉 ALL ${passed} HABITFLOW AI-COACH ASSERTIONS PASSED.\n`);
