package com.fitcounter.appmonitor

import android.app.Notification
import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.Service
import android.content.Intent
import android.os.Build
import android.os.Handler
import android.os.IBinder
import android.os.Looper
import androidx.core.app.NotificationCompat

class AppMonitorService : Service() {

    companion object {
        const val CHANNEL_ID = "focus_monitor"
        const val NOTIFICATION_ID = 1001
        var isRunning = false
    }

    private val handler = Handler(Looper.getMainLooper())

    private val checkRunnable = object : Runnable {
        override fun run() {
            checkForegroundApp()
            handler.postDelayed(this, 1000)
        }
    }

    override fun onCreate() {
        super.onCreate()
        createNotificationChannel()
    }

    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        val notification = buildNotification()
        startForeground(NOTIFICATION_ID, notification)

        isRunning = true
        handler.removeCallbacks(checkRunnable)
        handler.post(checkRunnable)

        return START_STICKY
    }

    override fun onDestroy() {
        isRunning = false
        handler.removeCallbacks(checkRunnable)
        super.onDestroy()
    }

    override fun onBind(intent: Intent?): IBinder? = null

    private fun checkForegroundApp() {
        if (!AppMonitorCoordinator.isSessionActive()) return
        val foregroundPackage = AppForegroundUtils.getForegroundPackageFromUsageStats(this)
        AppMonitorCoordinator.handleForegroundPackage(this, foregroundPackage)
    }

    private fun createNotificationChannel() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val channel = NotificationChannel(
                CHANNEL_ID,
                "Focus Monitor",
                NotificationManager.IMPORTANCE_LOW
            ).apply {
                description = "Monitors app usage during focus sessions"
                setShowBadge(false)
            }
            val nm = getSystemService(NotificationManager::class.java)
            nm.createNotificationChannel(channel)
        }
    }

    private fun buildNotification(): Notification {
        return NotificationCompat.Builder(this, CHANNEL_ID)
            .setContentTitle("Focus Mode Active")
            .setContentText("Monitoring for blocked apps...")
            .setSmallIcon(android.R.drawable.ic_lock_idle_alarm)
            .setOngoing(true)
            .setPriority(NotificationCompat.PRIORITY_LOW)
            .build()
    }
}
