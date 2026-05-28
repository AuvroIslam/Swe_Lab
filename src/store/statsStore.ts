import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { ExerciseType } from '../types/pose';

export const CALORIES_PER_REP = 0.6;

interface StatsState {
  totalReps: number;
  sessions: number;
  byExercise: Record<ExerciseType, number>;
  hydrated: boolean;
  hydrate: () => Promise<void>;
  recordExercise: (type: ExerciseType, reps: number) => void;
}

const STORAGE_KEY = 'fitalarmly.stats.v1';

const EMPTY: Record<ExerciseType, number> = { pushup: 0, situp: 0, squat: 0 };

export const useStatsStore = create<StatsState>((set, get) => ({
  totalReps: 0,
  sessions: 0,
  byExercise: { ...EMPTY },
  hydrated: false,

  hydrate: async () => {
    if (get().hydrated) return;
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      set({
        totalReps: parsed.totalReps ?? 0,
        sessions: parsed.sessions ?? 0,
        byExercise: { ...EMPTY, ...(parsed.byExercise ?? {}) },
        hydrated: true,
      });
    } else {
      set({ hydrated: true });
    }
  },

  recordExercise: (type, reps) => {
    if (reps <= 0) return;
    const { totalReps, sessions, byExercise } = get();
    const next = {
      totalReps: totalReps + reps,
      sessions: sessions + 1,
      byExercise: { ...byExercise, [type]: (byExercise[type] ?? 0) + reps },
    };
    set(next);
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  },
}));

export function caloriesFromReps(reps: number): number {
  return Math.round(reps * CALORIES_PER_REP);
}
