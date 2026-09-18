/**
 * Adaptive AI Coach — deterministic, rule-based coaching insights.
 * Ported from the web prototype; pure logic, gated behind the Pro entitlement by callers.
 */
import type { HabitEngine } from './habitEngine.js';

export type InsightSeverity = 'HIGH' | 'MEDIUM' | 'TIP';

export interface CoachInsight {
  type: 'STREAK_PRESERVATION' | 'HABIT_STACKING' | 'BURNOUT_DEFENSE' | 'ONBOARDING';
  severity?: InsightSeverity;
  title: string;
  advice: string;
}

export interface CoachResult {
  locked: boolean;
  paywallTrigger?: boolean;
  message?: string;
  dailyCompletionRate?: number;
  insights?: CoachInsight[];
}

/** Generate coaching insights. `isPro` gates the feature behind the entitlement. */
export function generateInsights(engine: HabitEngine, isPro: boolean): CoachResult {
  if (!isPro) {
    return {
      locked: true,
      paywallTrigger: true,
      message: 'Upgrade to HabitFlow Pro to unlock personalized AI Routine Coaching, habit stacking, and burnout prevention.'
    };
  }

  const habits = engine.getAllHabits();
  if (habits.length === 0) {
    return {
      locked: false,
      insights: [
        {
          type: 'ONBOARDING',
          title: 'Start with Keystone Habits',
          advice: 'Begin with 1–2 high-leverage habits (e.g. 10 minutes of hydration or morning sunlight) to establish initial momentum.'
        }
      ]
    };
  }

  const insights: CoachInsight[] = [];
  const daily = engine.getDailySummary();

  // 1. Streak risk / urgency
  for (const habit of habits) {
    if (habit.streakRisk > 0.7 && habit.currentStreak > 2) {
      insights.push({
        type: 'STREAK_PRESERVATION',
        severity: 'HIGH',
        title: `Protect your ${habit.currentStreak}-day streak in "${habit.title}"!`,
        advice: `You have not logged "${habit.title}" today. Complete it before midnight to maintain your flow-state momentum.`
      });
    }
  }

  // 2. Habit stacking
  if (habits.length >= 2) {
    const sorted = [...habits].sort((a, b) => b.currentStreak - a.currentStreak);
    const strongest = sorted[0];
    const emerging = sorted[sorted.length - 1];
    if (strongest.id !== emerging.id) {
      insights.push({
        type: 'HABIT_STACKING',
        severity: 'TIP',
        title: 'Stack Your Routines',
        advice: `Anchor "${emerging.title}" directly after your established habit "${strongest.title}" to increase automaticity.`
      });
    }
  }

  // 3. Burnout / capacity
  if (habits.length > 7 && daily.percentage < 40) {
    insights.push({
      type: 'BURNOUT_DEFENSE',
      severity: 'MEDIUM',
      title: 'Cognitive Load Warning',
      advice: 'You have 8+ active habits with low daily velocity. Consider scaling back to 3 non-negotiable core habits to restore confidence.'
    });
  }

  return { locked: false, dailyCompletionRate: daily.percentage, insights };
}
