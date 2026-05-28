import React, { useState } from 'react';
import { Image, SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/pose';
import { Card } from '../components/ui/Card';
import { AppBackground } from '../components/ui/AppBackground';
import { BottomNav } from '../components/ui/BottomNav';
import { useStatsStore, caloriesFromReps } from '../store/statsStore';
import { useAvatarStore, AVATARS } from '../store/avatarStore';
import { D, R, SH, SP } from '../theme/design';

type Props = NativeStackScreenProps<RootStackParamList, 'Stats'>;

const EXERCISES: { type: 'pushup' | 'situp' | 'squat'; label: string; img: any }[] = [
  { type: 'pushup', label: 'Push-ups', img: require('../../Elements/pushup.png') },
  { type: 'situp',  label: 'Sit-ups',  img: require('../../Elements/situps.png') },
  { type: 'squat',  label: 'Squats',   img: require('../../Elements/squats.png') },
];

export function StatsScreen({ navigation }: Props) {
  const totalReps = useStatsStore((s) => s.totalReps);
  const sessions = useStatsStore((s) => s.sessions);
  const byExercise = useStatsStore((s) => s.byExercise);
  const calories = caloriesFromReps(totalReps);

  const selectedIndex = useAvatarStore((s) => s.selectedIndex);
  const setIndex = useAvatarStore((s) => s.setIndex);
  const [picking, setPicking] = useState(false);

  return (
    <AppBackground variant={1}>
      <SafeAreaView style={s.safe}>
        <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>

          {/* Header */}
          <Card padding={SP.lg} style={s.headerCard}>
            <TouchableOpacity onPress={() => setPicking((p) => !p)} activeOpacity={0.8} style={s.avatarWrap}>
              <Image source={AVATARS[selectedIndex]} style={s.avatar} resizeMode="cover" />
            </TouchableOpacity>
            <View style={{ flex: 1 }}>
              <Text style={s.title}>Your Progress</Text>
              <Text style={s.subtitle}>Tap your avatar to change it.</Text>
            </View>
          </Card>

          {/* Avatar picker */}
          {picking && (
            <Card padding={SP.lg} style={{ marginBottom: SP.xl }}>
              <Text style={s.pickerTitle}>Choose your avatar</Text>
              <View style={s.avatarRow}>
                {AVATARS.map((src, i) => (
                  <TouchableOpacity
                    key={i}
                    onPress={() => { setIndex(i); setPicking(false); }}
                    activeOpacity={0.8}
                    style={[s.choiceWrap, i === selectedIndex && s.choiceWrapActive]}>
                    <Image source={src} style={s.choiceImg} resizeMode="cover" />
                  </TouchableOpacity>
                ))}
              </View>
            </Card>
          )}

          {/* Headline stats */}
          <View style={s.statRow}>
            <Card padding={SP.lg} style={s.statCard}>
              <Text style={s.statNum}>{totalReps}</Text>
              <Text style={s.statLabel}>Total reps</Text>
            </Card>
            <Card padding={SP.lg} style={s.statCard}>
              <Text style={[s.statNum, { color: D.danger }]}>{calories}</Text>
              <Text style={s.statLabel}>Calories burned</Text>
            </Card>
          </View>

          <Card padding={SP.lg} style={{ marginBottom: SP.xl }}>
            <View style={s.sessionRow}>
              <Text style={s.sessionLabel}>Workouts completed</Text>
              <Text style={s.sessionNum}>{sessions}</Text>
            </View>
          </Card>

          {/* Per-exercise breakdown */}
          <Text style={s.sectionTitle}>By exercise</Text>
          {EXERCISES.map(({ type, label, img }) => (
            <Card key={type} padding={SP.lg} style={s.exCard}>
              <Image source={img} style={s.exImg} resizeMode="contain" />
              <Text style={s.exLabel}>{label}</Text>
              <Text style={s.exReps}>{byExercise[type] ?? 0} reps</Text>
            </Card>
          ))}

        </ScrollView>
        <BottomNav current="Stats" navigation={navigation} />
      </SafeAreaView>
    </AppBackground>
  );
}

const s = StyleSheet.create({
  safe:   { flex: 1, backgroundColor: 'transparent' },
  scroll: { paddingHorizontal: SP.xl, paddingBottom: 84, paddingTop: SP.lg },

  headerCard: { flexDirection: 'row', alignItems: 'center', gap: SP.md, marginBottom: SP.xl },
  avatarWrap: { width: 60, height: 60, borderRadius: 30, overflow: 'hidden', borderWidth: 2.5, borderColor: D.primary, alignItems: 'center', justifyContent: 'center' },
  avatar:     { width: '100%', height: '100%' },
  title:      { fontSize: 22, fontWeight: '900', color: D.text },
  subtitle:   { fontSize: 13, color: D.textMuted, marginTop: 2 },

  pickerTitle:{ fontSize: 13, fontWeight: '800', color: D.primary, letterSpacing: 1, marginBottom: SP.md },
  avatarRow:  { flexDirection: 'row', flexWrap: 'wrap', rowGap: SP.lg, justifyContent: 'space-between' },
  choiceWrap: { width: 72, height: 72, borderRadius: 36, overflow: 'hidden', borderWidth: 3, borderColor: 'transparent', alignItems: 'center', justifyContent: 'center' },
  choiceWrapActive: { borderColor: D.primary },
  choiceImg:  { width: '100%', height: '100%' },

  statRow:   { flexDirection: 'row', gap: SP.md, marginBottom: SP.md },
  statCard:  { flex: 1, alignItems: 'center' },
  statNum:   { fontSize: 38, fontWeight: '900', color: D.primary },
  statLabel: { fontSize: 12, fontWeight: '700', color: D.textMuted, marginTop: 2 },

  sessionRow:   { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  sessionLabel: { fontSize: 14, fontWeight: '700', color: D.text },
  sessionNum:   { fontSize: 22, fontWeight: '900', color: D.primary },

  sectionTitle: { fontSize: 16, fontWeight: '800', color: D.text, marginBottom: SP.md },
  exCard:  { flexDirection: 'row', alignItems: 'center', marginBottom: SP.md },
  exImg:   { width: 40, height: 40, marginRight: SP.md },
  exLabel: { flex: 1, fontSize: 15, fontWeight: '700', color: D.text },
  exReps:  { fontSize: 15, fontWeight: '800', color: D.primary },
});
