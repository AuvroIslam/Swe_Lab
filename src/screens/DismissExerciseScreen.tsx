import React, { useCallback, useEffect, useRef, useState } from 'react';
import { DimensionValue, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { RootStackParamList, PoseLandmarks } from '../types/pose';
import { CameraView } from '../components/CameraView';
import { FormGlow } from '../components/FormGlow';
import { SuccessOverlay } from '../components/SuccessOverlay';
import { useExerciseTracker } from '../hooks/useExerciseTracker';
import { useExerciseStore } from '../store/exerciseStore';
import { useStatsStore } from '../store/statsStore';
import { stopRinging, useAlarmStore } from '../store/alarmStore';
import { D, R, SP } from '../theme/design';

type Props = NativeStackScreenProps<RootStackParamList, 'DismissExercise'>;

const EXERCISE_LABELS: Record<string, string> = {
  pushup: 'Push-ups',
  situp:  'Sit-ups',
  squat:  'Squats',
};

/**
 * Alarm-dismiss exercise screen — uses the new camera UI with the front/back Flip button
 * (fixes the bug where the session-triggered flow showed the old front-only UI). When the
 * user hits the target rep count, native alarm sound stops and we return Home.
 */
export function DismissExerciseScreen({ navigation, route }: Props) {
  const { alarmId, exerciseType, reps: target } = route.params;
  const { processLandmarks } = useExerciseTracker(exerciseType);
  const alarm = useAlarmStore((s) => s.getById(alarmId));
  const recordExercise = useStatsStore((s) => s.recordExercise);

  const [hasBody, setHasBody]   = useState(false);
  const [repFlash, setRepFlash] = useState(false);
  const [facing, setFacing]     = useState<'front' | 'back'>('front');
  const [success, setSuccess]   = useState(false);
  const prevRepCount  = useRef(0);
  const flashTimeout  = useRef<ReturnType<typeof setTimeout> | null>(null);
  const completed     = useRef(false);

  const { validRepCount, currentPhase, currentFeedback, lastRepScore, isActive } =
    useExerciseStore();

  // Completion → record stats, stop the alarm, celebrate, then go Home.
  useEffect(() => {
    if (completed.current) return;
    if (validRepCount >= target && validRepCount > 0) {
      completed.current = true;
      recordExercise(exerciseType, validRepCount);
      stopRinging();
      setSuccess(true);
      const t = setTimeout(() => navigation.replace('Home'), 1600);
      return () => clearTimeout(t);
    }
  }, [validRepCount, target, exerciseType, recordExercise, navigation]);

  // Rep-flash effect
  useEffect(() => {
    if (validRepCount > prevRepCount.current) {
      prevRepCount.current = validRepCount;
      setRepFlash(true);
      flashTimeout.current = setTimeout(() => setRepFlash(false), 650);
    }
    return () => { if (flashTimeout.current) clearTimeout(flashTimeout.current); };
  }, [validRepCount]);

  const handlePose = useCallback(
    (lm: PoseLandmarks) => { processLandmarks(lm); setHasBody(true); },
    [processLandmarks],
  );

  const flipCamera = useCallback(() => {
    setFacing((f) => (f === 'front' ? 'back' : 'front'));
  }, []);

  const switchToMath = useCallback(() => {
    navigation.replace('MathProblem', {
      alarmId,
      problemCount: alarm?.mathCount ?? 5,
      difficulty: alarm?.difficulty ?? 'easy',
    });
  }, [alarm, alarmId, navigation]);

  const label    = EXERCISE_LABELS[exerciseType] ?? exerciseType;
  const progress = `${Math.min((validRepCount / target) * 100, 100)}%` as DimensionValue;
  const phaseColor =
    currentPhase === 'DOWN' ? D.primaryDark :
    currentPhase === 'UP'   ? D.primary : D.primaryMuted;

  return (
    <View style={s.root}>
      <CameraView onPoseDetected={handlePose} isActive={isActive} facing={facing} />
      <FormGlow
        phase={currentPhase}
        feedback={currentFeedback}
        hasBody={hasBody}
        repCounted={repFlash}
        lastScore={lastRepScore?.total ?? null}
      />

      {/* Header */}
      <View style={s.header}>
        <View style={s.alarmPill}>
          <MaterialCommunityIcons name="alarm" size={14} color={D.onPrimary} />
          <Text style={s.alarmPillText}>ALARM</Text>
        </View>
        <Text style={s.headerTitle}>{label}</Text>
        <View style={s.phasePill}>
          <View style={[s.phaseDot, { backgroundColor: phaseColor }]} />
          <Text style={s.phaseText}>{currentPhase}</Text>
        </View>
      </View>

      {/* Feedback card */}
      {(currentFeedback.length > 0 || !hasBody) && (
        <View style={s.feedbackCard}>
          <Text style={s.feedbackTitle}>
            {currentFeedback[0] ?? 'Position yourself so the camera can see you'}
          </Text>
        </View>
      )}

      {/* Rep counter — lower-middle, lifted off the bottom */}
      <View style={[s.repRing, repFlash && s.repRingFlash]}>
        <Text style={s.repNum}>{Math.min(validRepCount, target)}</Text>
        <Text style={s.repTarget}>/ {target}</Text>
        <Text style={s.repLabel}>REPS</Text>
      </View>

      {/* Controls */}
      <View style={s.controls}>
        <TouchableOpacity style={s.ctrlBtn} onPress={flipCamera} activeOpacity={0.8}>
          <MaterialCommunityIcons name="camera-flip-outline" size={24} color={D.text} />
          <Text style={s.ctrlLabel}>Flip</Text>
        </TouchableOpacity>

        <View style={s.middlePill}>
          <Text style={s.middleText}>Finish to stop the alarm</Text>
        </View>

        <TouchableOpacity style={s.ctrlBtn} onPress={switchToMath} activeOpacity={0.8}>
          <MaterialCommunityIcons name="calculator-variant" size={24} color={D.text} />
          <Text style={s.ctrlLabel}>Math</Text>
        </TouchableOpacity>
      </View>

      {/* Goal bar */}
      <View style={s.goalBar}>
        <View style={s.goalTrack}>
          <View style={[s.goalFill, { width: progress }]} />
        </View>
      </View>

      <SuccessOverlay visible={success} title="Great job!" subtitle={`${validRepCount} ${label.toLowerCase()} done`} />
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#000' },

  header: {
    position: 'absolute', top: 0, left: 0, right: 0,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingTop: 16, paddingHorizontal: SP.lg,
  },
  alarmPill: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: D.primary, borderRadius: R.pill,
    paddingHorizontal: 12, paddingVertical: 8, height: 36,
  },
  alarmPillText: { color: D.onPrimary, fontSize: 11, fontWeight: '800', letterSpacing: 1.4 },
  headerTitle: {
    fontSize: 17, fontWeight: '800', color: '#fff',
    textShadowColor: 'rgba(0,0,0,0.5)', textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 4,
  },
  phasePill: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: R.pill, paddingHorizontal: 12, paddingVertical: 8, height: 36,
  },
  phaseDot:  { width: 8, height: 8, borderRadius: 4 },
  phaseText: { color: D.text, fontSize: 12, fontWeight: '800', letterSpacing: 0.5 },

  // lower area, lifted just above the bottom controls
  repRing: {
    position: 'absolute', bottom: 150, alignSelf: 'center',
    width: 140, height: 140, borderRadius: 70,
    borderWidth: 5, borderColor: D.primary,
    backgroundColor: 'rgba(255,255,255,0.95)',
    alignItems: 'center', justifyContent: 'center',
  },
  repRingFlash: { borderColor: D.primaryDark, backgroundColor: D.primaryLight },
  repNum:    { fontSize: 52, fontWeight: '900', color: D.primary, lineHeight: 56 },
  repTarget: { fontSize: 16, fontWeight: '700', color: D.textMuted, marginTop: -2 },
  repLabel:  { fontSize: 11, fontWeight: '800', color: D.textMuted, letterSpacing: 2, marginTop: 4 },

  feedbackCard: {
    position: 'absolute', top: 70, left: SP.xl, right: SP.xl,
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderRadius: R.card, paddingVertical: SP.md, paddingHorizontal: SP.base,
    alignItems: 'center',
  },
  feedbackTitle: { fontSize: 14, fontWeight: '700', color: D.text, textAlign: 'center' },

  controls: {
    position: 'absolute', bottom: 76, left: SP.xl, right: SP.xl,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
  },
  ctrlBtn: {
    width: 60, height: 60, borderRadius: 30,
    backgroundColor: 'rgba(255,255,255,0.9)',
    alignItems: 'center', justifyContent: 'center', gap: 2,
  },
  ctrlLabel: { fontSize: 9, fontWeight: '700', color: D.textMuted, letterSpacing: 0.5 },
  middlePill: {
    flex: 1, marginHorizontal: SP.md, height: 56,
    backgroundColor: D.primary, borderRadius: R.pill,
    alignItems: 'center', justifyContent: 'center',
  },
  middleText: { color: '#fff', fontSize: 13, fontWeight: '800', letterSpacing: 0.5 },

  goalBar: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    backgroundColor: 'rgba(255,255,255,0.95)',
    paddingHorizontal: SP.xl, paddingTop: SP.sm, paddingBottom: SP.base,
  },
  goalTrack: { height: 6, backgroundColor: D.border, borderRadius: 3, overflow: 'hidden' },
  goalFill:  { height: 6, backgroundColor: D.primary, borderRadius: 3 },
});
