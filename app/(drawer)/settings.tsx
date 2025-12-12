import { useCustomAlert } from '@/components/CustomAlertContext';
import Colors from '@/constants/colors';
import { useUser } from '@clerk/clerk-expo';
import { useLocalCredentials } from '@clerk/clerk-expo/local-credentials';
import { BlurView } from 'expo-blur';
import * as LocalAuthentication from 'expo-local-authentication';
import { useRouter } from 'expo-router';
import { ArrowLeft, Eye, EyeOff, Fingerprint, Save, ScanFace, Shield, X } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import {
    KeyboardAvoidingView,
    Modal,
    Platform,
    ScrollView,
    StyleSheet,
    Switch,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function SettingsScreen() {
  const router = useRouter();
  const { user } = useUser();
  const { showAlert } = useCustomAlert();

  // Biometric settings from Clerk
  const { 
    userOwnsCredentials, 
    biometricType: clerkBiometricType, 
    clearCredentials,
    setCredentials,
    hasCredentials 
  } = useLocalCredentials();
  
  // Direct biometric check using expo-local-authentication
  const [deviceBiometricType, setDeviceBiometricType] = useState<'face-recognition' | 'fingerprint' | null>(null);
  const [isBiometricAvailable, setIsBiometricAvailable] = useState(false);
  const [biometricEnabled, setBiometricEnabled] = useState(false);
  const [isTogglingBiometric, setIsTogglingBiometric] = useState(false);
  
  // Password prompt state
  const [showPasswordPrompt, setShowPasswordPrompt] = useState(false);
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);

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
  }, [clerkBiometricType, userOwnsCredentials, hasCredentials]);

  // Use Clerk's biometric type if available, otherwise use device detection
  const effectiveBiometricType = clerkBiometricType || deviceBiometricType;

  // Sync biometric state with stored credentials
  useEffect(() => {
    setBiometricEnabled(!!userOwnsCredentials);
  }, [userOwnsCredentials]);

  const handleSave = () => {
    // Simulate API call
    showAlert('Success', 'Profile updated successfully!', 'success');
  };

  const handleBiometricToggle = async (value: boolean) => {
    if (value) {
      // Show password prompt to enable
      setPassword('');
      setShowPassword(false);
      setShowPasswordPrompt(true);
      return;
    }

    // Disable biometric
    setIsTogglingBiometric(true);
    try {
      await clearCredentials();
      setBiometricEnabled(false);
    } catch (err) {
      console.error('Error clearing credentials:', err);
      showAlert('Error', 'Could not disable biometric login. Please try again.', 'error');
    } finally {
      setIsTogglingBiometric(false);
    }
  };

  const handleEnableBiometric = async () => {
    if (!password.trim() || !user?.primaryEmailAddress?.emailAddress) return;

    setIsVerifying(true);
    try {
      await setCredentials({
        identifier: user.primaryEmailAddress.emailAddress,
        password: password
      });
      setBiometricEnabled(true);
      setBiometricEnabled(true);
      setShowPasswordPrompt(false);
      showAlert('Success', `${getBiometricLabel()} login enabled!`, 'success');
    } catch (err) {
      console.error('Error enabling biometric:', err);
      showAlert('Error', 'Could not enable biometric login. Please verify your password and try again.', 'error');
    } finally {
      setIsVerifying(false);
    }
  };

  const getBiometricLabel = () => {
    if (effectiveBiometricType === 'face-recognition') return 'Face ID';
    if (effectiveBiometricType === 'fingerprint') return 'Fingerprint';
    return 'Biometric';
  };

  const BiometricIcon = effectiveBiometricType === 'face-recognition' ? ScanFace : Fingerprint;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
             <ArrowLeft size={24} color={Colors.dark.text} />
        </TouchableOpacity>
        <Text style={styles.title}>Edit Profile</Text>
        <View style={{ width: 40 }} /> 
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView contentContainerStyle={styles.content}>
          {/* Security Section - Show if device has biometric hardware */}
          {isBiometricAvailable && effectiveBiometricType && (
            <View style={styles.securitySection}>
              <View style={styles.sectionHeader}>
                <Shield size={20} color={Colors.dark.primary} />
                <Text style={styles.sectionTitle}>Security</Text>
              </View>

              <View style={styles.settingRow}>
                <View style={styles.settingIconContainer}>
                  <BiometricIcon size={24} color={Colors.dark.primary} />
                </View>
                <View style={styles.settingInfo}>
                  <Text style={styles.settingLabel}>{getBiometricLabel()} Login</Text>
                  <Text style={styles.settingDescription}>
                    {biometricEnabled 
                      ? `Log in quickly using ${getBiometricLabel()}`
                      : 'Use biometrics for faster log in'}
                  </Text>
                </View>
                <Switch
                  value={biometricEnabled}
                  onValueChange={handleBiometricToggle}
                  disabled={isTogglingBiometric}
                  trackColor={{ 
                    false: Colors.dark.border, 
                    true: Colors.dark.primary 
                  }}
                  thumbColor={biometricEnabled ? '#ffffff' : '#f4f3f4'}
                  ios_backgroundColor={Colors.dark.border}
                />
              </View>

              {biometricEnabled && (
                <Text style={styles.securityNote}>
                  Your credentials are stored securely on this device and protected by {getBiometricLabel()}.
                </Text>
              )}
            </View>
          )}
        </ScrollView>

        <View style={styles.footer}>
          <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
            <Save size={20} color={Colors.dark.primaryForeground} style={styles.saveIcon} />
            <Text style={styles.saveButtonText}>Save Changes</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>

      {/* Password Confirmation Modal */}
      <Modal
        visible={showPasswordPrompt}
        transparent
        animationType="fade"
        onRequestClose={() => setShowPasswordPrompt(false)}
      >
        <View style={styles.modalOverlay}>
          <BlurView intensity={20} style={StyleSheet.absoluteFill} tint="dark" />
          <KeyboardAvoidingView
             behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
             style={styles.modalKeyboardAvoid}
          >
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <TouchableOpacity 
                    onPress={() => setShowPasswordPrompt(false)}
                    style={styles.closeButton}
                >
                    <X size={20} color={Colors.dark.textSecondary} />
                </TouchableOpacity>
              </View>

              <View style={styles.modalIconContainer}>
                <Shield size={32} color={Colors.dark.primary} />
              </View>
              
              <Text style={styles.modalTitle}>Confirm Password</Text>
              <Text style={styles.modalSubtitle}>
                Please enter your password to enable {getBiometricLabel()} login.
              </Text>

              <View style={styles.inputContainer}>
                <TextInput
                  style={styles.input}
                  placeholder="Password"
                  placeholderTextColor={Colors.dark.textSecondary}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                />
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                  {showPassword ? (
                    <EyeOff size={20} color={Colors.dark.textSecondary} />
                  ) : (
                    <Eye size={20} color={Colors.dark.textSecondary} />
                  )}
                </TouchableOpacity>
              </View>

              <View style={styles.modalActions}>
                <TouchableOpacity 
                    style={styles.cancelButton} 
                    onPress={() => setShowPasswordPrompt(false)}
                >
                    <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                    style={[styles.confirmButton, (!password || isVerifying) && styles.disabledButton]} 
                    onPress={handleEnableBiometric}
                    disabled={!password || isVerifying}
                >
                    <Text style={styles.confirmButtonText}>
                        {isVerifying ? 'Verifying...' : 'Enable'}
                    </Text>
                </TouchableOpacity>
              </View>
            </View>
          </KeyboardAvoidingView>
        </View>
      </Modal>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.dark.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: Colors.dark.border,
  },
  backButton: {
    padding: 8,
     marginLeft: -8,
  },
  title: {
    color: Colors.dark.text,
    fontSize: 20,
    fontWeight: '700',
  },
  keyboardView: {
    flex: 1,
  },
  content: {
    padding: 24,
  },
  securitySection: {
    backgroundColor: Colors.dark.card,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.dark.border,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 16,
  },
  sectionTitle: {
    color: Colors.dark.text,
    fontSize: 16,
    fontWeight: '600',
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  settingIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: 'rgba(124, 179, 66, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  settingInfo: {
    flex: 1,
    gap: 2,
  },
  settingLabel: {
    color: Colors.dark.text,
    fontSize: 15,
    fontWeight: '600',
  },
  settingDescription: {
    color: Colors.dark.textSecondary,
    fontSize: 13,
  },
  securityNote: {
    color: Colors.dark.textSecondary,
    fontSize: 12,
    marginTop: 14,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: Colors.dark.border,
    lineHeight: 18,
  },
  footer: {
    padding: 24,
    borderTopWidth: 1,
    borderTopColor: Colors.dark.border,
    backgroundColor: Colors.dark.background,
  },
  saveButton: {
    backgroundColor: Colors.dark.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
  },
  saveIcon: {
    marginRight: 8,
  },
  saveButtonText: {
    color: Colors.dark.primaryForeground,
    fontSize: 16,
    fontWeight: '700',
  },
  modalOverlay: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: 'rgba(0,0,0,0.5)',
      padding: 20
  },
  modalKeyboardAvoid: {
      width: '100%',
      alignItems: 'center',
      justifyContent: 'center'
  },
  modalContent: {
      width: '100%',
      maxWidth: 340,
      backgroundColor: Colors.dark.card,
      borderRadius: 24,
      padding: 24,
      alignItems: 'center',
      borderWidth: 1,
      borderColor: Colors.dark.border
  },
  modalHeader: {
      width: '100%',
      alignItems: 'flex-end',
      marginBottom: -10
  },
  closeButton: {
      padding: 4
  },
  modalIconContainer: {
      width: 64,
      height: 64,
      borderRadius: 32,
      backgroundColor: 'rgba(124, 179, 66, 0.15)',
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 16
  },
  modalTitle: {
      fontSize: 18,
      fontWeight: '700',
      color: Colors.dark.text,
      marginBottom: 8
  },
  modalSubtitle: {
      fontSize: 14,
      color: Colors.dark.textSecondary,
      textAlign: 'center',
      marginBottom: 24,
      lineHeight: 20
  },
  inputContainer: {
      width: '100%',
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: Colors.dark.background,
      borderWidth: 1,
      borderColor: Colors.dark.border,
      borderRadius: 12,
      paddingHorizontal: 12,
      height: 48,
      marginBottom: 24
  },
  input: {
      flex: 1,
      color: Colors.dark.text,
      fontSize: 16,
      marginRight: 10
  },
  modalActions: {
      flexDirection: 'row',
      gap: 12,
      width: '100%'
  },
  cancelButton: {
      flex: 1,
      height: 44,
      borderRadius: 12,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1,
      borderColor: Colors.dark.border,
  },
  cancelButtonText: {
      color: Colors.dark.text,
      fontWeight: '600',
      fontSize: 15
  },
  confirmButton: {
      flex: 1,
      height: 44,
      backgroundColor: Colors.dark.primary,
      borderRadius: 12,
      alignItems: 'center',
      justifyContent: 'center'
  },
  disabledButton: {
      opacity: 0.5
  },
  confirmButtonText: {
      color: Colors.dark.primaryForeground,
      fontWeight: '600',
      fontSize: 15
  }
});
