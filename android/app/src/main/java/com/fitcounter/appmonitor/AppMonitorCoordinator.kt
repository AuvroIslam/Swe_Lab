package com.fitcounter.appmonitor

import android.content.Context
import android.content.Intent
import com.fitcounter.MainActivity

object AppMonitorCoordinator {

    private const val COOLDOWN_MS = 2500L
    private const val PROCEED_ALLOW_MS = 4000L

    private var blockedPackages: Set<String> = emptySet()
    private var sessionActive: Boolean = false
    private var lastInterceptAt: Long = 0L
    private var lastInterceptPackage: String? = null

    private var temporarilyAllowedPackage: String? = null
    private var temporarilyAllowedUntil: Long = 0L

    var onRestrictedAttempt: ((String) -> Unit)? = null

    fun startSession(packages: Set<String>) {
        blockedPackages = packages
        sessionActive = true
        lastInterceptAt = 0L
        lastInterceptPackage = null
        temporarilyAllowedPackage = null
        temporarilyAllowedUntil = 0L
    }

    fun stopSession() {
        sessionActive = false
        blockedPackages = emptySet()
        onRestrictedAttempt = null
        temporarilyAllowedPackage = null
        temporarilyAllowedUntil = 0L
    }

    fun isSessionActive(): Boolean = sessionActive

    fun updateBlockedPackages(packages: Set<String>) {
        blockedPackages = packages
    }

    fun handleForegroundPackage(context: Context, packageName: String?) {
        if (!sessionActive || packageName.isNullOrBlank()) return
        if (packageName == context.packageName) return
        if (packageName !in blockedPackages) return

        val now = System.currentTimeMillis()
        if (packageName == temporarilyAllowedPackage && now <= temporarilyAllowedUntil) {
            return
        }

        if (packageName == lastInterceptPackage && (now - lastInterceptAt) < COOLDOWN_MS) {
            return
        }

        lastInterceptAt = now
        lastInterceptPackage = packageName

        bringMainActivityToFront(context)
        onRestrictedAttempt?.invoke(packageName)
    }

    fun proceedToRestrictedApp(context: Context, packageName: String): Boolean {
        val launchIntent = context.packageManager.getLaunchIntentForPackage(packageName) ?: return false

        val now = System.currentTimeMillis()
        temporarilyAllowedPackage = packageName
        temporarilyAllowedUntil = now + PROCEED_ALLOW_MS

        launchIntent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
        context.startActivity(launchIntent)
        return true
    }

    private fun bringMainActivityToFront(context: Context) {
        val intent = Intent(context, MainActivity::class.java).apply {
            addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
            addFlags(Intent.FLAG_ACTIVITY_SINGLE_TOP)
            addFlags(Intent.FLAG_ACTIVITY_CLEAR_TOP)
        }
        context.startActivity(intent)
    }
}
