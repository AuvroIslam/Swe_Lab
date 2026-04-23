# FitCounter: Current App Behavior and Features

## Overview
FitCounter is an Android fitness discipline app that combines:

- Real-time exercise rep tracking (camera + pose detection)
- Focus sessions with restricted app monitoring
- Penalty-based accountability when focus rules are broken
- Debt payoff workflow through physical exercise
- Firebase authentication (email/password + Google)

The app is designed to discourage distraction and enforce fitness-based consequences.

## Core User Flow

1. User signs in.
2. User starts a focus session and selects restricted apps.
3. If the user tries to open a restricted app during session:
   - FitCounter immediately returns to foreground.
   - User gets a confirmation prompt:
     - Stay Focused
     - Proceed
4. If user taps Proceed:
   - One penalty set is added.
   - User is sent to the restricted app.
5. User later clears debt by completing required reps in punishment mode.

## Main Feature Modules

## 1) Authentication

- Firebase Auth integration on Android
- Email/password sign-in and sign-up
- Google sign-in support
- Auth-gated navigation (authenticated users enter app; unauthenticated users see auth screen)
- Logout support

## 2) Exercise Tracking

- Supported exercises:
  - Push-up
  - Sit-up
  - Squat
- Camera-based pose detection using native Android plugin
- Real-time form feedback and phase detection
- Rep counting and session summary screens

## 3) Focus Mode

- User configures:
  - Session duration
  - Restricted apps
  - Penalty exercise and reps
- Session states include idle, active, warning, and completed
- Violation history and current session statistics

## 4) Soft Control Exercise Penalty (Current Behavior)

### Monitoring

- AccessibilityService is used for real-time foreground app detection (preferred)
- UsageStats-based foreground service runs as fallback polling
- Monitoring is active only during an active session

### Restricted App Intercept

- On restricted app attempt:
  - App returns to FitCounter foreground
  - User receives confirmation prompt

### Confirm-to-Penalize Flow

- If user chooses Stay Focused:
  - No penalty is applied
- If user chooses Proceed:
  - One penalty set is added to debt
  - One soft-control pushup penalty counter increment is recorded
  - Restricted app is launched

### Anti-spam and Stability Controls

- Cooldown prevents repeated trigger spam within a short interval
- Temporary allow window prevents immediate re-interception right after proceeding

## 5) Debt and Punishment System

- Debt is tracked as pending sets
- Debt payment screen calculates total required reps (sets x reps per set)
- Punish exercise mode uses camera tracking to verify completion
- Completing punishment reduces pending debt

## 6) Permission Handling

- Usage Access permission flow
- Accessibility Service enable flow
- Notification permission request (Android 13+)
- Graceful fallback behavior if only Usage Access is granted

## 7) Native Android Integration

- Native app monitor module exposed to React Native
- Foreground monitoring service for fallback checks
- Accessibility service for event-driven detection
- Foreground return to MainActivity when interception happens

## Current Platform Scope

- Primary supported platform: Android
- Focus monitoring and native pose plugin behavior are implemented around Android runtime capabilities

## Tech Stack Summary

- React Native + TypeScript
- Zustand for state management
- Native Android Kotlin modules/services
- Vision-camera based frame processing
- Firebase Authentication

## Current Experience Summary

The app currently delivers a complete discipline loop:

- Detect distraction
- Force user acknowledgment
- Apply exercise consequence only on confirmed proceed
- Track debt
- Require physical completion to clear debt

This creates a practical "focus + fitness accountability" system rather than a simple hard blocker.
