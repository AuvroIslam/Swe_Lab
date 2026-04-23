package com.fitcounter.appmonitor

import android.app.AppOpsManager
import android.content.ComponentName
import android.content.Context
import android.content.Intent
import android.os.Build
import android.os.Process
import android.provider.Settings
import android.widget.Toast
import com.facebook.react.bridge.*
import com.facebook.react.modules.core.DeviceEventManagerModule

class AppMonitorModule(private val reactContext: ReactApplicationContext) :
    ReactContextBaseJavaModule(reactContext) {

    private val accessibilityServiceComponent by lazy {
        ComponentName(reactContext, AppMonitorAccessibilityService::class.java).flattenToString()
    }

    override fun getName(): String = "AppMonitor"

    /**
     * Check if PACKAGE_USAGE_STATS permission is granted.
     */
    @ReactMethod
    fun hasUsagePermission(promise: Promise) {
        promise.resolve(checkUsagePermission())
    }

    /**
     * Open the system settings page where user grants usage access.
     */
    @ReactMethod
    fun requestUsagePermission() {
        val intent = Intent(Settings.ACTION_USAGE_ACCESS_SETTINGS).apply {
            addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
        }
        reactContext.startActivity(intent)
    }

    /**
     * Check if our accessibility service is enabled.
     */
    @ReactMethod
    fun hasAccessibilityPermission(promise: Promise) {
        promise.resolve(checkAccessibilityPermission())
    }

    /**
     * Open accessibility settings so the user can enable the service.
     */
    @ReactMethod
    fun requestAccessibilityPermission() {
        val intent = Intent(Settings.ACTION_ACCESSIBILITY_SETTINGS).apply {
            addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
        }
        reactContext.startActivity(intent)
    }

    /**
     * Start the foreground service that monitors blocked apps.
     */
    @ReactMethod
    fun startMonitoring(blockedApps: ReadableArray) {
        val packages = ArrayList<String>()
        for (i in 0 until blockedApps.size()) {
            blockedApps.getString(i)?.let { packages.add(it) }
        }

        // Emit event when a restricted app is opened during an active session.
        AppMonitorCoordinator.onRestrictedAttempt = { packageName ->
            sendEvent("onRestrictedAppAttempt", Arguments.createMap().apply {
                putString("packageName", packageName)
            })
        }

        AppMonitorCoordinator.startSession(packages.toSet())

        val intent = Intent(reactContext, AppMonitorService::class.java)

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            reactContext.startForegroundService(intent)
        } else {
            reactContext.startService(intent)
        }
    }

    /**
     * Stop the monitoring service.
     */
    @ReactMethod
    fun stopMonitoring() {
        AppMonitorCoordinator.stopSession()
        val intent = Intent(reactContext, AppMonitorService::class.java)
        reactContext.stopService(intent)
    }

    /**
     * User confirmed they want to proceed to a restricted app.
     * We allow a short bypass window and launch that app.
     */
    @ReactMethod
    fun proceedToRestrictedApp(packageName: String, promise: Promise) {
        val launched = AppMonitorCoordinator.proceedToRestrictedApp(reactContext, packageName)
        if (launched) {
            Toast.makeText(reactContext, "1 pushup added!", Toast.LENGTH_SHORT).show()
            promise.resolve(true)
        } else {
            promise.resolve(false)
        }
    }

    /**
     * Check if the monitoring service is currently running.
     */
    @ReactMethod
    fun isMonitoring(promise: Promise) {
        promise.resolve(AppMonitorService.isRunning)
    }

    private fun checkUsagePermission(): Boolean {
        val appOps = reactContext.getSystemService(Context.APP_OPS_SERVICE) as AppOpsManager
        val mode = appOps.checkOpNoThrow(
            AppOpsManager.OPSTR_GET_USAGE_STATS,
            Process.myUid(),
            reactContext.packageName
        )
        return mode == AppOpsManager.MODE_ALLOWED
    }

    private fun checkAccessibilityPermission(): Boolean {
        val enabledServices = Settings.Secure.getString(
            reactContext.contentResolver,
            Settings.Secure.ENABLED_ACCESSIBILITY_SERVICES
        ) ?: return false

        return enabledServices
            .split(':')
            .any { it.equals(accessibilityServiceComponent, ignoreCase = true) }
    }

    private fun sendEvent(eventName: String, params: WritableMap) {
        reactContext
            .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
            .emit(eventName, params)
    }

    /**
     * Required for NativeEventEmitter compatibility — no-op on Android.
     */
    @ReactMethod
    fun addListener(eventName: String) { /* no-op */ }

    @ReactMethod
    fun removeListeners(count: Int) { /* no-op */ }
}
