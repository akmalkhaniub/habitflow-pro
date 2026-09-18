/**
 * HabitEngine - Offline-First Core Logic for HabitFlow Pro
 * Handles streak mechanics, habit completion recording, and risk metrics.
 */

export class HabitEngine {
  constructor() {
    this.habits = new Map();
  }

  /**
   * Create and register a new habit
   */
  addHabit({ id, title, category = 'focus', targetDaysPerWeek = 7 }) {
    const habitId = id || 'habit_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4);
    const habit = {
      id: habitId,
      title,
      category, // 'focus' | 'health' | 'learning' | 'mindfulness'
      targetDaysPerWeek,
      completions: new Set(), // Set of YYYY-MM-DD date strings
      createdAt: new Date().toISOString()
    };
    this.habits.set(habitId, habit);
    return habit;
  }

  /**
   * Record completion for a habit on a specific date
   */
  recordCompletion(habitId, dateStr = this.getTodayDateStr()) {
    const habit = this.habits.get(habitId);
    if (!habit) throw new Error(`Habit not found: ${habitId}`);

    habit.completions.add(dateStr);
    return {
      habitId,
      completedDate: dateStr,
      currentStreak: this.calculateStreak(habitId)
    };
  }

  /**
   * Toggle completion state
   */
  toggleCompletion(habitId, dateStr = this.getTodayDateStr()) {
    const habit = this.habits.get(habitId);
    if (!habit) throw new Error(`Habit not found: ${habitId}`);

    if (habit.completions.has(dateStr)) {
      habit.completions.delete(dateStr);
      return false;
    } else {
      habit.completions.add(dateStr);
      return true;
    }
  }

  /**
   * Calculate continuous daily streak
   */
  calculateStreak(habitId) {
    const habit = this.habits.get(habitId);
    if (!habit) return 0;

    let streak = 0;
    let checkDate = new Date();

    // If today is not completed yet, check starting from yesterday
    const todayStr = this.formatDate(checkDate);
    if (!habit.completions.has(todayStr)) {
      checkDate.setDate(checkDate.getDate() - 1);
    }

    while (true) {
      const dateStr = this.formatDate(checkDate);
      if (habit.completions.has(dateStr)) {
        streak++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
        break;
      }
    }

    return streak;
  }

  /**
   * Calculate streak risk score (0.0 = safe, 1.0 = critical risk of breaking streak)
   */
  getStreakRiskScore(habitId, currentHour = new Date().getHours()) {
    const habit = this.habits.get(habitId);
    if (!habit) return 0;

    const streak = this.calculateStreak(habitId);
    if (streak === 0) return 0; // No active streak to break

    const todayStr = this.getTodayDateStr();
    const isDoneToday = habit.completions.has(todayStr);
    if (isDoneToday) return 0.0; // Already secured today

    // As evening approaches (e.g. past 18:00), risk escalates significantly
    if (currentHour >= 21) return 0.95;
    if (currentHour >= 18) return 0.75;
    if (currentHour >= 14) return 0.40;
    return 0.15;
  }

  /**
   * Get aggregate daily summary
   */
  getDailySummary(dateStr = this.getTodayDateStr()) {
    const totalHabits = this.habits.size;
    if (totalHabits === 0) {
      return { total: 0, completed: 0, percentage: 0 };
    }

    let completed = 0;
    for (const habit of this.habits.values()) {
      if (habit.completions.has(dateStr)) {
        completed++;
      }
    }

    return {
      total: totalHabits,
      completed,
      percentage: Math.round((completed / totalHabits) * 100)
    };
  }

  /**
   * Return all habits as JSON-safe summary objects (Sets are expanded to arrays)
   * enriched with derived streak / risk / completed-today fields for the UI.
   */
  getAllHabits() {
    const todayStr = this.getTodayDateStr();
    return Array.from(this.habits.values()).map((habit) => ({
      id: habit.id,
      title: habit.title,
      category: habit.category,
      targetDaysPerWeek: habit.targetDaysPerWeek,
      createdAt: habit.createdAt,
      completions: Array.from(habit.completions),
      completedToday: habit.completions.has(todayStr),
      currentStreak: this.calculateStreak(habit.id),
      streakRisk: this.getStreakRiskScore(habit.id)
    }));
  }

  getTodayDateStr() {
    return this.formatDate(new Date());
  }

  formatDate(d) {
    return d.toISOString().split('T')[0];
  }
}
