/**
 * Adaptive AI Coach for HabitFlow Pro
 * Generates personalized daily routines, burnout prevention warnings, and habit stacking prompts.
 */

export class AdaptiveAICoach {
  constructor(revenueCatManager) {
    this.rcManager = revenueCatManager;
  }

  /**
   * Generate intelligent coaching insights for the user
   * Requires active 'pro_access' entitlement
   */
  generateInsights(habitEngine) {
    if (!this.rcManager.canAccessAICoach()) {
      return {
        locked: true,
        paywallTrigger: true,
        message: 'Upgrade to HabitFlow Pro to unlock personalized AI Routine Coaching, habit stacking, and burnout prevention.'
      };
    }

    const habits = Array.from(habitEngine.habits.values());
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

    const insights = [];
    const dailySummary = habitEngine.getDailySummary();

    // 1. Streak Risk / Urgency Check
    for (const habit of habits) {
      const risk = habitEngine.getStreakRiskScore(habit.id);
      const streak = habitEngine.calculateStreak(habit.id);
      if (risk > 0.7 && streak > 2) {
        insights.push({
          type: 'STREAK_PRESERVATION',
          severity: 'HIGH',
          title: `Protect your ${streak}-day streak in "${habit.title}"!`,
          advice: `You have not logged "${habit.title}" today. Complete it before midnight to maintain your flow state momentum.`
        });
      }
    }

    // 2. Habit Stacking Recommendation
    if (habits.length >= 2) {
      const sorted = [...habits].sort((a, b) => habitEngine.calculateStreak(b.id) - habitEngine.calculateStreak(a.id));
      const strongest = sorted[0];
      const emerging = sorted[sorted.length - 1];

      if (strongest.id !== emerging.id) {
        insights.push({
          type: 'HABIT_STACKING',
          severity: 'TIP',
          title: 'Stack Your Routines',
          advice: `Anchor "${emerging.title}" directly after completing your established anchor habit "${strongest.title}" to increase automaticity.`
        });
      }
    }

    // 3. Burnout / Capacity Check
    if (habits.length > 7 && dailySummary.percentage < 40) {
      insights.push({
        type: 'BURNOUT_DEFENSE',
        severity: 'MEDIUM',
        title: 'Cognitive Load Warning',
        advice: 'You have 8+ active habits with low daily velocity. Consider scaling back to 3 non-negotiable core habits to restore confidence.'
      });
    }

    return {
      locked: false,
      dailyCompletionRate: dailySummary.percentage,
      insights
    };
  }
}
