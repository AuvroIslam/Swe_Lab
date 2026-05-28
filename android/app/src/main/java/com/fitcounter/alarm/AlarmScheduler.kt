package com.fitcounter.alarm

import android.app.AlarmManager
import android.app.PendingIntent
import android.content.Context
import android.content.Intent

/** Wraps AlarmManager so the module, AlarmReceiver, and BootReceiver share one path. */
object AlarmScheduler {

    fun schedule(context: Context, id: String, triggerAt: Long, label: String, repeat: String) {
        val am = context.getSystemService(Context.ALARM_SERVICE) as AlarmManager
        val operation = buildOperation(context, id, label, triggerAt, repeat)
        val show = buildShowIntent(context, id)

        // setAlarmClock is the right API for an alarm app: exempt from the Android 12+
        // exact-alarm permission gate and shows in the system status bar.
        am.setAlarmClock(AlarmManager.AlarmClockInfo(triggerAt, show), operation)
        AlarmStorage.save(context, AlarmEntry(id, triggerAt, label, repeat))
    }

    fun cancel(context: Context, id: String) {
        val am = context.getSystemService(Context.ALARM_SERVICE) as AlarmManager
        am.cancel(buildOperation(context, id, "", 0L, "once"))
        AlarmStorage.remove(context, id)
    }

    private fun buildOperation(
        context: Context, id: String, label: String, triggerAt: Long, repeat: String,
    ): PendingIntent {
        val intent = Intent(context, AlarmReceiver::class.java).apply {
            putExtra(AlarmConstants.EXTRA_ALARM_ID, id)
            putExtra(AlarmConstants.EXTRA_LABEL, label)
            putExtra(AlarmConstants.EXTRA_TRIGGER_AT, triggerAt)
            putExtra(AlarmConstants.EXTRA_REPEAT, repeat)
        }
        return PendingIntent.getBroadcast(
            context,
            id.hashCode(),
            intent,
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE,
        )
    }

    private fun buildShowIntent(context: Context, id: String): PendingIntent {
        val intent = Intent(context, com.fitcounter.MainActivity::class.java).apply {
            putExtra(AlarmConstants.EXTRA_ALARM_ID, id)
            flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_SINGLE_TOP
        }
        return PendingIntent.getActivity(
            context,
            id.hashCode() + 1,
            intent,
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE,
        )
    }
}
