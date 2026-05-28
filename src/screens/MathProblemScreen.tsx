import React, { useMemo, useRef, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import Feather from 'react-native-vector-icons/Feather';
import { RootStackParamList } from '../types/pose';
import { AppBackground } from '../components/ui/AppBackground';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { SuccessOverlay } from '../components/SuccessOverlay';
import { useAlarmStore, stopRinging } from '../store/alarmStore';
import { generateProblems } from '../utils/mathGenerator';
import { D, R, SH, SP } from '../theme/design';

type Props = NativeStackScreenProps<RootStackParamList, 'MathProblem'>;

export function MathProblemScreen({ navigation, route }: Props) {
  const { alarmId, problemCount, difficulty } = route.params;
  const alarm = useAlarmStore((s) => s.getById(alarmId));

  const problems = useMemo(() => generateProblems(difficulty, problemCount), [difficulty, problemCount]);
  const [index, setIndex] = useState(0);
  const [input, setInput] = useState('');
  const [wrong, setWrong] = useState(false);
  const [success, setSuccess] = useState(false);
  const completed = useRef(false);
  const current = problems[index];

  const submit = () => {
    if (input.trim().length === 0) return;
    const value = parseInt(input.trim(), 10);
    if (value !== current.answer) {
      setWrong(true);
      setInput('');
      return;
    }
    setWrong(false);
    setInput('');
    if (index + 1 >= problems.length) {
      if (!completed.current) {
        completed.current = true;
        stopRinging();
        setSuccess(true);
        setTimeout(() => navigation.replace('Home'), 1600);
      }
    } else {
      setIndex(index + 1);
    }
  };

  const switchToExercise = () => {
    if (!alarm) return;
    navigation.replace('DismissExercise', { alarmId, exerciseType: alarm.exerciseType, reps: alarm.reps });
  };

  const progressPct = `${(index / problems.length) * 100}%`;

  return (
    <AppBackground variant={1}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView
          contentContainerStyle={s.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}>

          <View style={s.topBar}>
            <View style={s.alarmPill}>
              <Feather name="bell" size={14} color={D.onPrimary} />
              <Text style={s.alarmPillText}>ALARM · {index + 1} / {problems.length}</Text>
            </View>
          </View>

          <View style={s.progressTrack}>
            <View style={[s.progressFill, { width: progressPct as any }]} />
          </View>

          <Card padding={SP.xl} style={s.problemCard}>
            <Text style={s.eq}>{current.text}</Text>
            <TextInput
              value={input}
              onChangeText={(t) => { setInput(t.replace(/[^0-9]/g, '')); setWrong(false); }}
              keyboardType="number-pad"
              placeholder="?"
              placeholderTextColor={D.textLight}
              style={[s.input, wrong && s.inputWrong]}
              onSubmitEditing={submit}
              autoFocus
              returnKeyType="done"
              maxLength={6}
            />
            {wrong && <Text style={s.wrongText}>Not quite — try again</Text>}
          </Card>

          <Button label="Submit" onPress={submit} fullWidth style={{ marginTop: SP.xl }} />

          <TouchableOpacity onPress={switchToExercise} activeOpacity={0.8} style={s.switchRow}>
            <Feather name="activity" size={16} color={D.primary} />
            <Text style={s.switchText}>Or do exercise instead</Text>
          </TouchableOpacity>

        </ScrollView>
      </KeyboardAvoidingView>

      <SuccessOverlay visible={success} title="Solved!" subtitle="Alarm dismissed" />
    </AppBackground>
  );
}

const s = StyleSheet.create({
  scroll: { flexGrow: 1, paddingHorizontal: SP.xl, paddingTop: SP.xl, paddingBottom: SP.xxl },

  topBar: { alignItems: 'center', marginBottom: SP.md },
  alarmPill: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: D.primary, borderRadius: R.pill,
    paddingHorizontal: 14, paddingVertical: 8, ...SH.soft,
  },
  alarmPillText: { color: D.onPrimary, fontSize: 12, fontWeight: '800', letterSpacing: 1.2 },

  progressTrack: { height: 6, backgroundColor: D.border, borderRadius: 3, overflow: 'hidden', marginBottom: SP.lg },
  progressFill:  { height: 6, backgroundColor: D.primary, borderRadius: 3 },

  problemCard: { alignItems: 'center', gap: SP.lg },
  eq:        { fontSize: 44, fontWeight: '900', color: D.text, textAlign: 'center' },
  input: {
    backgroundColor: D.cardMuted, borderRadius: R.md,
    paddingHorizontal: SP.xl, paddingVertical: SP.base,
    fontSize: 36, fontWeight: '800', color: D.text,
    textAlign: 'center', minWidth: 200,
    borderWidth: 2, borderColor: D.primaryLight,
  },
  inputWrong: { borderColor: D.warning, backgroundColor: D.warningLight },
  wrongText:  { color: D.warning, fontSize: 14, fontWeight: '800' },

  switchRow:  { flexDirection: 'row', alignItems: 'center', gap: 6, alignSelf: 'center', marginTop: SP.lg },
  switchText: { color: D.primary, fontSize: 13, fontWeight: '700' },
});
