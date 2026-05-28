import React, { useEffect, useRef } from 'react';
import { NativeEventEmitter, NativeModules, PermissionsAndroid, Platform } from 'react-native';
import { NavigationContainer, createNavigationContainerRef } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { RootStackParamList } from './types/pose';
import { D } from './theme/design';
import { HomeScreen } from './screens/HomeScreen';
import { StatsScreen } from './screens/StatsScreen';
import { ExerciseScreen } from './screens/ExerciseScreen';
import { SummaryScreen } from './screens/SummaryScreen';
import { AlarmSetupScreen } from './screens/AlarmSetupScreen';
import { AlarmRingScreen } from './screens/AlarmRingScreen';
import { DismissExerciseScreen } from './screens/DismissExerciseScreen';
import { MathProblemScreen } from './screens/MathProblemScreen';
import { useAlarmStore, getInitialAlarm } from './store/alarmStore';
import { useStatsStore } from './store/statsStore';
import { useAvatarStore } from './store/avatarStore';

const Stack = createNativeStackNavigator<RootStackParamList>();
export const navigationRef = createNavigationContainerRef<RootStackParamList>();

function goToRing(alarmId: string) {
  if (navigationRef.isReady()) {
    navigationRef.navigate('AlarmRing', { alarmId });
  }
  // A fired one-time alarm won't re-arm natively; reflect that in the UI.
  useAlarmStore.getState().disableOnce(alarmId);
}

export default function App() {
  const hydrateAlarms = useAlarmStore((s) => s.hydrate);
  const hydrateStats = useStatsStore((s) => s.hydrate);
  const hydrateAvatar = useAvatarStore((s) => s.hydrate);
  const pendingRing = useRef<string | null>(null);

  useEffect(() => {
    hydrateAlarms();
    hydrateStats();
    hydrateAvatar();

    if (Platform.OS === 'android' && Platform.Version >= 33) {
      PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
      ).catch(() => {});
    }

    // App brought to foreground / already running when an alarm fires.
    const emitter = new NativeEventEmitter(NativeModules.AlarmScheduler);
    const sub = emitter.addListener('onAlarmFired', (e: { alarmId: string }) => {
      if (e?.alarmId) {
        if (navigationRef.isReady()) goToRing(e.alarmId);
        else pendingRing.current = e.alarmId;
      }
    });

    // Cold start: the app was launched by an alarm before any JS listener existed.
    getInitialAlarm()
      .then((alarmId) => {
        if (alarmId) {
          if (navigationRef.isReady()) goToRing(alarmId);
          else pendingRing.current = alarmId;
        }
      })
      .catch(() => {});

    return () => sub.remove();
  }, [hydrateAlarms, hydrateStats, hydrateAvatar]);

  return (
    <NavigationContainer
      ref={navigationRef}
      onReady={() => {
        if (pendingRing.current) {
          goToRing(pendingRing.current);
          pendingRing.current = null;
        }
      }}>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          animation: 'slide_from_right',
          contentStyle: { backgroundColor: D.bg },
        }}>
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="Stats" component={StatsScreen} />
        <Stack.Screen name="Exercise" component={ExerciseScreen} />
        <Stack.Screen name="Summary" component={SummaryScreen} />
        <Stack.Screen name="AlarmSetup" component={AlarmSetupScreen} />
        <Stack.Screen
          name="AlarmRing"
          component={AlarmRingScreen}
          options={{ gestureEnabled: false, animation: 'fade' }}
        />
        <Stack.Screen
          name="DismissExercise"
          component={DismissExerciseScreen}
          options={{ gestureEnabled: false }}
        />
        <Stack.Screen
          name="MathProblem"
          component={MathProblemScreen}
          options={{ gestureEnabled: false }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
