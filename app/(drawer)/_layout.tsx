import BiometricEnablePrompt from '@/components/BiometricEnablePrompt';
import { useCustomAlert } from '@/components/CustomAlertContext';
import Colors from '@/constants/colors';
import { useUser } from '@clerk/clerk-expo';
import { useLocalCredentials } from '@clerk/clerk-expo/local-credentials';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as LocalAuthentication from 'expo-local-authentication';
import { Drawer } from 'expo-router/drawer';
import * as SecureStore from 'expo-secure-store';
import {
    Calendar,
    Car,
    Clock,
    HelpCircle,
    Home,
    MapPin,
    Settings
} from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import { Platform } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

const BIOMETRIC_PROMPT_SHOWN_KEY = 'biometric_prompt_shown';
const TEMP_PASSWORD_KEY = 'biometric_temp_pass';
const TEMP_EMAIL_KEY = 'biometric_temp_email';

export default function DrawerLayout() {
  const { user } = useUser();
  const { showAlert } = useCustomAlert();
  const { 
    hasCredentials, 
    biometricType: clerkBiometricType, 
    setCredentials 
  } = useLocalCredentials();

  // Direct biometric check using expo-local-authentication
  const [deviceBiometricType, setDeviceBiometricType] = useState<'face-recognition' | 'fingerprint' | null>(null);
  const [isBiometricAvailable, setIsBiometricAvailable] = useState(false);
  
  // Prompt states
  const [showEnablePrompt, setShowEnablePrompt] = useState(false);
  const [isEnabling, setIsEnabling] = useState(false);

  // Check for biometric availability and prompt conditions on mount
  useEffect(() => {
    const checkAndShowPrompt = async () => {
      try {
        // Check biometric hardware
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

        // Check if we should show the prompt
        const promptShown = await AsyncStorage.getItem(BIOMETRIC_PROMPT_SHOWN_KEY);
        const tempPassword = await SecureStore.getItemAsync(TEMP_PASSWORD_KEY);
        const tempEmail = await SecureStore.getItemAsync(TEMP_EMAIL_KEY);

        console.log('Drawer layout - Biometric prompt check:', {
          promptShown,
          hasTempPassword: !!tempPassword,
          hasTempEmail: !!tempEmail,
          hasHardware,
          isEnrolled,
          hasCredentials,
          clerkBiometricType,
          deviceBiometricType
        });

        const effectiveBiometricType = clerkBiometricType || deviceBiometricType;

        // Show prompt if:
        // 1. Prompt hasn't been shown before
        // 2. Biometrics are available
        // 3. User doesn't already have credentials stored
        // 4. We have temporary password from login/signup
        if (!promptShown && hasHardware && isEnrolled && effectiveBiometricType && !hasCredentials && tempPassword && tempEmail) {
          console.log('Showing biometric enable prompt in drawer layout');
          // Delay to ensure smooth transition
          setTimeout(() => {
            setShowEnablePrompt(true);
          }, 1500);
        } else {
          // Clean up temp credentials if not showing prompt
          if (tempPassword || tempEmail) {
            console.log('Cleaning up temp credentials (not showing prompt)');
            await SecureStore.deleteItemAsync(TEMP_PASSWORD_KEY);
            await SecureStore.deleteItemAsync(TEMP_EMAIL_KEY);
          }
        }
      } catch (error) {
        console.error('Error checking biometric prompt conditions:', error);
      }
    };

    checkAndShowPrompt();
  }, [clerkBiometricType, hasCredentials]);

  const effectiveBiometricType = clerkBiometricType || deviceBiometricType;

  const handleEnableBiometric = async () => {
    setIsEnabling(true);
    try {
      const tempPassword = await SecureStore.getItemAsync(TEMP_PASSWORD_KEY);
      const tempEmail = await SecureStore.getItemAsync(TEMP_EMAIL_KEY);

      if (!tempPassword || !tempEmail) {
        throw new Error('Missing credentials');
      }

      await setCredentials({
        identifier: tempEmail,
        password: tempPassword,
      });

      // Clean up temp credentials
      await SecureStore.deleteItemAsync(TEMP_PASSWORD_KEY);
      await SecureStore.deleteItemAsync(TEMP_EMAIL_KEY);
      
      // Mark prompt as shown
      await AsyncStorage.setItem(BIOMETRIC_PROMPT_SHOWN_KEY, 'true');
      
      setShowEnablePrompt(false);
    } catch (err: any) {
      console.error('Error enabling biometric:', err);
      
      // Check for specific error types if possible, otherwise show the message
      const errorMessage = err?.message || 'Unknown error occurred';
      
      if (errorMessage.includes('Missing credentials')) {
        showAlert('Session Expired', 'Please log out and log in again to enable biometrics.', 'warning');
      } else {
         showAlert('Biometric Error', `Could not enable biometric login: ${errorMessage}`, 'error');
      }
      
      // Clean up and mark as shown anyway to prevent loop
      await SecureStore.deleteItemAsync(TEMP_PASSWORD_KEY);
      await SecureStore.deleteItemAsync(TEMP_EMAIL_KEY);
      await AsyncStorage.setItem(BIOMETRIC_PROMPT_SHOWN_KEY, 'true');
      setShowEnablePrompt(false);
    } finally {
      setIsEnabling(false);
    }
  };

  const handleSkipBiometric = async () => {
    // Clean up temp credentials
    await SecureStore.deleteItemAsync(TEMP_PASSWORD_KEY);
    await SecureStore.deleteItemAsync(TEMP_EMAIL_KEY);
    
    // Mark prompt as shown
    await AsyncStorage.setItem(BIOMETRIC_PROMPT_SHOWN_KEY, 'true');
    setShowEnablePrompt(false);
  };

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Drawer
        screenOptions={{
          headerShown: false,
          drawerStyle: {
            backgroundColor: Colors.dark.background,
            width: 300,
            borderRightColor: Colors.dark.border,
            borderRightWidth: 1,
          },
          drawerActiveTintColor: Colors.dark.primary,
          drawerInactiveTintColor: Colors.dark.textSecondary,
          drawerLabelStyle: {
            fontFamily: Platform.select({ ios: 'System', default: 'sans-serif' }),
            fontWeight: '600',
            fontSize: 15,
            marginLeft: 10,
          },
          drawerItemStyle: {
            borderRadius: 12,
            paddingHorizontal: 10,
            marginVertical: 4,
            marginHorizontal: 10,
          },
          drawerActiveBackgroundColor: Colors.dark.cardHighlight,
          drawerType: 'slide',
          overlayColor: 'rgba(0,0,0,0.7)',
        }}
      >
        <Drawer.Screen
          name="(tabs)"
          options={{
            drawerLabel: 'Home',
            title: 'Home',
            drawerIcon: ({ color, size }) => (
              <Home size={22} color={color} />
            ),
          }}
        />
        <Drawer.Screen
          name="book-service"
          options={{
            drawerLabel: 'Book Service',
            title: 'Book Service',
            drawerIcon: ({ color, size }) => (
              <Calendar size={22} color={color} />
            ),
          }}
        />
        <Drawer.Screen
          name="vehicle-management"
          options={{
            drawerLabel: 'My Vehicles',
            title: 'My Vehicles',
            drawerIcon: ({ color, size }) => (
              <Car size={22} color={color} />
            ),
          }}
        />
        <Drawer.Screen
          name="service-history"
          options={{
            drawerLabel: 'Service History',
            title: 'Service History',
            drawerIcon: ({ color, size }) => (
              <Clock size={22} color={color} />
            ),
          }}
        />
        <Drawer.Screen
          name="settings"
          options={{
            drawerLabel: 'Settings',
            title: 'Settings',
            drawerIcon: ({ color, size }) => (
              <Settings size={22} color={color} />
            ),
          }}
        />
        <Drawer.Screen
          name="support"
          options={{
            drawerLabel: 'Support',
            title: 'Support',
            drawerIcon: ({ color, size }) => (
              <HelpCircle size={22} color={color} />
            ),
          }}
        />
        <Drawer.Screen
          name="station-finder"
          options={{
            drawerLabel: 'Station Finder',
            title: 'Station Finder',
            drawerIcon: ({ color, size }) => (
              <MapPin size={22} color={color} />
            ),
          }}
        />
        <Drawer.Screen
          name="loyalty-card"
          options={{
            drawerItemStyle: { display: 'none' },
            title: 'Loyalty Card',
          }}
        />
      </Drawer>

      {/* Biometric Enable Prompt */}
      <BiometricEnablePrompt
        visible={showEnablePrompt}
        onEnable={handleEnableBiometric}
        onSkip={handleSkipBiometric}
        biometricType={effectiveBiometricType}
        isLoading={isEnabling}
      />
    </GestureHandlerRootView>
  );
}
