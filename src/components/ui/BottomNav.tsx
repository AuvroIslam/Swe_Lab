import React from 'react';
import { Image, StyleSheet, TouchableOpacity, View } from 'react-native';
import type { NavigationProp } from '@react-navigation/native';
import { RootStackParamList } from '../../types/pose';
import { D, R, SH } from '../../theme/design';

export type BottomNavTab = 'Home' | 'Stats';

const TABS: { name: BottomNavTab; icon: any }[] = [
  { name: 'Home',  icon: require('../../../Elements/Icon(home).png') },
  { name: 'Stats', icon: require('../../../Elements/Icon(profile).png') },
];

interface Props {
  current: BottomNavTab;
  navigation: NavigationProp<RootStackParamList>;
}

export function BottomNav({ current, navigation }: Props) {
  return (
    <View style={s.bar}>
      {TABS.map((tab) => {
        const active = tab.name === current;
        return (
          <TouchableOpacity
            key={tab.name}
            style={s.tab}
            activeOpacity={0.8}
            onPress={() => { if (!active) navigation.navigate(tab.name); }}>
            <View style={[s.iconWrap, active && s.iconWrapActive]}>
              <Image source={tab.icon} style={s.icon} resizeMode="contain" />
            </View>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const s = StyleSheet.create({
  bar: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    flexDirection: 'row',
    backgroundColor: D.card,
    paddingTop: 4, paddingBottom: 6,
    borderTopLeftRadius: R.cardLg, borderTopRightRadius: R.cardLg,
    ...SH.card,
  },
  tab:      { flex: 1, alignItems: 'center', justifyContent: 'center' },
  iconWrap: { width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center' },
  iconWrapActive: { backgroundColor: D.primaryLight },
  icon:     { width: 40, height: 40 },
});
