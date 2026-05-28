package com.fitcounter.alarm

import java.util.Calendar

/**
 * Computes the next time an alarm should fire from a repeat token:
 *   "once"        -> fires once, never re-armed
 *   "daily"       -> every day at the same time
 *   "days:0,2,4"  -> selected weekdays (0=Sun … 6=Sat)
 */
object AlarmRepeat {

    /** Next occurrence strictly after [after], or null if the alarm should not re-arm. */
    fun next(base: Long, repeat: String, after: Long): Long? {
        return when {
            repeat == "daily" -> {
                var t = base
                while (t <= after) t += AlarmConstants.DAY_MILLIS
                t
            }
            repeat.startsWith("days:") -> {
                val days = repeat.removePrefix("days:")
                    .split(',')
                    .mapNotNull { it.trim().toIntOrNull() }
                    .toSet()
                if (days.isEmpty()) return null
                var t = base
                // scan up to two weeks of candidates
                repeat(15) {
                    if (t > after && weekday(t) in days) return t
                    t += AlarmConstants.DAY_MILLIS
                }
                null
            }
            else -> { // "once"
                if (base > after) base else null
            }
        }
    }

    /** 0=Sunday … 6=Saturday */
    private fun weekday(millis: Long): Int {
        val cal = Calendar.getInstance().apply { timeInMillis = millis }
        return cal.get(Calendar.DAY_OF_WEEK) - 1
    }
}
