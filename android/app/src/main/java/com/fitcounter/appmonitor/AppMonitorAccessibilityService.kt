package com.fitcounter.appmonitor

import android.accessibilityservice.AccessibilityService
import android.view.accessibility.AccessibilityEvent

class AppMonitorAccessibilityService : AccessibilityService() {

    override fun onAccessibilityEvent(event: AccessibilityEvent?) {
        if (!AppMonitorCoordinator.isSessionActive()) return
        if (event?.eventType != AccessibilityEvent.TYPE_WINDOW_STATE_CHANGED) return

        val foregroundPackage = AppForegroundUtils.getPackageFromAccessibilityEvent(event)
        AppMonitorCoordinator.handleForegroundPackage(this, foregroundPackage)
    }

    override fun onInterrupt() {
        // No-op
    }
}
