package com.fitcounter.alarm

import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.os.Build

/** Fires at the scheduled time: starts the ringing service and re-arms per the repeat rule. */
class AlarmReceiver : BroadcastReceiver() {
    override fun onReceive(context: Context, intent: Intent) {
        val id = intent.getStringExtra(AlarmConstants.EXTRA_ALARM_ID) ?: return
        val label = intent.getStringExtra(AlarmConstants.EXTRA_LABEL) ?: "Alarm"
        val triggerAt = intent.getLongExtra(AlarmConstants.EXTRA_TRIGGER_AT, 0L)
        val repeat = intent.getStringExtra(AlarmConstants.EXTRA_REPEAT) ?: "once"

        val serviceIntent = Intent(context, AlarmService::class.java).apply {
            putExtra(AlarmConstants.EXTRA_ALARM_ID, id)
            putExtra(AlarmConstants.EXTRA_LABEL, label)
        }
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            context.startForegroundService(serviceIntent)
        } else {
            context.startService(serviceIntent)
        }

        // Re-arm the next occurrence (daily / weekly). 'once' returns null and stops here.
        val next = AlarmRepeat.next(triggerAt, repeat, System.currentTimeMillis())
        if (next != null) {
            AlarmScheduler.schedule(context, id, next, label, repeat)
        } else {
            AlarmStorage.remove(context, id)
        }
    }
}
