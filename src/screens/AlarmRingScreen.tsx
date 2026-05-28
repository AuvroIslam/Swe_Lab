import React, { useEffect, useMemo, useState } from 'react';
import { Image, SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import Feather from 'react-native-vector-icons/Feather';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { RootStackParamList } from '../types/pose';
import { AppBackground } from '../components/ui/AppBackground';
import { useAlarmStore } from '../store/alarmStore';
import { D, R, SH, SP } from '../theme/design';

type Props = NativeStackScreenProps<RootStackParamList, 'AlarmRing'>;

function to12h(hour24: number) { const h = hour24 % 12; return h === 0 ? 12 : h; }
function pad(n: number) { return n.toString().padStart(2, '0'); }

export function AlarmRingScreen({ navigation, route }: Props) {
  const { alarmId } = route.params;
  const alarm = useAlarmStore((st) => st.getById(alarmId));
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const time = useMemo(() => {
    const period = now.getHours() < 12 ? 'AM' : 'PM';
    return { hm: `${to12h(now.getHours())}:${pad(now.getMinutes())}`, period };
  }, [now]);

  const goExercise = () => {
    if (!alarm) return;
    navigation.replace('DismissExercise', { alarmId, exerciseType: alarm.exerciseType, reps: alarm.reps });
  };
  const goMath = () => {
    if (!alarm) return;
    navigation.replace('MathProblem', { alarmId, problemCount: alarm.mathCount, difficulty: alarm.difficulty });
  };

  return (
    <AppBackground variant={2}>
      <SafeAreaView style={s.safe}>
        {/* Header */}
        <View style={s.header}>
          <View style={s.bell}>
            <MaterialCommunityIcons name="alarm" size={34} color={D.primary} />
          </View>
          <View style={s.timeRow}>
            <Text style={s.time}>{time.hm}</Text>
            <Text style={s.period}>{time.period}</Text>
          </View>
          <Text style={s.label}>{alarm?.label ?? 'Alarm'}</Text>
        </View>

        {/* Options */}
        <View style={s.options}>
          <Text style={s.sectionLabel}>CHOOSE HOW TO DISMISS</Text>

          <OptionCard
            badgeColor={D.primaryLight}
            image={require('../../Elements/Icon(dumbel).png')}
            title="Do Exercise"
            subtitle={alarm ? `${alarm.reps} ${exerciseLabel(alarm.exerciseType)}` : ''}
            onPress={goExercise}
          />

          <OptionCard
            badgeColor={D.primaryLight}
            image={require('../../Elements/calculator.png')}
            title="Solve Math"
            subtitle={alarm ? `${alarm.mathCount} problems · ${alarm.difficulty}` : ''}
            onPress={goMath}
          />
        </View>

        <Text style={s.footnote}>The alarm keeps ringing until you finish.</Text>
      </SafeAreaView>
    </AppBackground>
  );
}

function OptionCard({ badgeColor, image, title, subtitle, onPress }: {
  badgeColor: string; image: any; title: string; subtitle: string; onPress: () => void;
}) {
  return (
    <TouchableOpacity style={s.card} onPress={onPress} activeOpacity={0.85}>
      <View style={[s.badge, { backgroundColor: badgeColor }]}>
        <Image source={image} style={s.badgeImg} resizeMode="contain" />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={s.cardTitle}>{title}</Text>
        <Text style={s.cardSub}>{subtitle}</Text>
      </View>
      <Feather name="chevron-right" size={24} color={D.primary} />
    </TouchableOpacity>
  );
}

function exerciseLabel(t: string) {
  return t === 'pushup' ? 'push-ups' : t === 'situp' ? 'sit-ups' : 'squats';
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: 'transparent', paddingHorizontal: SP.xl, justifyContent: 'space-between' },

  header: { alignItems: 'center', marginTop: SP.xxxl },
  bell: {
    width: 72, height: 72, borderRadius: 36, backgroundColor: D.card,
    alignItems: 'center', justifyContent: 'center', ...SH.card, marginBottom: SP.lg,
  },
  timeRow: { flexDirection: 'row', alignItems: 'flex-end', gap: SP.sm },
  time:    { fontSize: 66, fontWeight: '900', color: D.text, lineHeight: 70 },
  period:  { fontSize: 24, fontWeight: '800', color: D.primary, marginBottom: 10 },
  label:   { fontSize: 16, fontWeight: '700', color: D.textMuted, marginTop: SP.xs },

  options: { },
  sectionLabel: { fontSize: 11, fontWeight: '800', color: D.textMuted, letterSpacing: 1.6, marginBottom: SP.md, marginLeft: SP.xs },
  card: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: D.card, borderRadius: R.cardLg,
    padding: SP.base, gap: SP.base, marginBottom: SP.md, ...SH.card,
  },
  badge: { width: 64, height: 64, borderRadius: R.card, alignItems: 'center', justifyContent: 'center' },
  badgeImg: { width: 44, height: 44 },
  cardTitle: { fontSize: 18, fontWeight: '800', color: D.text },
  cardSub:   { fontSize: 13, fontWeight: '600', color: D.textMuted, marginTop: 2 },

  footnote: { fontSize: 12, color: D.textMuted, textAlign: 'center', paddingBottom: SP.xl },
});
