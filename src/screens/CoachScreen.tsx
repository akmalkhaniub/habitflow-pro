import React, { useEffect, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { useHabitStore } from '../state/HabitStore';
import { usePurchases } from '../state/PurchasesProvider';
import { generateInsights } from '../lib/aiCoach';
import { analytics } from '../services/analytics';
import { theme } from '../theme';

const severityColor: Record<string, string> = {
  HIGH: theme.colors.danger,
  MEDIUM: theme.colors.warning,
  TIP: theme.colors.primary
};

export function CoachScreen({ onUpgrade }: { onUpgrade: () => void }) {
  const { engine, habits } = useHabitStore();
  const { isPro } = usePurchases();

  // Recompute when habits change (habits in deps).
  const result = useMemo(() => generateInsights(engine, isPro), [engine, isPro, habits]);

  useEffect(() => {
    analytics.track({ name: 'coach_viewed', locked: result.locked });
  }, [result.locked]);

  if (result.locked) {
    return (
      <View style={styles.lockWrap}>
        <Text style={styles.lockEmoji}>🔒</Text>
        <Text style={styles.h1}>AI Coach is a Pro feature</Text>
        <Text style={styles.lockText}>{result.message}</Text>
        <Pressable style={styles.cta} onPress={onUpgrade}>
          <Text style={styles.ctaText}>Unlock with Pro</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <Text style={styles.h1}>AI Coach</Text>
      {typeof result.dailyCompletionRate === 'number' ? (
        <Text style={styles.sub}>Today's completion rate: {result.dailyCompletionRate}%</Text>
      ) : null}
      {(result.insights ?? []).map((ins, i) => (
        <View key={i} style={styles.card}>
          <View style={[styles.badge, { backgroundColor: severityColor[ins.severity ?? 'TIP'] }]}>
            <Text style={styles.badgeText}>{ins.severity ?? 'TIP'}</Text>
          </View>
          <Text style={styles.cardTitle}>{ins.title}</Text>
          <Text style={styles.cardBody}>{ins.advice}</Text>
        </View>
      ))}
      {(result.insights ?? []).length === 0 ? <Text style={styles.sub}>You're on track — no urgent nudges right now. 🎯</Text> : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: theme.colors.bg },
  content: { padding: theme.spacing(2), paddingBottom: theme.spacing(6) },
  h1: { color: theme.colors.text, fontSize: 32, fontWeight: '800', marginBottom: theme.spacing(1) },
  sub: { color: theme.colors.textMuted, fontSize: 14, marginBottom: theme.spacing(2) },
  card: { backgroundColor: theme.colors.surface, borderRadius: theme.radius.lg, padding: theme.spacing(2), marginBottom: theme.spacing(1.5), borderWidth: 1, borderColor: theme.colors.border },
  badge: { alignSelf: 'flex-start', borderRadius: 999, paddingHorizontal: 10, paddingVertical: 3, marginBottom: theme.spacing(1) },
  badgeText: { color: theme.colors.primaryText, fontSize: 11, fontWeight: '800' },
  cardTitle: { color: theme.colors.text, fontSize: 17, fontWeight: '700', marginBottom: 6 },
  cardBody: { color: theme.colors.textMuted, fontSize: 14, lineHeight: 20 },
  lockWrap: { flex: 1, backgroundColor: theme.colors.bg, alignItems: 'center', justifyContent: 'center', padding: theme.spacing(3) },
  lockEmoji: { fontSize: 48, marginBottom: theme.spacing(2) },
  lockText: { color: theme.colors.textMuted, fontSize: 15, textAlign: 'center', lineHeight: 22, marginBottom: theme.spacing(3) },
  cta: { backgroundColor: theme.colors.primary, borderRadius: theme.radius.md, paddingHorizontal: theme.spacing(4), paddingVertical: theme.spacing(1.5) },
  ctaText: { color: theme.colors.primaryText, fontWeight: '800', fontSize: 15 }
});
