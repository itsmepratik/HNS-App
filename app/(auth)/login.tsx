import AuthSocialButtons from '@/components/AuthSocialButtons';
import BiometricAuthModal from '@/components/BiometricAuthModal';
import { useCustomAlert } from '@/components/CustomAlertContext';
import Colors from '@/constants/colors';
import { useWarmUpBrowser } from '@/hooks/useWarmUpBrowser';
import { useOAuth, useSignIn } from '@clerk/clerk-expo';
import { useLocalCredentials } from '@clerk/clerk-expo/local-credentials';
import * as Linking from 'expo-linking';
import * as LocalAuthentication from 'expo-local-authentication';
import { useRouter } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import { StatusBar } from 'expo-status-bar';
import * as WebBrowser from 'expo-web-browser';
import { ArrowLeft, Eye, EyeOff, Fingerprint, Lock, Mail, ScanFace, ShieldCheck } from 'lucide-react-native';
import React, { useCallback, useEffect, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

WebBrowser.maybeCompleteAuthSession();

const TEMP_PASSWORD_KEY = 'biometric_temp_pass';
const TEMP_EMAIL_KEY = 'biometric_temp_email';

export default function LoginScreen() {
  useWarmUpBrowser();
  const router = useRouter();
  const { signIn, setActive, isLoaded } = useSignIn();
  const { startOAuthFlow: startGoogleOAuthFlow } = useOAuth({ strategy: 'oauth_google' });
  const { startOAuthFlow: startAppleOAuthFlow } = useOAuth({ strategy: 'oauth_apple' });
  const { showAlert } = useCustomAlert();
  
  // Biometric authentication from Clerk
  const { 
    hasCredentials, 
    biometricType: clerkBiometricType, 
    authenticate, 
    setCredentials 
  } = useLocalCredentials();

  // Direct biometric check using expo-local-authentication
  const [deviceBiometricType, setDeviceBiometricType] = useState<'face-recognition' | 'fingerprint' | null>(null);
  const [isBiometricAvailable, setIsBiometricAvailable] = useState(false);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  // 2FA states
  const [needs2FA, setNeeds2FA] = useState(false);
  const [twoFactorCode, setTwoFactorCode] = useState('');
  
  // Biometric modal states
  const [showBiometricModal, setShowBiometricModal] = useState(false);
  const [biometricStatus, setBiometricStatus] = useState<'idle' | 'authenticating' | 'success' | 'error'>('idle');
  const [biometricError, setBiometricError] = useState<string>('');
  


  // Check for biometric availability on mount
  useEffect(() => {
    const checkBiometricAvailability = async () => {
      try {
        const hasHardware = await LocalAuthentication.hasHardwareAsync();
        const isEnrolled = await LocalAuthentication.isEnrolledAsync();
        const supportedTypes = await LocalAuthentication.supportedAuthenticationTypesAsync();
        
        console.log('Biometric check:', { hasHardware, isEnrolled, supportedTypes, clerkBiometricType, hasCredentials });
        
        if (hasHardware && isEnrolled) {
          setIsBiometricAvailable(true);
          // Determine biometric type
          if (supportedTypes.includes(LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION)) {
            setDeviceBiometricType('face-recognition');
          } else if (supportedTypes.includes(LocalAuthentication.AuthenticationType.FINGERPRINT)) {
            setDeviceBiometricType('fingerprint');
          }
        }
      } catch (error) {
        console.error('Error checking biometric availability:', error);
      }
    };

    checkBiometricAvailability();
  }, [clerkBiometricType, hasCredentials]);

  // Use Clerk's biometric type if available, otherwise use device detection
  const effectiveBiometricType = clerkBiometricType || deviceBiometricType;

  const handleLoginSuccess = async (createdSessionId: string | null) => {
    if (createdSessionId && setActive) {
      await setActive({ session: createdSessionId });
    }
    
    // Store temp credentials for biometric prompt in drawer layout
    try {
      await SecureStore.setItemAsync(TEMP_PASSWORD_KEY, password);
      await SecureStore.setItemAsync(TEMP_EMAIL_KEY, email.trim());
      console.log('Stored temp credentials for biometric prompt');
    } catch (err) {
      console.error('Failed to store temp credentials:', err);
    }
    
    router.replace('/(drawer)/(tabs)');
  };

  const handleLogin = async () => {
    if (!isLoaded || isLoading) return;
    
    if (!signIn) {
      showAlert('Error', 'Sign in not available. Please try again.', 'error');
      return;
    }
    
    if (!email.trim() || !password.trim()) {
      showAlert('Error', 'Please enter both email and password.', 'error');
      return;
    }
    
    setIsLoading(true);

    try {
      const signInAttempt = await signIn.create({
        identifier: email.trim(),
        password,
      });

      if (signInAttempt.status === 'complete') {
        await handleLoginSuccess(signInAttempt.createdSessionId);
      } else if (signInAttempt.status === 'needs_second_factor') {
        setNeeds2FA(true);
      } else {
        console.error('Sign in not complete:', JSON.stringify(signInAttempt, null, 2));
        showAlert('Error', 'Log in could not be completed. Please check your credentials.', 'error');
      }
    } catch (err: any) {
      console.error('Login error:', JSON.stringify(err, null, 2));
      const errorMessage = err.errors?.[0]?.longMessage || err.errors?.[0]?.message || 'An error occurred during sign in';
      showAlert('Error', errorMessage, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handle2FAVerification = async () => {
    if (!isLoaded || isLoading || !signIn) return;
    
    if (!twoFactorCode.trim()) {
      showAlert('Error', 'Please enter the verification code.', 'error');
      return;
    }
    
    setIsLoading(true);

    try {
      const signInAttempt = await signIn.attemptSecondFactor({
        strategy: 'email_code',
        code: twoFactorCode.trim(),
      });

      if (signInAttempt.status === 'complete') {
        await handleLoginSuccess(signInAttempt.createdSessionId);
      } else {
        console.error('2FA not complete:', JSON.stringify(signInAttempt, null, 2));
        showAlert('Error', 'Verification failed. Please check the code and try again.', 'error');
      }
    } catch (err: any) {
      console.error('2FA error:', JSON.stringify(err, null, 2));
      const errorMessage = err.errors?.[0]?.longMessage || err.errors?.[0]?.message || 'Invalid verification code';
      showAlert('Error', errorMessage, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend2FACode = async () => {
    if (!signIn) return;
    
    try {
      await signIn.prepareSecondFactor({
        strategy: 'email_code',
      });
      showAlert('Success', 'A new verification code has been sent to your email.', 'success');
    } catch (err: any) {
      console.error('Resend 2FA error:', err);
      showAlert('Error', 'Could not resend code. Please try again.', 'error');
    }
  };

  const handleBiometricLogin = async () => {
    if (!hasCredentials || !effectiveBiometricType) return;
    
    setShowBiometricModal(true);
    setBiometricStatus('authenticating');
    setBiometricError('');

    try {
      const signInAttempt = await authenticate();
      
      if (signInAttempt.status === 'complete') {
        setBiometricStatus('success');
        if (setActive) {
          await setActive({ session: signInAttempt.createdSessionId });
        }
        
        // Short delay to show success state
        setTimeout(() => {
          setShowBiometricModal(false);
          router.replace('/(drawer)/(tabs)');
        }, 500);
      } else {
        setBiometricStatus('error');
        setBiometricError('Authentication could not be completed.');
      }
    } catch (err: any) {
      console.error('Biometric auth error:', err);
      setBiometricStatus('error');
      setBiometricError(
        effectiveBiometricType === 'face-recognition'
          ? 'Face ID does not match. Please try again or log in using your password.'
          : 'Your fingerprint does not match. Please try again or log in using your password.'
      );
    }
  };

  const handleRetryBiometric = async () => {
    setBiometricStatus('authenticating');
    setBiometricError('');
    
    try {
      const signInAttempt = await authenticate();
      
      if (signInAttempt.status === 'complete') {
        setBiometricStatus('success');
        if (setActive) {
          await setActive({ session: signInAttempt.createdSessionId });
        }
        
        setTimeout(() => {
          setShowBiometricModal(false);
          router.replace('/(drawer)/(tabs)');
        }, 500);
      } else {
        setBiometricStatus('error');
        setBiometricError('Authentication could not be completed.');
      }
    } catch (err: any) {
      setBiometricStatus('error');
      setBiometricError(
        effectiveBiometricType === 'face-recognition'
          ? 'Face ID does not match. Please try again or log in using your password.'
          : 'Your fingerprint does not match. Please try again or log in using your password.'
      );
    }
  };



  const onSelectAuth = useCallback(async (strategy: 'oauth_google' | 'oauth_apple') => {
    if (!isLoaded) return;

    try {
      const startOAuthFlow = strategy === 'oauth_google' ? startGoogleOAuthFlow : startAppleOAuthFlow;
      
      const { createdSessionId, setActive: setOAuthActive } = await startOAuthFlow({
        redirectUrl: Linking.createURL('/'),
      });

      if (createdSessionId) {
        if (setOAuthActive) {
            await setOAuthActive({ session: createdSessionId });
        }
        router.replace('/(drawer)/(tabs)');
      }
    } catch (err) {
      console.error('OAuth error', err);
    }
  }, [isLoaded, startGoogleOAuthFlow, startAppleOAuthFlow, router]);

  const BiometricIcon = effectiveBiometricType === 'face-recognition' ? ScanFace : Fingerprint;

  // 2FA Verification Screen
  if (needs2FA) {
    return (
      <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
        <StatusBar style="light" />
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardView}
        >
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {/* Header */}
            <View style={styles.header}>
              <Pressable
                style={styles.backButton}
                onPress={() => {
                  setNeeds2FA(false);
                  setTwoFactorCode('');
                }}
              >
                <ArrowLeft size={24} color={Colors.dark.text} />
              </Pressable>
            </View>

            {/* Title Section */}
            <View style={styles.titleSection}>
              <View style={styles.twoFactorIcon}>
                <ShieldCheck size={48} color={Colors.dark.primary} />
              </View>
              <Text style={styles.title}>Two-Factor Authentication</Text>
              <Text style={styles.subtitle}>
                A verification code has been sent to your email address. Enter it below to continue.
              </Text>
            </View>

            {/* 2FA Form */}
            <View style={styles.form}>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Verification Code</Text>
                <View style={styles.inputContainer}>
                  <ShieldCheck size={20} color={Colors.dark.textSecondary} />
                  <TextInput
                    style={styles.input}
                    placeholder="Enter 6-digit code"
                    placeholderTextColor={Colors.dark.textSecondary}
                    value={twoFactorCode}
                    onChangeText={setTwoFactorCode}
                    keyboardType="number-pad"
                    maxLength={6}
                    autoFocus
                  />
                </View>
              </View>

              <Pressable
                style={({ pressed }) => [
                  styles.verifyButton,
                  pressed && { opacity: 0.9 },
                  isLoading && { opacity: 0.7 },
                ]}
                onPress={handle2FAVerification}
                disabled={isLoading}
              >
                <Text style={styles.loginButtonText}>
                  {isLoading ? 'Verifying...' : 'Verify'}
                </Text>
              </Pressable>

              <Pressable 
                style={styles.resendButton}
                onPress={handleResend2FACode}
              >
                <Text style={styles.resendButtonText}>Resend Code</Text>
              </Pressable>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <StatusBar style="light" />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={styles.header}>
            <Pressable
              style={styles.backButton}
              onPress={() => router.back()}
            >
              <ArrowLeft size={24} color={Colors.dark.text} />
            </Pressable>
          </View>

          {/* Title Section */}
          <View style={styles.titleSection}>
            <Text style={styles.title}>Welcome Back</Text>
            <Text style={styles.subtitle}>
              Log in to continue to your account
            </Text>
          </View>

          {/* Form */}
          <View style={styles.form}>
            {/* Email Input */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Email</Text>
              <View style={styles.inputContainer}>
                <Mail size={20} color={Colors.dark.textSecondary} />
                <TextInput
                  style={styles.input}
                  placeholder="Enter your email"
                  placeholderTextColor={Colors.dark.textSecondary}
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoComplete="email"
                />
              </View>
            </View>

            {/* Password Input */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Password</Text>
              <View style={styles.inputContainer}>
                <Lock size={20} color={Colors.dark.textSecondary} />
                <TextInput
                  style={styles.input}
                  placeholder="Enter your password"
                  placeholderTextColor={Colors.dark.textSecondary}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                  autoComplete="password"
                />
                <Pressable onPress={() => setShowPassword(!showPassword)}>
                  {showPassword ? (
                    <EyeOff size={20} color={Colors.dark.textSecondary} />
                  ) : (
                    <Eye size={20} color={Colors.dark.textSecondary} />
                  )}
                </Pressable>
              </View>
            </View>

            <Pressable 
              style={styles.forgotPassword} 
              onPress={() => router.push('/(auth)/forgot-password')}
            >
              <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
            </Pressable>

            {/* Login Button with Biometric */}
            <View style={styles.loginRow}>
              <Pressable
                style={({ pressed }) => [
                  styles.loginButton,
                  hasCredentials && effectiveBiometricType && styles.loginButtonWithBiometric,
                  pressed && { opacity: 0.9 },
                  isLoading && { opacity: 0.7 },
                ]}
                onPress={handleLogin}
                disabled={isLoading}
              >
                <Text style={styles.loginButtonText}>
                  {isLoading ? 'Logging in...' : 'Log In'}
                </Text>
              </Pressable>

              {/* Biometric Button - only show if user has stored credentials */}
              {hasCredentials && effectiveBiometricType && (
                <Pressable
                  style={({ pressed }) => [
                    styles.biometricButton,
                    pressed && { opacity: 0.8, transform: [{ scale: 0.97 }] },
                  ]}
                  onPress={handleBiometricLogin}
                >
                  <BiometricIcon size={28} color={Colors.dark.primary} strokeWidth={1.5} />
                </Pressable>
              )}
            </View>

            {/* Social Login */}
            <AuthSocialButtons 
                onGooglePress={() => onSelectAuth('oauth_google')}
                onApplePress={() => onSelectAuth('oauth_apple')}
            />

            {/* Sign Up Link */}
            <View style={styles.signupContainer}>
              <Text style={styles.signupText}>Don't have an account? </Text>
              <Pressable onPress={() => router.push('/(auth)/signup')}>
                <Text style={styles.signupLink}>Sign Up</Text>
              </Pressable>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Biometric Auth Modal */}
      <BiometricAuthModal
        visible={showBiometricModal}
        onClose={() => {
          setShowBiometricModal(false);
          setBiometricStatus('idle');
        }}
        onAuthenticate={handleRetryBiometric}
        biometricType={effectiveBiometricType}
        status={biometricStatus}
        errorMessage={biometricError}
      />


    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.dark.background,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
  },
  header: {
    paddingTop: 10,
    marginBottom: 20,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.dark.card,
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleSection: {
    marginBottom: 40,
  },
  twoFactorIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(124, 179, 66, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: Colors.dark.text,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.dark.textSecondary,
    lineHeight: 24,
  },
  form: {
    flex: 1,
  },
  inputGroup: {
    marginBottom: 24,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.dark.text,
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.dark.card,
    borderRadius: 16,
    paddingHorizontal: 16,
    height: 56,
    borderWidth: 1,
    borderColor: Colors.dark.border,
    gap: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: Colors.dark.text,
  },
  forgotPassword: {
    alignSelf: 'flex-end',
    marginBottom: 24,
  },
  forgotPasswordText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.dark.primary,
  },
  loginRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 24,
  },
  loginButton: {
    flex: 1,
    backgroundColor: Colors.dark.primary,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loginButtonWithBiometric: {
    flex: 1,
  },
  verifyButton: {
    backgroundColor: Colors.dark.primary,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  loginButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.dark.primaryForeground,
  },
  biometricButton: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: Colors.dark.card,
    borderWidth: 1,
    borderColor: Colors.dark.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  resendButton: {
    alignItems: 'center',
    marginTop: 16,
  },
  resendButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.dark.primary,
  },
  signupContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  signupText: {
    fontSize: 14,
    color: Colors.dark.textSecondary,
  },
  signupLink: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.dark.primary,
  },
});
