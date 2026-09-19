/**
 * Streak-risk reminders.
 *
 * The scheduling *decision* is pure and unit-tested; the actual OS notification is
 * scheduled via expo-notifications behind a dynamic import so this module stays
 * importable (and testable) without the native module.
 */
import type { HabitSummary } from '../lib/habitEngine';

/** Habits with an active streak that are unfinished today and at elevated risk. */
export function atRiskHabits(habits: HabitSummary[]): HabitSummary[] {
  return habits.filter((h) => !h.completedToday && h.currentStreak > 0 && h.streakRisk >= 0.4);
}

export function shouldRemind(habits: HabitSummary[]): boolean {
  return atRiskHabits(habits).length > 0;
}

/**
 * Next reminder time: this evening at `hour` if we're still before it, otherwise
 * tomorrow evening. Keeps reminders out of the middle of the night.
 */
export function nextReminderDate(now: Date = new Date(), hour = 20): Date {
  const d = new Date(now);
  d.setSeconds(0, 0);
  d.setMinutes(0);
  if (now.getHours() >= hour) d.setDate(d.getDate() + 1);
  d.setHours(hour);
  return d;
}

export function reminderBody(habits: HabitSummary[]): string {
  const at = atRiskHabits(habits);
  if (at.length === 0) return 'Nice work — all your streaks are safe today.';
  if (at.length === 1) return `Keep your ${at[0].currentStreak}-day streak alive: "${at[0].title}" isn't done yet.`;
  return `${at.length} streaks are at risk tonight. Tap to finish them before midnight.`;
}

/**
 * Schedule (or refresh) the evening streak reminder. No-op when nothing is at risk,
 * or when expo-notifications / permission is unavailable. Returns the scheduled id
 * or null.
 */
export async function scheduleStreakReminder(habits: HabitSummary[], now: Date = new Date()): Promise<string | null> {
  if (!shouldRemind(habits)) return null;
  try {
    const Notifications = await import('expo-notifications');
    const perm = await Notifications.getPermissionsAsync();
    if (perm.status !== 'granted') {
      const req = await Notifications.requestPermissionsAsync();
      if (req.status !== 'granted') return null;
    }
    await Notifications.cancelAllScheduledNotificationsAsync();
    return await Notifications.scheduleNotificationAsync({
      content: { title: 'HabitFlow — protect your streak 🔥', body: reminderBody(habits) },
      trigger: { date: nextReminderDate(now) } as any,
    });
  } catch {
    return null; // expo-notifications not installed / not permitted — safe no-op
  }
}
