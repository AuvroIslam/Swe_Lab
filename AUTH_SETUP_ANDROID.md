# Android Firebase Auth Setup

This project is already wired in code for:

- Email/password sign-in
- Google sign-in
- Firebase auth state persistence

To make it work on your machine, finish the Firebase console setup below.

## 1. Create or open your Firebase project

Go to the Firebase Console and open the project you want to use for `FitCounter`.

## 2. Add the Android app

Register an Android app in Firebase with this exact package name:

```text
com.fitcounter
```

That must match the Android app configuration in this repo.

## 3. Add the debug SHA-1 fingerprint

Use this SHA-1 for the current local debug keystore:

```text
5E:8F:16:06:2E:A3:CD:2C:4A:0D:54:78:76:BA:A6:F3:8C:AB:F6:25
```

Notes:

- This was generated from `android/app/debug.keystore`.
- If you later change signing keys, add the new SHA-1 values too.
- Google sign-in usually fails with `DEVELOPER_ERROR` if the SHA-1 is missing or wrong.

## 4. Enable Firebase Authentication providers

In Firebase Console:

1. Open `Authentication`
2. Open `Sign-in method`
3. Enable `Email/Password`
4. Enable `Google`

## 5. Download `google-services.json`

Download the Android Firebase config file and place it here:

```text
android/app/google-services.json
```

This repo already ignores that file in Git.

## 6. Copy the Web Client ID

Google sign-in in React Native Firebase needs the Firebase Web Client ID so Google can return an ID token for Firebase auth.

Find the Web Client ID in your Firebase/Google Cloud project, then update:

```text
src/config/auth.ts
```

Replace:

```ts
googleWebClientId: 'REPLACE_WITH_YOUR_FIREBASE_WEB_CLIENT_ID.apps.googleusercontent.com'
```

with your real client ID, for example:

```ts
googleWebClientId: '1234567890-abcdefg123456.apps.googleusercontent.com'
```

## 7. Rebuild the Android app

From the project root:

```powershell
npm run android
```

If Metro is not already running:

```powershell
npm run start
```

## 8. What was added in the code

The codebase now includes:

- Android Firebase Gradle integration in `android/build.gradle` and `android/app/build.gradle`
- An auth gate in `src/App.tsx`
- Email sign-in/sign-up UI in `src/screens/AuthScreen.tsx`
- Google sign-in flow in `src/services/authService.ts`
- Auth state store in `src/store/authStore.ts`
- Google client ID config in `src/config/auth.ts`
- Logout support on the home screen

## 9. Common failure cases

If email/password fails:

- Make sure `Email/Password` is enabled in Firebase Authentication.

If Google sign-in fails:

- Make sure `Google` is enabled in Firebase Authentication.
- Make sure the package name is `com.fitcounter`.
- Make sure the SHA-1 above is added in Firebase.
- Make sure `android/app/google-services.json` is from the same Firebase project.
- Make sure `src/config/auth.ts` contains the real Web Client ID.
- Rebuild the app after changing Firebase configuration.
