import assert from 'assert';
import { atRiskHabits, shouldRemind, nextReminderDate, reminderBody } from '../src/services/notifications';
import type { HabitSummary } from '../src/lib/habitEngine';

console.log('🧪 HabitFlow Pro — streak reminder logic\n');
let passed = 0;
const ok = (label: string, cond: boolean) => {
  assert(cond, label);
  passed++;
  console.log(`   ✅ ${label}`);
};

function habit(over: Partial<HabitSummary>): HabitSummary {
  return {
    id: over.id ?? 'h',
    title: over.title ?? 'Habit',
    category: over.category ?? 'focus',
    targetDaysPerWeek: 7,
    completions: [],
    createdAt: new Date().toISOString(),
    completedToday: over.completedToday ?? false,
    currentStreak: over.currentStreak ?? 0,
    streakRisk: over.streakRisk ?? 0,
  };
}

// 1. At-risk selection
console.log('1️⃣ At-risk selection...');
const habits: HabitSummary[] = [
  habit({ id: 'a', title: 'Deep work', currentStreak: 5, streakRisk: 0.75, completedToday: false }), // at risk
  habit({ id: 'b', title: 'Cardio', currentStreak: 3, streakRisk: 0.75, completedToday: true }),      // done today
  habit({ id: 'c', title: 'Read', currentStreak: 0, streakRisk: 0.9, completedToday: false }),        // no streak
  habit({ id: 'd', title: 'Meditate', currentStreak: 4, streakRisk: 0.15, completedToday: false }),   // low risk
];
const at = atRiskHabits(habits);
ok('only unfinished, active-streak, elevated-risk habits count', at.length === 1 && at[0].id === 'a');
ok('shouldRemind true when something is at risk', shouldRemind(habits) === true);
ok('shouldRemind false when nothing at risk', shouldRemind([habits[1], habits[2], habits[3]]) === false);

// 2. Reminder time scheduling
console.log('\n2️⃣ Reminder time...');
const morning = new Date('2026-09-19T09:00:00');
const evening = new Date('2026-09-19T21:30:00');
ok('before 8pm → today 20:00', nextReminderDate(morning, 20).getDate() === 19 && nextReminderDate(morning, 20).getHours() === 20);
ok('after 8pm → tomorrow 20:00', nextReminderDate(evening, 20).getDate() === 20 && nextReminderDate(evening, 20).getHours() === 20);
ok('minutes/seconds zeroed', nextReminderDate(morning, 20).getMinutes() === 0 && nextReminderDate(morning, 20).getSeconds() === 0);

// 3. Body copy
console.log('\n3️⃣ Reminder copy...');
ok('single-habit body names the streak', reminderBody(habits).includes('5-day') && reminderBody(habits).includes('Deep work'));
ok('all-safe body is reassuring', reminderBody([habits[1]]).includes('safe'));
const two = [habit({ id: 'x', currentStreak: 2, streakRisk: 0.8 }), habit({ id: 'y', currentStreak: 3, streakRisk: 0.8 })];
ok('multi-habit body counts them', reminderBody(two).includes('2 streaks'));

console.log(`\n🎉 ALL ${passed} HABITFLOW NOTIFICATION ASSERTIONS PASSED.\n`);
