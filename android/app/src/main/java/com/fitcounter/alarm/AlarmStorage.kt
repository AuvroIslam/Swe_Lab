package com.fitcounter.alarm

import android.content.Context
import org.json.JSONArray
import org.json.JSONObject

data class AlarmEntry(val id: String, val triggerAt: Long, val label: String, val repeat: String)

/** Persists scheduled alarms in SharedPreferences so they can be re-armed after a reboot. */
object AlarmStorage {
    private const val PREFS = "fitalarmly_alarms"
    private const val KEY = "alarms"

    private fun prefs(context: Context) =
        context.getSharedPreferences(PREFS, Context.MODE_PRIVATE)

    fun save(context: Context, entry: AlarmEntry) {
        val all = all(context).filter { it.id != entry.id } + entry
        write(context, all)
    }

    fun remove(context: Context, id: String) {
        write(context, all(context).filter { it.id != id })
    }

    fun all(context: Context): List<AlarmEntry> {
        val raw = prefs(context).getString(KEY, null) ?: return emptyList()
        return runCatching {
            val arr = JSONArray(raw)
            (0 until arr.length()).map { i ->
                val o = arr.getJSONObject(i)
                AlarmEntry(
                    o.getString("id"),
                    o.getLong("triggerAt"),
                    o.optString("label", "Alarm"),
                    o.optString("repeat", "once"),
                )
            }
        }.getOrDefault(emptyList())
    }

    private fun write(context: Context, entries: List<AlarmEntry>) {
        val arr = JSONArray()
        entries.forEach { e ->
            arr.put(JSONObject().apply {
                put("id", e.id)
                put("triggerAt", e.triggerAt)
                put("label", e.label)
                put("repeat", e.repeat)
            })
        }
        prefs(context).edit().putString(KEY, arr.toString()).apply()
    }
}
