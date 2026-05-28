package com.fitcounter.alarm

/** Shared keys / ids for the alarm subsystem. */
object AlarmConstants {
    const val EXTRA_ALARM_ID = "alarm_id"
    const val EXTRA_LABEL = "alarm_label"
    const val EXTRA_TRIGGER_AT = "alarm_trigger_at"
    const val EXTRA_REPEAT = "alarm_repeat"

    const val ACTION_STOP = "com.fitcounter.alarm.ACTION_STOP"

    const val RING_CHANNEL_ID = "alarm_ring"
    const val RING_NOTIFICATION_ID = 2001

    /** One day in millis — alarms repeat daily by re-arming on fire. */
    const val DAY_MILLIS = 24L * 60L * 60L * 1000L
}

/**
 * Bridges a fired alarm to JS. When the app is alive the module's emitter is set and we
 * deliver immediately. On a cold start (alarm launched the app) the module/JS listener is
 * not ready yet, so we stash the id and JS pulls it via AlarmScheduler.getInitialAlarm().
 */
object AlarmState {
    @Volatile var pendingAlarmId: String? = null
    @Volatile var emitter: ((String) -> Unit)? = null

    fun dispatch(alarmId: String) {
        pendingAlarmId = alarmId
        emitter?.invoke(alarmId)
    }
}
