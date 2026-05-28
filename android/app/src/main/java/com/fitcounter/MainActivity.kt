package com.fitcounter

import android.content.Intent
import android.os.Build
import android.os.Bundle
import com.facebook.react.ReactActivity
import com.facebook.react.ReactActivityDelegate
import com.facebook.react.defaults.DefaultNewArchitectureEntryPoint.fabricEnabled
import com.facebook.react.defaults.DefaultReactActivityDelegate
import com.fitcounter.alarm.AlarmConstants
import com.fitcounter.alarm.AlarmState

class MainActivity : ReactActivity() {

  override fun getMainComponentName(): String = "FitAlarmly"

  override fun createReactActivityDelegate(): ReactActivityDelegate =
      DefaultReactActivityDelegate(this, mainComponentName, fabricEnabled)

  override fun onCreate(savedInstanceState: Bundle?) {
    super.onCreate(savedInstanceState)
    handleAlarmIntent(intent)
  }

  override fun onNewIntent(intent: Intent) {
    super.onNewIntent(intent)
    setIntent(intent)
    handleAlarmIntent(intent)
  }

  /**
   * If launched (or brought to front) by an alarm, show the activity over the lock screen
   * and stash the alarm id so JS can route to the ring screen.
   */
  private fun handleAlarmIntent(intent: Intent?) {
    val alarmId = intent?.getStringExtra(AlarmConstants.EXTRA_ALARM_ID) ?: return

    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O_MR1) {
      setShowWhenLocked(true)
      setTurnScreenOn(true)
    } else {
      @Suppress("DEPRECATION")
      window.addFlags(
        android.view.WindowManager.LayoutParams.FLAG_SHOW_WHEN_LOCKED or
          android.view.WindowManager.LayoutParams.FLAG_TURN_SCREEN_ON or
          android.view.WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON
      )
    }

    AlarmState.dispatch(alarmId)
  }
}
