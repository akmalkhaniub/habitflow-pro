import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, Pressable, Platform } from 'react-native';
import * as Haptics from 'expo-haptics';
import { useHabitStore } from '../state/HabitStore';
import { usePurchases } from '../state/PurchasesProvider';
import { theme, categoryColor } from '../theme';
import { FREE_HABIT_LIMIT } from '../lib/products';
import type { HabitCategory } from '../lib/habitEngine';

const CATEGORIES: HabitCategory[] = ['focus', 'health', 'learning', 'mindfulness'];

export function HabitsScreen({ onUpgrade }: { onUpgrade: () => void }) {
  const { habits, dailyPercentage, addHabit, toggleToday, removeHabit } = useHabitStore();
  const { isPro } = usePurchases();
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<HabitCategory>('focus');

  const atFreeLimit = !isPro && habits.length >= FREE_HABIT_LIMIT;

  const onAdd = () => {
    const t = title.trim();
    if (!t) return;
    if (atFreeLimit) {
      onUpgrade();
      return;
    }
    addHabit(t, category);
    setTitle('');
  };

  const onToggle = (id: string) => {
    if (Platform.OS !== 'web') void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    toggleToday(id);
  };

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <Text style={styles.h1}>Today</Text>
      <View style={styles.progressCard}>
        <View style={styles.progressRow}>
          <Text style={styles.progressPct}>{dailyPercentage}%</Text>
          <Text style={styles.progressLabel}>
            {habits.filter((h) => h.completedToday).length}/{habits.length} habits complete
          </Text>
        </View>
        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, { width: `${dailyPercentage}%` }]} />
        </View>
      </View>

      {habits.map((h) => (
        <View key={h.id} style={styles.habitRow}>
          <Pressable
            accessibilityRole="checkbox"
            accessibilityState={{ checked: h.completedToday }}
            onPress={() => onToggle(h.id)}
            style={[styles.check, h.completedToday && styles.checkOn]}
          >
            {h.completedToday ? <Text style={styles.checkMark}>✓</Text> : null}
          </Pressable>
          <View style={styles.habitBody}>
            <Text style={styles.habitTitle}>{h.title}</Text>
            <View style={styles.habitMetaRow}>
              <View style={[styles.dot, { backgroundColor: categoryColor[h.category] }]} />
              <Text style={styles.habitMeta}>{h.category}</Text>
              <Text style={styles.streak}>🔥 {h.currentStreak}d</Text>
              {h.streakRisk >= 0.75 && !h.completedToday ? <Text style={styles.risk}>at risk</Text> : null}
            </View>
          </View>
          <Pressable onPress={() => removeHabit(h.id)} hitSlop={10}>
            <Text style={styles.remove}>✕</Text>
          </Pressable>
        </View>
      ))}

      <View style={styles.addCard}>
        <Text style={styles.addLabel}>New habit</Text>
        <TextInput
          placeholder="e.g. Read 15 pages"
          placeholderTextColor={theme.colors.textMuted}
          value={title}
          onChangeText={setTitle}
          style={styles.input}
          onSubmitEditing={onAdd}
          returnKeyType="done"
        />
        <View style={styles.catRow}>
          {CATEGORIES.map((c) => (
            <Pressable key={c} onPress={() => setCategory(c)} style={[styles.catChip, category === c && { borderColor: categoryColor[c] }]}>
              <View style={[styles.dot, { backgroundColor: categoryColor[c] }]} />
              <Text style={styles.catText}>{c}</Text>
            </Pressable>
          ))}
        </View>
        {atFreeLimit ? (
          <Pressable style={styles.upgradeBtn} onPress={onUpgrade}>
            <Text style={styles.upgradeText}>Free plan is limited to {FREE_HABIT_LIMIT} habits — Upgrade to Pro</Text>
          </Pressable>
        ) : (
          <Pressable style={styles.addBtn} onPress={onAdd}>
            <Text style={styles.addBtnText}>Add habit</Text>
          </Pressable>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: theme.colors.bg },
  content: { padding: theme.spacing(2), paddingBottom: theme.spacing(6) },
  h1: { color: theme.colors.text, fontSize: 32, fontWeight: '800', marginBottom: theme.spacing(2) },
  progressCard: { backgroundColor: theme.colors.surface, borderRadius: theme.radius.lg, padding: theme.spacing(2), marginBottom: theme.spacing(2), borderWidth: 1, borderColor: theme.colors.border },
  progressRow: { flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: theme.spacing(1.5) },
  progressPct: { color: theme.colors.text, fontSize: 28, fontWeight: '800' },
  progressLabel: { color: theme.colors.textMuted, fontSize: 13 },
  progressTrack: { height: 10, borderRadius: 6, backgroundColor: theme.colors.surfaceAlt, overflow: 'hidden' },
  progressFill: { height: 10, borderRadius: 6, backgroundColor: theme.colors.success },
  habitRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: theme.colors.surface, borderRadius: theme.radius.md, padding: theme.spacing(1.5), marginBottom: theme.spacing(1), borderWidth: 1, borderColor: theme.colors.border },
  check: { width: 30, height: 30, borderRadius: 15, borderWidth: 2, borderColor: theme.colors.border, alignItems: 'center', justifyContent: 'center', marginRight: theme.spacing(1.5) },
  checkOn: { backgroundColor: theme.colors.success, borderColor: theme.colors.success },
  checkMark: { color: theme.colors.primaryText, fontWeight: '900' },
  habitBody: { flex: 1 },
  habitTitle: { color: theme.colors.text, fontSize: 16, fontWeight: '600' },
  habitMetaRow: { flexDirection: 'row', alignItems: 'center', marginTop: 4, gap: 8 },
  dot: { width: 8, height: 8, borderRadius: 4 },
  habitMeta: { color: theme.colors.textMuted, fontSize: 12, textTransform: 'capitalize' },
  streak: { color: theme.colors.gold, fontSize: 12, fontWeight: '700' },
  risk: { color: theme.colors.danger, fontSize: 11, fontWeight: '700' },
  remove: { color: theme.colors.textMuted, fontSize: 18, paddingHorizontal: 6 },
  addCard: { backgroundColor: theme.colors.surface, borderRadius: theme.radius.lg, padding: theme.spacing(2), marginTop: theme.spacing(1), borderWidth: 1, borderColor: theme.colors.border },
  addLabel: { color: theme.colors.textMuted, fontSize: 12, textTransform: 'uppercase', letterSpacing: 1, marginBottom: theme.spacing(1) },
  input: { backgroundColor: theme.colors.surfaceAlt, borderRadius: theme.radius.md, color: theme.colors.text, paddingHorizontal: theme.spacing(1.5), paddingVertical: theme.spacing(1.25), fontSize: 15 },
  catRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: theme.spacing(1.5) },
  catChip: { flexDirection: 'row', alignItems: 'center', gap: 6, borderWidth: 1, borderColor: theme.colors.border, borderRadius: 999, paddingHorizontal: 12, paddingVertical: 6 },
  catText: { color: theme.colors.text, fontSize: 13, textTransform: 'capitalize' },
  addBtn: { backgroundColor: theme.colors.primary, borderRadius: theme.radius.md, paddingVertical: theme.spacing(1.5), alignItems: 'center', marginTop: theme.spacing(2) },
  addBtnText: { color: theme.colors.primaryText, fontWeight: '800', fontSize: 15 },
  upgradeBtn: { backgroundColor: theme.colors.gold, borderRadius: theme.radius.md, paddingVertical: theme.spacing(1.5), alignItems: 'center', marginTop: theme.spacing(2) },
  upgradeText: { color: theme.colors.primaryText, fontWeight: '800', fontSize: 13, textAlign: 'center' }
});
