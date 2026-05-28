package com.fitcounter.alarm

import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent

/** After a reboot, re-arm every persisted alarm at its next valid occurrence. */
class BootReceiver : BroadcastReceiver() {
    override fun onReceive(context: Context, intent: Intent) {
        if (intent.action != Intent.ACTION_BOOT_COMPLETED &&
            intent.action != "android.intent.action.QUICKBOOT_POWERON"
        ) return

        val now = System.currentTimeMillis()
        AlarmStorage.all(context).forEach { entry ->
            val next = AlarmRepeat.next(entry.triggerAt, entry.repeat, now)
            if (next != null) {
                AlarmScheduler.schedule(context, entry.id, next, entry.label, entry.repeat)
            } else {
                AlarmStorage.remove(context, entry.id)
            }
        }
    }
}
