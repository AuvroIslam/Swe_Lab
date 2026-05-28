import React, { useMemo, useState } from 'react';
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import Feather from 'react-native-vector-icons/Feather';
import { RootStackParamList, ExerciseType, MathDifficulty } from '../types/pose';
import { AppBackground } from '../components/ui/AppBackground';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { WheelPicker } from '../components/ui/WheelPicker';
import { useAlarmStore, Alarm, AlarmRepeat } from '../store/alarmStore';
import { D, R, SH, SP } from '../theme/design';

type Props = NativeStackScreenProps<RootStackParamList, 'AlarmSetup'>;
type RepeatMode = 'once' | 'daily' | 'weekly';

const EXERCISES: { type: ExerciseType; label: string }[] = [
  { type: 'pushup', label: 'Push-ups' },
  { type: 'situp',  label: 'Sit-ups'  },
  { type: 'squat',  label: 'Squats'   },
];

const REP_OPTIONS = [5, 10, 15, 20];
const MATH_OPTIONS = [3, 5, 7, 10];
const DIFFICULTIES: { value: MathDifficulty; label: string }[] = [
  { value: 'easy',   label: 'Easy'   },
  { value: 'medium', label: 'Medium' },
  { value: 'hard',   label: 'Hard'   },
];
const DAY_LABELS = ['S', 'M', 'T', 'W', 'T', 'F', 'S']; // 0=Sun … 6=Sat
const HOUR_ITEMS = Array.from({ length: 12 }, (_, i) => String(i + 1));
const MINUTE_ITEMS = Array.from({ length: 60 }, (_, i) => i.toString().padStart(2, '0'));

function to12h(hour24: number) {
  const h = hour24 % 12;
  return h === 0 ? 12 : h;
}
function pad(n: number) { return n.toString().padStart(2, '0'); }
function wrap(n: number, mod: number) { return ((n % mod) + mod) % mod; }

