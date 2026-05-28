import React from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import { D, R, SH, SP } from '../theme/design';

interface Props {
  visible: boolean;
  title?: string;
  subtitle?: string;
}

/** Full-screen celebration shown when an alarm dismissal task is completed. */
export function SuccessOverlay({ visible, title = 'Nice work!', subtitle = 'Alarm dismissed' }: Props) {
  if (!visible) return null;
  return (
    <View style={s.overlay}>
      <Image source={require('../../Elements/BgVariation2.png')} style={StyleSheet.absoluteFill} resizeMode="cover" />
      <View style={s.rewardCard}>
        <Image source={require('../../Elements/SuccessReward.png')} style={s.img} resizeMode="contain" />
      </View>
      <Text style={s.title}>{title}</Text>
      <Text style={s.subtitle}>{subtitle}</Text>
    </View>
  );
}

const s = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    padding: SP.xl,
    zIndex: 50,
  },
  rewardCard: {
    width: 240, height: 240, borderRadius: R.cardLg,
    backgroundColor: D.card,
    alignItems: 'center', justifyContent: 'center',
    marginBottom: SP.lg, ...SH.card,
  },
  img:      { width: 190, height: 190 },
  title:    { fontSize: 26, fontWeight: '900', color: D.text },
  subtitle: { fontSize: 15, fontWeight: '600', color: D.textMuted, marginTop: SP.xs },
});
