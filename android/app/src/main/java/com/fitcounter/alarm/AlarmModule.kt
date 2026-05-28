package com.fitcounter.alarm

import android.content.Intent
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.bridge.WritableMap
import com.facebook.react.modules.core.DeviceEventManagerModule

class AlarmModule(private val reactContext: ReactApplicationContext) :
    ReactContextBaseJavaModule(reactContext) {

    init {
        AlarmState.emitter = { id ->
            // The bridge may not be ready on a cold start; getInitialAlarm() is the fallback.
            runCatching {
                if (reactContext.hasActiveReactInstance()) {
                    sendEvent("onAlarmFired", Arguments.createMap().apply {
                        putString("alarmId", id)
                    })
                }
            }
        }
    }

    override fun getName(): String = "AlarmScheduler"

    @ReactMethod
    fun scheduleAlarm(id: String, triggerAtMillis: Double, label: String, repeat: String) {
        AlarmScheduler.schedule(reactContext, id, triggerAtMillis.toLong(), label, repeat)
    }

    @ReactMethod
    fun cancelAlarm(id: String) {
        AlarmScheduler.cancel(reactContext, id)
    }

    @ReactMethod
    fun stopRinging() {
        val intent = Intent(reactContext, AlarmService::class.java).apply {
            action = AlarmConstants.ACTION_STOP
        }
        reactContext.startService(intent)
    }

    /**
     * Called by JS on mount. Returns the alarm id if the app was launched (or brought to
     * the foreground) by an alarm and no JS listener was available to receive the event yet.
     */
    @ReactMethod
    fun getInitialAlarm(promise: Promise) {
        val id = AlarmState.pendingAlarmId
        AlarmState.pendingAlarmId = null
        promise.resolve(id)
    }

    // NativeEventEmitter compatibility — no-op on Android (matches AppMonitorModule pattern).
    @ReactMethod
    fun addListener(eventName: String) { /* no-op */ }

    @ReactMethod
    fun removeListeners(count: Int) { /* no-op */ }

    override fun invalidate() {
        AlarmState.emitter = null
        super.invalidate()
    }

    private fun sendEvent(name: String, params: WritableMap) {
        reactContext
            .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
            .emit(name, params)
    }
}
