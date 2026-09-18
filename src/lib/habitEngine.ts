/**
 * HabitEngine - offline-first core logic for HabitFlow Pro.
 * Pure, dependency-free logic ported from the original web prototype so it can be
 * unit-tested in Node and reused inside the React Native app.
 */

export type HabitCategory = 'focus' | 'health' | 'learning' | 'mindfulness' | 'general';

export interface Habit {
  id: string;
  title: string;
  category: HabitCategory;
  targetDaysPerWeek: number;
  completions: string[]; // YYYY-MM-DD date strings
  createdAt: string;
}

export interface HabitSummary extends Habit {
  completedToday: boolean;
  currentStreak: number;
  streakRisk: number;
}

export interface AddHabitInput {
  id?: string;
  title: string;
  category?: HabitCategory;
  targetDaysPerWeek?: number;
}

function formatDate(d: Date): string {
  return d.toISOString().split('T')[0];
}

export class HabitEngine {
  private habits = new Map<string, Habit>();

  constructor(initial: Habit[] = []) {
    for (const h of initial) this.habits.set(h.id, { ...h, completions: [...h.completions] });
  }

  get size(): number {
    return this.habits.size;
  }

  addHabit({ id, title, category = 'focus', targetDaysPerWeek = 7 }: AddHabitInput): Habit {
    const habitId = id || 'habit_' + Date.now() + '_' + Math.random().toString(36).slice(2, 6);
    const habit: Habit = { id: habitId, title, category, targetDaysPerWeek, completions: [], createdAt: new Date().toISOString() };
    this.habits.set(habitId, habit);
    return habit;
  }

  removeHabit(habitId: string): boolean {
    return this.habits.delete(habitId);
  }

  has(habitId: string): boolean {
    return this.habits.has(habitId);
  }

  /** Toggle today's completion; returns the new completed state. */
  toggleToday(habitId: string, dateStr = formatDate(new Date())): boolean {
    const habit = this.habits.get(habitId);
    if (!habit) throw new Error(`Habit not found: ${habitId}`);
    const idx = habit.completions.indexOf(dateStr);
    if (idx >= 0) {
      habit.completions.splice(idx, 1);
      return false;
    }
    habit.completions.push(dateStr);
    return true;
  }

  recordCompletion(habitId: string, dateStr = formatDate(new Date())): void {
    const habit = this.habits.get(habitId);
    if (!habit) throw new Error(`Habit not found: ${habitId}`);
    if (!habit.completions.includes(dateStr)) habit.completions.push(dateStr);
  }

  calculateStreak(habitId: string): number {
    const habit = this.habits.get(habitId);
    if (!habit) return 0;
    const done = new Set(habit.completions);
    let streak = 0;
    const checkDate = new Date();
    if (!done.has(formatDate(checkDate))) checkDate.setDate(checkDate.getDate() - 1);
    while (done.has(formatDate(checkDate))) {
      streak++;
      checkDate.setDate(checkDate.getDate() - 1);
    }
    return streak;
  }

  /** Streak-break risk (0 safe .. 1 critical), escalating through the day. */
  getStreakRiskScore(habitId: string, currentHour = new Date().getHours()): number {
    const habit = this.habits.get(habitId);
    if (!habit) return 0;
    if (this.calculateStreak(habitId) === 0) return 0;
    if (habit.completions.includes(formatDate(new Date()))) return 0;
    if (currentHour >= 21) return 0.95;
    if (currentHour >= 18) return 0.75;
    if (currentHour >= 14) return 0.4;
    return 0.15;
  }

  getDailySummary(dateStr = formatDate(new Date())): { total: number; completed: number; percentage: number } {
    const total = this.habits.size;
    if (total === 0) return { total: 0, completed: 0, percentage: 0 };
    let completed = 0;
    for (const habit of this.habits.values()) if (habit.completions.includes(dateStr)) completed++;
    return { total, completed, percentage: Math.round((completed / total) * 100) };
  }

  getAllHabits(): HabitSummary[] {
    const todayStr = formatDate(new Date());
    return Array.from(this.habits.values()).map((habit) => ({
      ...habit,
      completions: [...habit.completions],
      completedToday: habit.completions.includes(todayStr),
      currentStreak: this.calculateStreak(habit.id),
      streakRisk: this.getStreakRiskScore(habit.id)
    }));
  }

  /** Serializable snapshot for persistence. */
  toJSON(): Habit[] {
    return Array.from(this.habits.values()).map((h) => ({ ...h, completions: [...h.completions] }));
  }
}
