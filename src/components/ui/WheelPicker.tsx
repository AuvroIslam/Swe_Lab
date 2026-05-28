import React, { useMemo, useRef } from 'react';
import {
  FlatList,
  NativeScrollEvent,
  NativeSyntheticEvent,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { D, R } from '../../theme/design';

const ITEM_H = 48;
const VISIBLE = 3;       // rows shown; the middle row (under the band) is selected
const REPEAT = 101;      // virtualized copies → effectively infinite / looping

interface Props {
  items: string[];
  selectedIndex: number;
  onChange: (index: number) => void;
  width?: number;
}

/**
 * Snapping vertical wheel that loops endlessly (… 58, 59, 0, 1 …). Built on a
 * virtualized FlatList of many repeated copies; after each settle we recenter to
 * the middle copy so the user can always keep scrolling in either direction.
 */
export function WheelPicker({ items, selectedIndex, onChange, width = 72 }: Props) {
  const ref = useRef<FlatList<number>>(null);
  const baseLen = items.length;
  const middle = Math.floor(REPEAT / 2) * baseLen;

  const data = useMemo(
    () => Array.from({ length: REPEAT * baseLen }, (_, i) => i),
    [baseLen],
  );

  // Place the selected value under the band initially.
  const initialIndex = middle + selectedIndex - 1;

  const getItemLayout = (_: unknown, index: number) => ({
    length: ITEM_H,
    offset: ITEM_H * index,
    index,
  });

  const settle = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const raw = Math.round(e.nativeEvent.contentOffset.y / ITEM_H); // top row index
    const centerAbs = raw + 1;                                      // row under the band
    const real = ((centerAbs % baseLen) + baseLen) % baseLen;
    if (real !== selectedIndex) onChange(real);

    // Recenter to the middle copy so scrolling never runs out of items.
    const targetTop = middle + real - 1;
    if (raw !== targetTop) {
      requestAnimationFrame(() =>
        ref.current?.scrollToOffset({ offset: targetTop * ITEM_H, animated: false }),
      );
    }
  };

  return (
    <View style={[s.wrap, { width, height: ITEM_H * VISIBLE }]}>
      <View pointerEvents="none" style={s.band} />
      <FlatList
        ref={ref}
        data={data}
        keyExtractor={(it) => String(it)}
        renderItem={({ item }) => {
          const v = item % baseLen;
          return (
            <View style={s.item}>
              <Text style={[s.text, v === selectedIndex && s.textActive]}>{items[v]}</Text>
            </View>
          );
        }}
        getItemLayout={getItemLayout}
        initialScrollIndex={initialIndex}
        snapToInterval={ITEM_H}
        decelerationRate="fast"
        showsVerticalScrollIndicator={false}
        nestedScrollEnabled
        onMomentumScrollEnd={settle}
        onScrollToIndexFailed={() => {
          setTimeout(() => ref.current?.scrollToOffset({ offset: initialIndex * ITEM_H, animated: false }), 0);
        }}
      />
    </View>
  );
}

const s = StyleSheet.create({
  wrap: { overflow: 'hidden' },
  band: {
    position: 'absolute', left: 0, right: 0, top: ITEM_H, height: ITEM_H,
    backgroundColor: D.primaryLight, borderRadius: R.md,
  },
  item: { height: ITEM_H, alignItems: 'center', justifyContent: 'center' },
  text: { fontSize: 24, fontWeight: '700', color: D.textLight },
  textActive: { fontSize: 30, fontWeight: '900', color: D.primary },
});
