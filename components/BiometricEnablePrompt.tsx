import Colors from '@/constants/colors';
import { BlurView } from 'expo-blur';
import { Fingerprint, ScanFace, X } from 'lucide-react-native';
import React, { useEffect, useRef } from 'react';
import {
  Animated,
  Dimensions,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

interface BiometricEnablePromptProps {
  visible: boolean;
  onEnable: () => void;
  onSkip: () => void;
  biometricType: 'face-recognition' | 'fingerprint' | null;
  isLoading?: boolean;
}

export default function BiometricEnablePrompt({
  visible,
  onEnable,
  onSkip,
  biometricType,
  isLoading = false,
}: BiometricEnablePromptProps) {
  const slideAnim = useRef(new Animated.Value(SCREEN_HEIGHT)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(slideAnim, {
          toValue: 0,
          useNativeDriver: true,
          tension: 65,
          friction: 11,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: SCREEN_HEIGHT,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 0,
          duration: 150,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);

  const getTitle = () => {
    return biometricType === 'face-recognition'
      ? 'Enable Face ID?'
      : 'Enable Fingerprint Login?';
  };

  const getDescription = () => {
    return biometricType === 'face-recognition'
      ? 'Use Face ID for faster and more secure log in next time.'
      : 'Use your fingerprint for faster and more secure log in next time.';
  };

  const IconComponent = biometricType === 'face-recognition' ? ScanFace : Fingerprint;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onSkip}
    >
      <View style={styles.overlay}>
        <BlurView intensity={20} style={StyleSheet.absoluteFill} tint="dark" />
        
        <Pressable style={styles.dismissArea} onPress={onSkip} />
        
        <Animated.View
          style={[
            styles.modalContainer,
            {
              transform: [{ translateY: slideAnim }, { scale: scaleAnim }],
              opacity: opacityAnim,
            },
          ]}
        >
          {/* Handle bar */}
          <View style={styles.handleBar} />
          
          {/* Close button */}
          <Pressable style={styles.closeButton} onPress={onSkip}>
            <X size={20} color={Colors.dark.textSecondary} />
          </Pressable>

          {/* Biometric Icon */}
          <View style={styles.iconSection}>
            <View style={styles.iconRing}>
              <IconComponent
                size={48}
                color={Colors.dark.primary}
                strokeWidth={1.5}
              />
            </View>
          </View>

          {/* Title */}
          <Text style={styles.title}>{getTitle()}</Text>

          {/* Description */}
          <Text style={styles.description}>{getDescription()}</Text>

          {/* Benefits list */}
          <View style={styles.benefitsList}>
            <View style={styles.benefitItem}>
              <View style={styles.bulletPoint} />
              <Text style={styles.benefitText}>Log in with a single touch</Text>
            </View>
            <View style={styles.benefitItem}>
              <View style={styles.bulletPoint} />
              <Text style={styles.benefitText}>More secure than passwords</Text>
            </View>
            <View style={styles.benefitItem}>
              <View style={styles.bulletPoint} />
              <Text style={styles.benefitText}>Your data stays on your device</Text>
            </View>
          </View>

          {/* Action buttons */}
          <View style={styles.buttonContainer}>
            <Pressable
              style={[styles.enableButton, isLoading && styles.buttonDisabled]}
              onPress={onEnable}
              disabled={isLoading}
            >
              <IconComponent
                size={20}
                color={Colors.dark.primaryForeground}
                style={styles.buttonIcon}
              />
              <Text style={styles.enableButtonText}>
                {isLoading ? 'Enabling...' : 'Enable'}
              </Text>
            </Pressable>
            
            <Pressable
              style={styles.skipButton}
              onPress={onSkip}
              disabled={isLoading}
            >
              <Text style={styles.skipButtonText}>Not Now</Text>
            </Pressable>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  dismissArea: {
    flex: 1,
  },
  modalContainer: {
    backgroundColor: Colors.dark.card,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: Platform.OS === 'ios' ? 40 : 24,
    alignItems: 'center',
  },
  handleBar: {
    width: 40,
    height: 4,
    backgroundColor: Colors.dark.border,
    borderRadius: 2,
    marginBottom: 20,
  },
  closeButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.dark.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconSection: {
    marginTop: 20,
    marginBottom: 24,
  },
  iconRing: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: Colors.dark.primary,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(124, 179, 66, 0.1)',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.dark.text,
    marginBottom: 12,
    textAlign: 'center',
  },
  description: {
    fontSize: 15,
    color: Colors.dark.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: 10,
    marginBottom: 20,
  },
  benefitsList: {
    width: '100%',
    paddingHorizontal: 8,
    marginBottom: 28,
    gap: 12,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  bulletPoint: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.dark.primary,
  },
  benefitText: {
    fontSize: 14,
    color: Colors.dark.text,
  },
  buttonContainer: {
    width: '100%',
    gap: 12,
  },
  enableButton: {
    backgroundColor: Colors.dark.primary,
    height: 56,
    borderRadius: 28,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonIcon: {
    marginRight: 8,
  },
  enableButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.dark.primaryForeground,
  },
  skipButton: {
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
  },
  skipButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.dark.textSecondary,
  },
});
