import React, { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { C, SHADOW } from '../theme/atelier';
import { isGoogleAuthConfigured } from '../config/auth';
import {
  signInWithEmail,
  signInWithGoogle,
  signUpWithEmail,
  toAuthErrorMessage,
} from '../services/authService';

type AuthMode = 'signin' | 'signup';

export function AuthScreen() {
  const [mode, setMode] = useState<AuthMode>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const isSignup = mode === 'signup';
  const googleReady = useMemo(() => isGoogleAuthConfigured(), []);

  async function handleEmailAuth() {
    setError(null);

    if (!email.trim() || !password) {
      setError('Email and password are required.');
      return;
    }

    if (isSignup) {
      if (password.length < 6) {
        setError('Password should be at least 6 characters.');
        return;
      }

      if (password !== confirmPassword) {
        setError('Passwords do not match.');
        return;
      }
    }

    setIsLoading(true);

    try {
      if (isSignup) {
        await signUpWithEmail(email, password);
      } else {
        await signInWithEmail(email, password);
      }
    } catch (authError) {
      setError(toAuthErrorMessage(authError));
    } finally {
      setIsLoading(false);
    }
  }

  async function handleGoogleAuth() {
    setError(null);
    setIsLoading(true);

    try {
      await signInWithGoogle();
    } catch (authError) {
      setError(toAuthErrorMessage(authError));
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <SafeAreaView style={s.safe}>
      <KeyboardAvoidingView
        style={s.flex}
        behavior={Platform.OS === 'android' ? undefined : 'padding'}>
        <ScrollView
          contentContainerStyle={s.scroll}
          keyboardShouldPersistTaps="handled">
          <Text style={s.label}>AUTHENTICATION</Text>
          <Text style={s.headline}>
            {isSignup ? 'Create your account' : 'Welcome back'}
          </Text>
          <Text style={s.subhead}>
            Sign in to use focus tracking, rep counting, and your personal training flow.
          </Text>

          <View style={s.switchRow}>
            <TouchableOpacity
              style={[s.switchBtn, !isSignup && s.switchBtnActive]}
              onPress={() => {
                setMode('signin');
                setError(null);
              }}
              activeOpacity={0.85}>
              <Text style={[s.switchText, !isSignup && s.switchTextActive]}>
                SIGN IN
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[s.switchBtn, isSignup && s.switchBtnActive]}
              onPress={() => {
                setMode('signup');
                setError(null);
              }}
              activeOpacity={0.85}>
              <Text style={[s.switchText, isSignup && s.switchTextActive]}>
                SIGN UP
              </Text>
            </TouchableOpacity>
          </View>

          <View style={s.card}>
            <Text style={s.inputLabel}>EMAIL</Text>
            <TextInput
              style={s.input}
              placeholder="you@example.com"
              placeholderTextColor={C.outline}
              autoCapitalize="none"
              keyboardType="email-address"
              value={email}
              onChangeText={setEmail}
              editable={!isLoading}
            />

            <Text style={s.inputLabel}>PASSWORD</Text>
            <TextInput
              style={s.input}
              placeholder="Minimum 6 characters"
              placeholderTextColor={C.outline}
              secureTextEntry
              value={password}
              onChangeText={setPassword}
              editable={!isLoading}
            />

            {isSignup && (
              <>
                <Text style={s.inputLabel}>CONFIRM PASSWORD</Text>
                <TextInput
                  style={s.input}
                  placeholder="Re-enter password"
                  placeholderTextColor={C.outline}
                  secureTextEntry
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  editable={!isLoading}
                />
              </>
            )}

            {error && (
              <View style={s.errorBox}>
                <Text style={s.errorText}>{error}</Text>
              </View>
            )}

            <TouchableOpacity
              style={[s.primaryBtn, isLoading && s.btnDisabled]}
              onPress={handleEmailAuth}
              disabled={isLoading}
              activeOpacity={0.85}>
              {isLoading ? (
                <ActivityIndicator color={C.onPrimary} />
              ) : (
                <Text style={s.primaryBtnText}>
                  {isSignup ? 'CREATE ACCOUNT' : 'SIGN IN WITH EMAIL'}
                </Text>
              )}
            </TouchableOpacity>

            <View style={s.dividerRow}>
              <View style={s.divider} />
              <Text style={s.dividerText}>OR</Text>
              <View style={s.divider} />
            </View>

            <TouchableOpacity
              style={[
                s.googleBtn,
                (!googleReady || isLoading) && s.btnDisabled,
              ]}
              onPress={handleGoogleAuth}
              disabled={!googleReady || isLoading}
              activeOpacity={0.85}>
              <Text style={s.googleBtnText}>
                {googleReady
                  ? 'CONTINUE WITH GOOGLE'
                  : 'ADD WEB CLIENT ID TO ENABLE GOOGLE'}
              </Text>
            </TouchableOpacity>

            {!googleReady && (
              <Text style={s.helperText}>
                Update `src/config/auth.ts` after creating your Firebase project.
              </Text>
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  flex: { flex: 1 },
  safe: { flex: 1, backgroundColor: C.surface },
  scroll: {
    padding: 24,
    paddingTop: 48,
    paddingBottom: 72,
  },
  label: {
    color: C.secondary,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 2.5,
    marginBottom: 8,
  },
  headline: {
    color: C.primaryContainer,
    fontSize: 32,
    fontWeight: '800',
    lineHeight: 38,
  },
  subhead: {
    color: C.onSurfaceVariant,
    fontSize: 14,
    lineHeight: 21,
    marginTop: 10,
    marginBottom: 28,
  },
  switchRow: {
    flexDirection: 'row',
    backgroundColor: C.surfaceContainerLow,
    borderRadius: 16,
    padding: 6,
    marginBottom: 18,
  },
  switchBtn: {
    flex: 1,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  switchBtnActive: {
    backgroundColor: C.primaryContainer,
  },
  switchText: {
    color: C.onSurfaceVariant,
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1.4,
  },
  switchTextActive: {
    color: C.onPrimary,
  },
  card: {
    backgroundColor: C.surfaceContainerLowest,
    borderRadius: 20,
    padding: 20,
    ...SHADOW.card,
  },
  inputLabel: {
    color: C.onSurfaceVariant,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1.8,
    marginBottom: 8,
    marginTop: 14,
  },
  input: {
    backgroundColor: C.surfaceContainerLow,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: C.outlineVariant,
    color: C.onSurface,
    fontSize: 15,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  errorBox: {
    backgroundColor: C.errorContainer,
    borderRadius: 12,
    padding: 14,
    marginTop: 16,
  },
  errorText: {
    color: C.onErrorContainer,
    fontSize: 13,
    lineHeight: 19,
  },
  primaryBtn: {
    backgroundColor: C.primaryContainer,
    borderRadius: 14,
    paddingVertical: 17,
    alignItems: 'center',
    marginTop: 20,
    ...SHADOW.button,
    shadowColor: C.primaryContainer,
  },
  primaryBtnText: {
    color: C.onPrimary,
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 1.2,
  },
  googleBtn: {
    backgroundColor: C.surfaceContainerLow,
    borderRadius: 14,
    paddingVertical: 17,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: C.outlineVariant,
  },
  googleBtnText: {
    color: C.primaryContainer,
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 1.1,
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginVertical: 18,
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: C.outlineVariant,
  },
  dividerText: {
    color: C.onSurfaceVariant,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.4,
  },
  helperText: {
    color: C.onSurfaceVariant,
    fontSize: 12,
    lineHeight: 18,
    marginTop: 12,
    textAlign: 'center',
  },
  btnDisabled: {
    opacity: 0.6,
  },
});
