# FitCounter

FitCounter is a React Native CLI mobile app that turns focus discipline into exercise accountability. It combines real-time pose tracking, rep counting, exercise scoring, and focus-session enforcement so users can practice push-ups, sit-ups, and squats while paying off distraction debt created during blocked-app violations.

The project is built for native performance. Camera frames are processed through `react-native-vision-camera`, native pose-detection plugins, and worklets so exercise feedback can happen while the user moves instead of after a recording ends.

## Core Features

- Real-time camera-based exercise tracking.
- Push-up, sit-up, and squat rep counting.
- Per-rep form, depth, stability, and tempo scoring.
- Exercise summaries after each set.
- Focus sessions with app-blocking violation flow.
- Exercise debt system for missed focus discipline.
- Native Android app-monitoring service.
- React Navigation screen flow for training, focus, warnings, and summaries.

## Tech Stack

| Area | Technology |
| --- | --- |
| Mobile framework | React Native CLI `0.74` |
| Language | TypeScript |
| Camera | `react-native-vision-camera` |
| Frame processing | `react-native-worklets-core` |
| Navigation | `@react-navigation/native-stack` |
| State management | `zustand` |
| Native platforms | Android and iOS project folders |
| Testing | Jest |

## App Flow

FitCounter starts at a performance dashboard. Users can either begin a focus session or practice exercises directly.

For direct training, the user chooses an exercise and performs reps in front of the camera. Pose landmarks are converted into joint angles, smoothed, classified into movement phases, counted as reps, and scored.

For focus mode, the user starts a timer and selects apps to avoid. Opening a blocked app creates exercise debt, which must be paid back through completed exercise sets.

## How Pose Tracking Works

The exercise pipeline is designed as a sequence of small modules:

1. The camera frame is captured through VisionCamera.
2. Native pose detection produces body landmarks.
3. Landmark positions are converted into movement-specific joint angles.
4. Angle smoothing filters out noisy frame-to-frame spikes.
5. A rep state machine detects movement phases.
6. Completed reps are scored and sent to the UI.

This keeps native camera work, movement logic, scoring, and interface state separated. Most exercise logic lives in pure TypeScript modules under `src/core`, which makes the behavior easier to test and tune.

## Project Structure

```text
SystemProject/
├── android/                 # Android native project and app-monitoring service
├── ios/                     # iOS native project
├── src/
│   ├── components/          # Camera, overlays, summaries, and feedback UI
│   ├── core/                # Rep counting, scoring, smoothing, and exercise rules
│   ├── hooks/               # Pose detection, exercise tracking, and permission hooks
│   ├── screens/             # App screens and navigation destinations
│   ├── store/               # Zustand state stores
│   ├── theme/               # Shared colors and visual tokens
│   ├── types/               # Pose and navigation types
│   └── utils/               # Constants and shared helpers
├── app.json
├── package.json
└── tsconfig.json
```

## Prerequisites

Install the standard React Native CLI toolchain before running the project:

- Node.js and npm.
- JDK 17 or a compatible React Native Android JDK.
- Android Studio with Android SDK, platform tools, and an emulator or physical device.
- Xcode and CocoaPods for iOS development on macOS.
- Camera permissions enabled on the test device.

For Android focus monitoring, the app also needs usage access permission because it checks whether blocked apps were opened during a focus session.

## Getting Started

Install dependencies:

```bash
npm install
```

Start Metro:

```bash
npm run start
```

Run on Android:

```bash
npm run android
```

Run on iOS:

```bash
npm run ios
```

If iOS pods are not installed yet, run this first from the `ios` directory:

```bash
pod install
```
