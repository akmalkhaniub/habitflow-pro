/**
 * Offline-first persistence for habits via AsyncStorage.
 */
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Habit } from '../lib/habitEngine';

const HABITS_KEY = 'habitflow.habits.v1';

export async function loadHabits(): Promise<Habit[] | null> {
  try {
    const raw = await AsyncStorage.getItem(HABITS_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as Habit[]) : null;
  } catch {
    return null;
  }
}

export async function saveHabits(habits: Habit[]): Promise<void> {
  try {
    await AsyncStorage.setItem(HABITS_KEY, JSON.stringify(habits));
  } catch {
    /* best-effort; non-fatal */
  }
}
