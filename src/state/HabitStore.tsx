import React, { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { HabitEngine, type HabitSummary, type HabitCategory, type Habit } from '../lib/habitEngine';
import { loadHabits, saveHabits } from '../services/storage';

interface HabitStoreValue {
  habits: HabitSummary[];
  dailyPercentage: number;
  loaded: boolean;
  engine: HabitEngine;
  addHabit: (title: string, category: HabitCategory) => void;
  removeHabit: (id: string) => void;
  toggleToday: (id: string) => void;
  refresh: () => void;
}

const HabitStoreContext = createContext<HabitStoreValue | null>(null);

const SEED: Habit[] = [
  { id: 'seed_focus', title: 'Morning Deep Focus Block (90m)', category: 'focus', targetDaysPerWeek: 7, completions: [], createdAt: new Date().toISOString() },
  { id: 'seed_health', title: 'Daily Zone 2 Cardio & Mobility', category: 'health', targetDaysPerWeek: 5, completions: [], createdAt: new Date().toISOString() }
];

export function HabitStoreProvider({ children }: { children: React.ReactNode }) {
  const engineRef = useRef(new HabitEngine());
  const [habits, setHabits] = useState<HabitSummary[]>([]);
  const [dailyPercentage, setDailyPercentage] = useState(0);
  const [loaded, setLoaded] = useState(false);

  const sync = () => {
    const engine = engineRef.current;
    setHabits(engine.getAllHabits());
    setDailyPercentage(engine.getDailySummary().percentage);
    void saveHabits(engine.toJSON());
  };

  useEffect(() => {
    (async () => {
      const stored = await loadHabits();
      engineRef.current = new HabitEngine(stored ?? SEED);
      setHabits(engineRef.current.getAllHabits());
      setDailyPercentage(engineRef.current.getDailySummary().percentage);
      setLoaded(true);
    })();
  }, []);

  const value = useMemo<HabitStoreValue>(
    () => ({
      habits,
      dailyPercentage,
      loaded,
      engine: engineRef.current,
      addHabit: (title, category) => {
        engineRef.current.addHabit({ title, category });
        sync();
      },
      removeHabit: (id) => {
        engineRef.current.removeHabit(id);
        sync();
      },
      toggleToday: (id) => {
        engineRef.current.toggleToday(id);
        sync();
      },
      refresh: sync
    }),
    [habits, dailyPercentage, loaded]
  );

  return <HabitStoreContext.Provider value={value}>{children}</HabitStoreContext.Provider>;
}

export function useHabitStore(): HabitStoreValue {
  const ctx = useContext(HabitStoreContext);
  if (!ctx) throw new Error('useHabitStore must be used within a HabitStoreProvider');
  return ctx;
}
