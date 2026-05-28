import { NativeModules } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { ExerciseType, MathDifficulty } from '../types/pose';

const AlarmScheduler = NativeModules.AlarmScheduler as {
  scheduleAlarm: (id: string, triggerAtMillis: number, label: string, repeat: string) => void;
  cancelAlarm: (id: string) => void;
  stopRinging: () => void;
  getInitialAlarm: () => Promise<string | null>;
};

/** 'once' | 'daily' | specific weekdays (0=Sun … 6=Sat). */
export type AlarmRepeat =
  | { kind: 'once' }
  | { kind: 'daily' }
  | { kind: 'weekly'; days: number[] };

export interface Alarm {
  id: string;
  hour: number;          // 0-23 (24h stored internally; UI shows 12h)
  minute: number;        // 0-59
  label: string;
  enabled: boolean;
  repeat: AlarmRepeat;
  exerciseType: ExerciseType;
  reps: number;          // reps required to dismiss via exercise
  mathCount: number;     // problems required to dismiss via math
  difficulty: MathDifficulty;
}

interface AlarmStore {
  alarms: Alarm[];
  hydrated: boolean;
  hydrate: () => Promise<void>;
  upsert: (alarm: Alarm) => void;
  remove: (id: string) => void;
  toggle: (id: string) => void;
  disableOnce: (id: string) => void;
  getById: (id: string) => Alarm | undefined;
}

const STORAGE_KEY = 'fitalarmly.alarms.v2';

export function repeatToken(repeat: AlarmRepeat): string {
  if (repeat.kind === 'daily') return 'daily';
  if (repeat.kind === 'weekly' && repeat.days.length > 0) return `days:${[...repeat.days].sort().join(',')}`;
  return 'once';
}

/** Next occurrence of hour:minute that satisfies the repeat rule. */
export function nextOccurrenceMillis(hour: number, minute: number, repeat: AlarmRepeat): number {
  const now = new Date();
  const candidate = new Date(now);
  candidate.setHours(hour, minute, 0, 0);

  const days = repeat.kind === 'weekly' ? repeat.days : [];
  if (days.length === 0) {
    // once / daily — today if still future, else tomorrow
    if (candidate.getTime() <= now.getTime()) candidate.setDate(candidate.getDate() + 1);
    return candidate.getTime();
  }

  // weekly — scan up to 7 days for the next matching weekday
  for (let i = 0; i < 8; i++) {
    const d = new Date(candidate);
    d.setDate(candidate.getDate() + i);
    if (days.includes(d.getDay()) && d.getTime() > now.getTime()) return d.getTime();
  }
  return candidate.getTime();
}

async function persist(alarms: Alarm[]) {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(alarms));
}

function syncNative(alarm: Alarm) {
  if (alarm.enabled) {
    AlarmScheduler.scheduleAlarm(
      alarm.id,
      nextOccurrenceMillis(alarm.hour, alarm.minute, alarm.repeat),
      alarm.label,
      repeatToken(alarm.repeat),
    );
  } else {
    AlarmScheduler.cancelAlarm(alarm.id);
  }
}

export const useAlarmStore = create<AlarmStore>((set, get) => ({
  alarms: [],
  hydrated: false,

  hydrate: async () => {
    if (get().hydrated) return;
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    const alarms: Alarm[] = raw ? JSON.parse(raw) : [];
    set({ alarms, hydrated: true });
    alarms.forEach(syncNative);
  },

  upsert: (alarm) => {
    const list = get().alarms;
    const next = list.some((a) => a.id === alarm.id)
      ? list.map((a) => (a.id === alarm.id ? alarm : a))
      : [...list, alarm];
    set({ alarms: next });
    persist(next);
    syncNative(alarm);
  },

  remove: (id) => {
    AlarmScheduler.cancelAlarm(id);
    const next = get().alarms.filter((a) => a.id !== id);
    set({ alarms: next });
    persist(next);
  },

  toggle: (id) => {
    const list = get().alarms;
    const next = list.map((a) => (a.id === id ? { ...a, enabled: !a.enabled } : a));
    set({ alarms: next });
    persist(next);
    const toggled = next.find((a) => a.id === id);
    if (toggled) syncNative(toggled);
  },

  // A fired 'once' alarm won't re-arm natively; reflect that in the UI.
  disableOnce: (id) => {
    const list = get().alarms;
    const target = list.find((a) => a.id === id);
    if (!target || target.repeat.kind !== 'once') return;
    const next = list.map((a) => (a.id === id ? { ...a, enabled: false } : a));
    set({ alarms: next });
    persist(next);
  },

  getById: (id) => get().alarms.find((a) => a.id === id),
}));

export function stopRinging() {
  AlarmScheduler.stopRinging();
}

export function getInitialAlarm(): Promise<string | null> {
  return AlarmScheduler.getInitialAlarm();
}
