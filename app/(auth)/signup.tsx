import AuthSocialButtons from '@/components/AuthSocialButtons';
import { useCustomAlert } from '@/components/CustomAlertContext';
import Colors from '@/constants/colors';
import { useWarmUpBrowser } from '@/hooks/useWarmUpBrowser';
import { useOAuth, useSignUp } from '@clerk/clerk-expo';
import { useLocalCredentials } from '@clerk/clerk-expo/local-credentials';
import * as Linking from 'expo-linking';
import * as LocalAuthentication from 'expo-local-authentication';
import { useRouter } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import { StatusBar } from 'expo-status-bar';
import * as WebBrowser from 'expo-web-browser';
import { ArrowLeft, AtSign, Check, CheckCircle, Eye, EyeOff, Loader2, Lock, Mail, User, X } from 'lucide-react-native';
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

export default function SignupScreen() {
  useWarmUpBrowser();
  const router = useRouter();
  const { isLoaded, signUp, setActive } = useSignUp();
  const { startOAuthFlow: startGoogleOAuthFlow } = useOAuth({ strategy: 'oauth_google' });
  const { startOAuthFlow: startAppleOAuthFlow } = useOAuth({ strategy: 'oauth_apple' });
  const { showAlert } = useCustomAlert();
  
  // Biometric authentication
  const { biometricType: clerkBiometricType, hasCredentials, setCredentials } = useLocalCredentials();

  // Direct biometric check using expo-local-authentication
  const [deviceBiometricType, setDeviceBiometricType] = useState<'face-recognition' | 'fingerprint' | null>(null);
  const [isBiometricAvailable, setIsBiometricAvailable] = useState(false);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [usernameStatus, setUsernameStatus] = useState<'idle' | 'checking' | 'available' | 'taken'>('idle');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const [pendingVerification, setPendingVerification] = useState(false);
  const [code, setCode] = useState('');
  


  // Check for biometric availability on mount
  useEffect(() => {
    const checkBiometricAvailability = async () => {
      try {
        const hasHardware = await LocalAuthentication.hasHardwareAsync();
        const isEnrolled = await LocalAuthentication.isEnrolledAsync();
        const supportedTypes = await LocalAuthentication.supportedAuthenticationTypesAsync();
        
        if (hasHardware && isEnrolled) {
          setIsBiometricAvailable(true);
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
  }, []);

  // Use Clerk's biometric type if available, otherwise use device detection
  const effectiveBiometricType = clerkBiometricType || deviceBiometricType;

  // Username format validation (availability is checked on submit)
  useEffect(() => {
    if (username.length === 0) {
      setUsernameStatus('idle');
      return;
    }

    if (username.length < 4) {
      setUsernameStatus('idle');
      return;
    }

    setUsernameStatus('checking');
    const timeoutId = setTimeout(() => {
      // Validate format: 4-64 chars, alphanumeric and underscores only
      const isValidFormat = /^[a-zA-Z0-9_]{4,64}$/.test(username);
      if (isValidFormat) {
        setUsernameStatus('available'); // Format valid, availability checked on submit
      } else {
        setUsernameStatus('idle');
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [username]);

  const handleSignup = async () => {
    if (!isLoaded || isLoading) return;
    
    if (password !== confirmPassword) {
      showAlert('Error', 'Passwords do not match', 'error');
      return;
    }

    if (username.length < 4) {
      showAlert('Error', 'Username must be at least 4 characters', 'error');
      return;
    }

    setIsLoading(true);

    try {
      const nameParts = name.trim().split(' ');
      const firstName = nameParts[0];
      const lastName = nameParts.slice(1).join(' ');

      await signUp.create({
        emailAddress: email,
        password,
        firstName,
        lastName,
        username,
      });

      await signUp.prepareEmailAddressVerification({ strategy: 'email_code' });
      setPendingVerification(true);
    } catch (err: any) {
      console.error(JSON.stringify(err, null, 2));
      // Check if error is about username being taken
      const errorMessage = err.errors?.[0]?.message || 'An error occurred during sign up';
      if (errorMessage.toLowerCase().includes('username')) {
        setUsernameStatus('taken');
      }
      showAlert('Error', errorMessage, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const onVerifyEmail = async () => {
    if (!isLoaded || isLoading) return;
    setIsLoading(true);

    try {
      const completeSignUp = await signUp.attemptEmailAddressVerification({
        code: code.trim(),
      });

      if (completeSignUp.status === 'complete') {
        await setActive({ session: completeSignUp.createdSessionId });
        
        // Store temp credentials for biometric prompt in drawer layout
        try {
          await SecureStore.setItemAsync(TEMP_PASSWORD_KEY, password);
          await SecureStore.setItemAsync(TEMP_EMAIL_KEY, email.trim());
          console.log('Stored temp credentials for biometric prompt after signup');
        } catch (err) {
          console.error('Failed to store temp credentials:', err);
        }
        
        router.replace('/(drawer)/(tabs)');
      } else {
        console.error(JSON.stringify(completeSignUp, null, 2));
        showAlert('Error', 'Verification failed. Please check the code and try again.', 'error');
      }
    } catch (err: any) {
      console.error(JSON.stringify(err, null, 2));
      showAlert('Error', err.errors ? err.errors[0].message : 'An error occurred during verification', 'error');
    } finally {
      setIsLoading(false);
    }
  };



  const onSelectAuth = useCallback(async (strategy: 'oauth_google' | 'oauth_apple') => {
    if (!isLoaded) return;

    try {
      const startOAuthFlow = strategy === 'oauth_google' ? startGoogleOAuthFlow : startAppleOAuthFlow;
      
      const { createdSessionId, setActive: setOAuthActive, signUp } = await startOAuthFlow({
        redirectUrl: Linking.createURL('/'),
      });

      if (createdSessionId) {
        if (setOAuthActive) {
           await setOAuthActive({ session: createdSessionId });
        }
        router.replace('/(drawer)/(tabs)');
      } else {
        // Use signIn or signUp for next steps such as MFA
      }
    } catch (err) {
      console.error('OAuth error', err);
    }
  }, [isLoaded, startGoogleOAuthFlow, startAppleOAuthFlow]);

  if (pendingVerification) {
    return (
      <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
        <StatusBar style="light" />
        <View style={styles.verificationContainer}>
           <Text style={styles.title}>Verify Email</Text>
           <Text style={styles.subtitle}>
              We sent a verification code to {email}. Please enter it below.
           </Text>
           
           <View style={[styles.inputGroup, { marginTop: 30 }]}>
              <View style={styles.inputContainer}>
                <CheckCircle size={20} color={Colors.dark.textSecondary} />
                <TextInput
                  style={styles.input}
                  placeholder="Enter verification code"
                  placeholderTextColor={Colors.dark.textSecondary}
                  value={code}
                  onChangeText={setCode}
                  keyboardType="number-pad"
                />
              </View>
            </View>

            <Pressable
              style={({ pressed }) => [
                styles.signupButton,
                pressed && { opacity: 0.9 },
                isLoading && { opacity: 0.7 },
              ]}
              onPress={onVerifyEmail}
              disabled={isLoading}
            >
              <Text style={styles.signupButtonText}>
                {isLoading ? 'Verifying...' : 'Verify Email'}
              </Text>
            </Pressable>
        </View>
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
            <Text style={styles.title}>Create Account</Text>
            <Text style={styles.subtitle}>
              Sign up to get started with your vehicle service
            </Text>
          </View>

          {/* Form */}
          <View style={styles.form}>
            {/* Name Input */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Full Name</Text>
              <View style={styles.inputContainer}>
                <User size={20} color={Colors.dark.textSecondary} />
                <TextInput
                  style={styles.input}
                  placeholder="Enter your full name"
                  placeholderTextColor={Colors.dark.textSecondary}
                  value={name}
                  onChangeText={setName}
                  autoCapitalize="words"
                  autoComplete="name"
                />
              </View>
            </View>

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

            {/* Username Input */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Username</Text>
              <View style={[
                styles.inputContainer,
                usernameStatus === 'available' && { borderColor: '#22c55e' },
                usernameStatus === 'taken' && { borderColor: Colors.dark.error },
              ]}>
                <AtSign size={20} color={Colors.dark.textSecondary} />
                <TextInput
                  style={styles.input}
                  placeholder="Choose a username"
                  placeholderTextColor={Colors.dark.textSecondary}
                  value={username}
                  onChangeText={setUsername}
                  autoCapitalize="none"
                  autoComplete="username"
                />
                {usernameStatus === 'checking' && (
                  <Loader2 size={18} color={Colors.dark.textSecondary} />
                )}
                {usernameStatus === 'available' && (
                  <Check size={18} color="#22c55e" />
                )}
                {usernameStatus === 'taken' && (
                  <X size={18} color={Colors.dark.error} />
                )}
              </View>
              {usernameStatus === 'taken' && (
                <Text style={{ color: Colors.dark.error, fontSize: 12, marginTop: 4 }}>
                  Username is already taken
                </Text>
              )}
            </View>

            {/* Password Input */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Password</Text>
              <View style={styles.inputContainer}>
                <Lock size={20} color={Colors.dark.textSecondary} />
                <TextInput
                  style={styles.input}
                  placeholder="Create a password"
                  placeholderTextColor={Colors.dark.textSecondary}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                  autoComplete="password-new"
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

            {/* Confirm Password Input */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Confirm Password</Text>
              <View style={styles.inputContainer}>
                <Lock size={20} color={Colors.dark.textSecondary} />
                <TextInput
                  style={styles.input}
                  placeholder="Confirm your password"
                  placeholderTextColor={Colors.dark.textSecondary}
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  secureTextEntry={!showConfirmPassword}
                  autoCapitalize="none"
                  autoComplete="password-new"
                />
                <Pressable onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
                  {showConfirmPassword ? (
                    <EyeOff size={20} color={Colors.dark.textSecondary} />
                  ) : (
                    <Eye size={20} color={Colors.dark.textSecondary} />
                  )}
                </Pressable>
              </View>
            </View>

            {/* Terms and Conditions */}
            <Text style={styles.termsText}>
              By signing up, you agree to our{' '}
              <Text style={styles.termsLink}>Terms of Service</Text> and{' '}
              <Text style={styles.termsLink}>Privacy Policy</Text>
            </Text>

            {/* Signup Button */}
            <Pressable
              style={({ pressed }) => [
                styles.signupButton,
                pressed && { opacity: 0.9 },
                isLoading && { opacity: 0.7 },
              ]}
              onPress={handleSignup}
              disabled={isLoading}
            >
              <Text style={styles.signupButtonText}>
                {isLoading ? 'Creating Account...' : 'Create Account'}
              </Text>
            </Pressable>

            {/* Social Login */}
            <AuthSocialButtons 
                onGooglePress={() => onSelectAuth('oauth_google')}
                onApplePress={() => onSelectAuth('oauth_apple')}
            />

            {/* Login Link */}
            <View style={styles.loginContainer}>
              <Text style={styles.loginText}>Already have an account? </Text>
              <Pressable onPress={() => router.push('/(auth)/login')}>
                <Text style={styles.loginLink}>Sign In</Text>
              </Pressable>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
      <View style={{ marginBottom: 20 }} />
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
    marginBottom: 32,
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
    marginBottom: 20,
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
  termsText: {
    fontSize: 12,
    color: Colors.dark.textSecondary,
    lineHeight: 18,
    marginBottom: 24,
    textAlign: 'center',
  },
  termsLink: {
    color: Colors.dark.primary,
    fontWeight: '600',
  },
  signupButton: {
    backgroundColor: Colors.dark.primary,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  signupButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.dark.primaryForeground,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: Colors.dark.border,
  },
  dividerText: {
    marginHorizontal: 16,
    fontSize: 14,
    color: Colors.dark.textSecondary,
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  loginText: {
    fontSize: 14,
    color: Colors.dark.textSecondary,
  },
  loginLink: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.dark.primary,
  },
  verificationContainer: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
  },
});
