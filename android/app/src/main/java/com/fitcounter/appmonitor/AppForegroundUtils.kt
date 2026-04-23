package com.fitcounter.appmonitor

import android.app.usage.UsageStatsManager
import android.content.Context
import android.view.accessibility.AccessibilityEvent

object AppForegroundUtils {

    fun getPackageFromAccessibilityEvent(event: AccessibilityEvent?): String? {
        return event?.packageName?.toString()
    }

    fun getForegroundPackageFromUsageStats(context: Context): String? {
        val usm = context.getSystemService(Context.USAGE_STATS_SERVICE) as? UsageStatsManager
            ?: return null

        val now = System.currentTimeMillis()
        val stats = usm.queryUsageStats(
            UsageStatsManager.INTERVAL_DAILY,
            now - 60_000,
            now
        )

        if (stats.isNullOrEmpty()) return null
        return stats.maxByOrNull { it.lastTimeUsed }?.packageName
    }
}