export function AlarmSetupScreen({ navigation, route }: Props) {
  const editingId = route.params?.alarmId;
  const existing = useAlarmStore((s) => (editingId ? s.getById(editingId) : undefined));
  const upsert = useAlarmStore((s) => s.upsert);
  const remove = useAlarmStore((s) => s.remove);

  const now = useMemo(() => new Date(), []);
  const [hour, setHour] = useState(existing?.hour ?? now.getHours());
  const [minute, setMinute] = useState(existing?.minute ?? now.getMinutes());
  const [label, setLabel] = useState(existing?.label ?? 'Alarm');
  const [exerciseType, setExerciseType] = useState<ExerciseType>(existing?.exerciseType ?? 'pushup');
  const [reps, setReps] = useState(existing?.reps ?? 10);
  const [mathCount, setMathCount] = useState(existing?.mathCount ?? 5);
  const [difficulty, setDifficulty] = useState<MathDifficulty>(existing?.difficulty ?? 'easy');

  const [repeatMode, setRepeatMode] = useState<RepeatMode>(existing?.repeat.kind ?? 'daily');
  const [days, setDays] = useState<number[]>(
    existing?.repeat.kind === 'weekly' ? existing.repeat.days : [],
  );

  const period: 'AM' | 'PM' = hour < 12 ? 'AM' : 'PM';

  const toggleDay = (d: number) =>
    setDays((cur) => (cur.includes(d) ? cur.filter((x) => x !== d) : [...cur, d]));

  const togglePeriod = () => setHour((h) => wrap(h + 12, 24));

  const onHourChange = (idx: number) => {
    const displayHour = idx + 1;        // 1-12
    const base = displayHour % 12;      // 12 -> 0
    setHour(period === 'PM' ? base + 12 : base);
  };

  const save = () => {
    let repeat: AlarmRepeat;
    if (repeatMode === 'daily') repeat = { kind: 'daily' };
    else if (repeatMode === 'weekly') repeat = { kind: 'weekly', days: days.length ? days : [now.getDay()] };
    else repeat = { kind: 'once' };

    const alarm: Alarm = {
      id: existing?.id ?? `a_${Date.now()}`,
      hour,
      minute,
      label: label.trim() || 'Alarm',
      enabled: true,
      repeat,
      exerciseType,
      reps,
      mathCount,
      difficulty,
    };
    upsert(alarm);
    navigation.goBack();
  };

  const del = () => {
    if (editingId) { remove(editingId); navigation.goBack(); }
  };

  return (
    <AppBackground variant={1}>
      <SafeAreaView style={s.safe}>
        <View style={s.topBar}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={s.iconBtn} activeOpacity={0.8}>
            <Feather name="chevron-left" size={22} color={D.text} />
          </TouchableOpacity>
          <Text style={s.title}>{editingId ? 'Edit Alarm' : 'New Alarm'}</Text>
          <View style={s.spacer} />
        </View>

        <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>
          {/* Time picker (12-hour) */}
          <Card padding={SP.xl}>
            <Text style={s.sectionTag}>TIME</Text>
            <View style={s.timeRow}>
              <WheelPicker items={HOUR_ITEMS} selectedIndex={to12h(hour) - 1} onChange={onHourChange} />
              <Text style={s.timeColon}>:</Text>
              <WheelPicker items={MINUTE_ITEMS} selectedIndex={minute} onChange={setMinute} />
              <TouchableOpacity style={s.periodBtn} onPress={togglePeriod} activeOpacity={0.8}>
                <Text style={s.periodText}>{period}</Text>
              </TouchableOpacity>
            </View>
            <Text style={s.timeHint}>Scroll to set · {to12h(hour)}:{pad(minute)} {period}</Text>
          </Card>

          {/* Repeat */}
          <Card padding={SP.xl} style={{ marginTop: SP.lg }}>
            <Text style={s.sectionTag}>REPEAT</Text>
            <View style={s.chipRow}>
              {(['once', 'daily', 'weekly'] as RepeatMode[]).map((m) => (
                <Chip key={m} label={m === 'once' ? 'Once' : m === 'daily' ? 'Daily' : 'Weekly'} active={repeatMode === m} onPress={() => setRepeatMode(m)} />
              ))}
            </View>
            {repeatMode === 'weekly' && (
              <View style={s.dayRow}>
                {DAY_LABELS.map((d, i) => (
                  <TouchableOpacity key={i} onPress={() => toggleDay(i)} activeOpacity={0.8} style={[s.dayChip, days.includes(i) && s.dayChipActive]}>
                    <Text style={[s.dayText, days.includes(i) && s.dayTextActive]}>{d}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </Card>

          {/* Label */}
          <Card padding={SP.xl} style={{ marginTop: SP.lg }}>
            <Text style={s.sectionTag}>LABEL</Text>
            <TextInput
              value={label}
              onChangeText={setLabel}
              placeholder="Morning workout"
              placeholderTextColor={D.textLight}
              style={s.input}
            />
          </Card>

          {/* Exercise dismissal */}
          <Card padding={SP.xl} style={{ marginTop: SP.lg }}>
            <Text style={s.sectionTag}>DISMISS BY EXERCISE</Text>
            <View style={s.chipRow}>
              {EXERCISES.map((e) => (
                <Chip key={e.type} label={e.label} active={exerciseType === e.type} onPress={() => setExerciseType(e.type)} />
              ))}
            </View>
            <Text style={s.subLabel}>Reps required</Text>
            <View style={s.chipRow}>
              {REP_OPTIONS.map((n) => (
                <Chip key={n} label={`${n}`} active={reps === n} onPress={() => setReps(n)} />
              ))}
            </View>
          </Card>

          {/* Math dismissal */}
          <Card padding={SP.xl} style={{ marginTop: SP.lg }}>
            <Text style={s.sectionTag}>OR SOLVE MATH</Text>
            <Text style={s.subLabel}>Difficulty</Text>
            <View style={s.chipRow}>
              {DIFFICULTIES.map((d) => (
                <Chip key={d.value} label={d.label} active={difficulty === d.value} onPress={() => setDifficulty(d.value)} />
              ))}
            </View>
            <Text style={s.subLabel}>Problems required</Text>
            <View style={s.chipRow}>
              {MATH_OPTIONS.map((n) => (
                <Chip key={n} label={`${n}`} active={mathCount === n} onPress={() => setMathCount(n)} />
              ))}
            </View>
          </Card>

          <Button label="Save Alarm" onPress={save} fullWidth style={{ marginTop: SP.xl }} />
          {editingId && (
            <Button label="Delete" onPress={del} variant="danger" fullWidth style={{ marginTop: SP.md }} />
          )}
        </ScrollView>
      </SafeAreaView>
    </AppBackground>
  );
}

function Chip({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) {
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.8} style={[s.chip, active && s.chipActive]}>
      <Text style={[s.chipText, active && s.chipTextActive]}>{label}</Text>
    </TouchableOpacity>
  );
}

const s = StyleSheet.create({
  safe:   { flex: 1, backgroundColor: 'transparent' },
  scroll: { paddingHorizontal: SP.xl, paddingBottom: SP.xxl },

  topBar: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: SP.xl, paddingVertical: SP.md,
  },
  iconBtn: {
    width: 40, height: 40, borderRadius: 20, backgroundColor: D.card,
    alignItems: 'center', justifyContent: 'center', ...SH.soft,
  },
  spacer: { width: 40, height: 40 },
  title:  { fontSize: 18, fontWeight: '800', color: D.text },

  sectionTag: { fontSize: 11, fontWeight: '800', color: D.primary, letterSpacing: 1.6, marginBottom: SP.md },
  subLabel:   { fontSize: 12, fontWeight: '600', color: D.textMuted, marginTop: SP.md, marginBottom: SP.sm },

  timeRow:   { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: SP.xs },
  timeColon: { fontSize: 32, fontWeight: '800', color: D.text },
  timeHint:  { fontSize: 12, color: D.textMuted, textAlign: 'center', marginTop: SP.md, fontWeight: '600' },
  periodBtn: { marginLeft: SP.md, backgroundColor: D.primaryLight, borderRadius: R.md, paddingHorizontal: SP.base, paddingVertical: SP.md },
  periodText:{ fontSize: 16, fontWeight: '900', color: D.primary, letterSpacing: 1 },

  input: {
    backgroundColor: D.cardMuted, borderRadius: R.md,
    paddingHorizontal: SP.base, paddingVertical: SP.md,
    fontSize: 15, fontWeight: '600', color: D.text,
  },

  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: SP.sm },
  chip: {
    paddingHorizontal: SP.base, paddingVertical: SP.sm,
    borderRadius: R.pill, backgroundColor: D.cardMuted,
    borderWidth: 1.5, borderColor: D.border,
  },
  chipActive:    { backgroundColor: D.primary, borderColor: D.primary },
  chipText:      { fontSize: 13, fontWeight: '700', color: D.text },
  chipTextActive:{ color: D.onPrimary },

  dayRow:  { flexDirection: 'row', justifyContent: 'space-between', marginTop: SP.md },
  dayChip: {
    width: 38, height: 38, borderRadius: 19, backgroundColor: D.cardMuted,
    borderWidth: 1.5, borderColor: D.border, alignItems: 'center', justifyContent: 'center',
  },
  dayChipActive: { backgroundColor: D.primary, borderColor: D.primary },
  dayText:       { fontSize: 13, fontWeight: '800', color: D.text },
  dayTextActive: { color: D.onPrimary },
});
