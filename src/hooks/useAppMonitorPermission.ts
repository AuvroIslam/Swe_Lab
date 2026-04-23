import { useState, useEffect, useCallback } from 'react';
import { NativeModules, Platform, PermissionsAndroid } from 'react-native';

const { AppMonitor } = NativeModules;

export function useAppMonitorPermission() {
  const [hasUsagePermission, setHasUsagePermission] = useState(false);
  const [hasAccessibilityPermission, setHasAccessibilityPermission] = useState(false);
  const [checked, setChecked] = useState(false);

  const check = useCallback(async () => {
    if (Platform.OS !== 'android') {
      setHasUsagePermission(false);
      setHasAccessibilityPermission(false);
      setChecked(true);
      return;
    }
    try {
      const usageGranted = await AppMonitor.hasUsagePermission();
      const accessibilityGranted = await AppMonitor.hasAccessibilityPermission();
      setHasUsagePermission(Boolean(usageGranted));
      setHasAccessibilityPermission(Boolean(accessibilityGranted));
    } catch {
      setHasUsagePermission(false);
      setHasAccessibilityPermission(false);
    }
    setChecked(true);
  }, []);

  useEffect(() => {
    check();
  }, [check]);

  const requestPermission = useCallback(() => {
    AppMonitor.requestAccessibilityPermission();
    AppMonitor.requestUsagePermission();

    // User goes to settings — recheck after a delay when they return
    const interval = setInterval(async () => {
      try {
        const usageGranted = await AppMonitor.hasUsagePermission();
        const accessibilityGranted = await AppMonitor.hasAccessibilityPermission();

        setHasUsagePermission(Boolean(usageGranted));
        setHasAccessibilityPermission(Boolean(accessibilityGranted));

        if (usageGranted || accessibilityGranted) {
          clearInterval(interval);
        }
      } catch { /* ignore */ }
    }, 1000);
    // Stop polling after 60 seconds
    setTimeout(() => clearInterval(interval), 60000);
  }, []);

  const requestNotificationPermission = useCallback(async () => {
    if (Platform.OS === 'android' && Platform.Version >= 33) {
      await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
      );
    }
  }, []);

  return {
    hasPermission: hasAccessibilityPermission || hasUsagePermission,
    hasUsagePermission,
    hasAccessibilityPermission,
    checked,
    check,
    requestPermission,
    requestNotificationPermission,
  };
}
