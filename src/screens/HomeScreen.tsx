import React from 'react';
import {
  Image,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { RootStackParamList, ExerciseType } from '../types/pose';
import { Card } from '../components/ui/Card';
import { AppBackground } from '../components/ui/AppBackground';
import { BottomNav } from '../components/ui/BottomNav';
import { useAlarmStore, Alarm, AlarmRepeat } from '../store/alarmStore';
import { D, SP, R, SH } from '../theme/design';

type Props = NativeStackScreenProps<RootStackParamList, 'Home'>;

const EXERCISES: { type: ExerciseType; label: string; img: any }[] = [
  { type: 'pushup', label: 'Push-ups', img: require('../../Elements/pushup.png') },
  { type: 'situp',  label: 'Sit-ups',  img: require('../../Elements/situps.png') },
  { type: 'squat',  label: 'Squats',   img: require('../../Elements/squats.png') },
];

const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function to12h(hour24: number) { const h = hour24 % 12; return h === 0 ? 12 : h; }
function pad(n: number) { return n.toString().padStart(2, '0'); }

function repeatLabel(repeat: AlarmRepeat): string {
  if (repeat.kind === 'daily') return 'Daily';
  if (repeat.kind === 'once') return 'Once';
  if (repeat.days.length === 7) return 'Every day';
  return [...repeat.days].sort().map((d) => DAY_LABELS[d]).join(' ');
}

export function HomeScreen({ navigation }: Props) {
  const alarms = useAlarmStore((s) => s.alarms);
  const toggle = useAlarmStore((s) => s.toggle);

  const sorted = [...alarms].sort((a, b) => a.hour * 60 + a.minute - (b.hour * 60 + b.minute));
  const go = (type: ExerciseType) => navigation.navigate('Exercise', { exerciseType: type });

  return (
    <AppBackground variant={1}>
      <SafeAreaView style={s.safe}>
        <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>

          {/* Brand card */}
          <Card padding={SP.lg} style={s.brandCard}>
            <Image source={require('../../Elements/AppLogo.png')} style={s.logo} resizeMode="contain" />
            <View style={{ flex: 1 }}>
              <Text style={s.brand}>FitAlarmly</Text>
              <Text style={s.tagline}>Wake up. Work out. Stay sharp.</Text>
            </View>
          </Card>

          {/* Quick Exercise */}
          <Text style={s.sectionTitle}>Quick Exercise</Text>
          <Text style={s.sectionSub}>Move and the camera counts your reps.</Text>
          <View style={s.exerciseRow}>
            {EXERCISES.map(({ type, label, img }) => (
              <TouchableOpacity key={type} style={s.exCard} onPress={() => go(type)} activeOpacity={0.8}>
                <Image source={img} style={s.exImg} resizeMode="contain" />
                <Text style={s.exLabel}>{label}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Alarms */}
          <View style={s.alarmHead}>
            <Text style={s.sectionTitle}>Alarms</Text>
            <TouchableOpacity style={s.addBtn} onPress={() => navigation.navigate('AlarmSetup')} activeOpacity={0.85}>
              <MaterialCommunityIcons name="plus" size={18} color={D.onPrimary} />
              <Text style={s.addBtnText}>Add</Text>
            </TouchableOpacity>
          </View>

          {sorted.length === 0 ? (
            <Card padding={SP.xl} style={s.emptyCard}>
              <Image source={require('../../Elements/EmptyState.png')} style={s.emptyImg} resizeMode="contain" />
              <Text style={s.emptyTitle}>No alarms yet</Text>
              <Text style={s.emptySub}>Add one and dismiss it with exercise or math.</Text>
            </Card>
          ) : (
            sorted.map((a) => (
              <AlarmRow key={a.id} alarm={a} onToggle={() => toggle(a.id)} onPress={() => navigation.navigate('AlarmSetup', { alarmId: a.id })} />
            ))
          )}

        </ScrollView>
        <BottomNav current="Home" navigation={navigation} />
      </SafeAreaView>
    </AppBackground>
  );
}

function AlarmRow({ alarm, onToggle, onPress }: { alarm: Alarm; onToggle: () => void; onPress: () => void }) {
  const period = alarm.hour < 12 ? 'AM' : 'PM';
  const dismissLabel =
    alarm.exerciseType === 'pushup' ? 'push-ups' : alarm.exerciseType === 'situp' ? 'sit-ups' : 'squats';
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.85}>
      <Card padding={SP.lg} style={s.alarmCard}>
        <View style={{ flex: 1 }}>
          <View style={s.timeRow}>
            <Text style={[s.alarmTime, !alarm.enabled && s.dim]}>{to12h(alarm.hour)}:{pad(alarm.minute)}</Text>
            <Text style={[s.alarmPeriod, !alarm.enabled && s.dim]}>{period}</Text>
          </View>
          <Text style={[s.alarmLabel, !alarm.enabled && s.dim]}>{alarm.label} · {repeatLabel(alarm.repeat)}</Text>
          <Text style={s.alarmMeta}>{alarm.reps} {dismissLabel} · {alarm.mathCount} math ({alarm.difficulty})</Text>
        </View>
        <Switch
          value={alarm.enabled}
          onValueChange={onToggle}
          trackColor={{ false: D.border, true: D.primaryMuted }}
          thumbColor={alarm.enabled ? D.primary : '#f4f3f4'}
        />
      </Card>
    </TouchableOpacity>
  );
}

const s = StyleSheet.create({
  safe:   { flex: 1, backgroundColor: 'transparent' },
  scroll: { paddingHorizontal: SP.xl, paddingBottom: 84, paddingTop: SP.lg },

  brandCard: { flexDirection: 'row', alignItems: 'center', gap: SP.md, marginBottom: SP.xl },
  logo:      { width: 52, height: 52 },
  brand:     { fontSize: 24, fontWeight: '900', color: D.primary },
  tagline:   { fontSize: 13, color: D.textMuted, marginTop: 2 },

  sectionTitle: { fontSize: 17, fontWeight: '800', color: D.text, marginBottom: SP.xs, marginTop: SP.sm },
  sectionSub:   { fontSize: 13, color: D.textMuted, marginBottom: SP.md },

  exerciseRow: { flexDirection: 'row', gap: SP.md, marginBottom: SP.xl },
  exCard:      { flex: 1, backgroundColor: D.card, borderRadius: R.card, paddingVertical: SP.lg, alignItems: 'center', ...SH.card },
  exImg:       { width: 56, height: 56, marginBottom: SP.sm },
  exLabel:     { fontSize: 12, fontWeight: '700', color: D.text, textAlign: 'center' },

  alarmHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: SP.sm },
  addBtn:    { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: D.primary, borderRadius: R.pill, paddingHorizontal: SP.base, paddingVertical: SP.sm, ...SH.button },
  addBtnText:{ color: D.onPrimary, fontSize: 13, fontWeight: '800' },

  emptyCard: { alignItems: 'center', gap: SP.sm, marginTop: SP.md },
  emptyImg:  { width: 120, height: 120 },
  emptyTitle:{ fontSize: 15, fontWeight: '800', color: D.text },
  emptySub:  { fontSize: 13, color: D.textMuted, textAlign: 'center' },

  alarmCard: { flexDirection: 'row', alignItems: 'center', marginTop: SP.md },
  timeRow:   { flexDirection: 'row', alignItems: 'baseline', gap: 6 },
  alarmTime: { fontSize: 30, fontWeight: '900', color: D.text, lineHeight: 34 },
  alarmPeriod:{ fontSize: 14, fontWeight: '800', color: D.textMuted },
  alarmLabel:{ fontSize: 14, fontWeight: '700', color: D.text, marginTop: 2 },
  alarmMeta: { fontSize: 12, color: D.textMuted, marginTop: 2 },
  dim:       { opacity: 0.4 },
});
