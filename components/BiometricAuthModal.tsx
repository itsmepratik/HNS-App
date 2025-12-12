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

type BiometricStatus = 'idle' | 'authenticating' | 'success' | 'error';

interface BiometricAuthModalProps {
  visible: boolean;
  onClose: () => void;
  onAuthenticate: () => Promise<void>;
  biometricType: 'face-recognition' | 'fingerprint' | null;
  status: BiometricStatus;
  errorMessage?: string;
}

export default function BiometricAuthModal({
  visible,
  onClose,
  onAuthenticate,
  biometricType,
  status,
  errorMessage,
}: BiometricAuthModalProps) {
  const slideAnim = useRef(new Animated.Value(SCREEN_HEIGHT)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.spring(slideAnim, {
        toValue: 0,
        useNativeDriver: true,
        tension: 65,
        friction: 11,
      }).start();
    } else {
      Animated.timing(slideAnim, {
        toValue: SCREEN_HEIGHT,
        duration: 250,
        useNativeDriver: true,
      }).start();
    }
  }, [visible]);

  // Pulse animation for authenticating state
  useEffect(() => {
    if (status === 'authenticating') {
      const pulse = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.1,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }),
        ])
      );
      pulse.start();
      return () => pulse.stop();
    } else {
      pulseAnim.setValue(1);
    }
  }, [status]);

  const getStatusColor = () => {
    switch (status) {
      case 'success':
        return '#22c55e'; // Green
      case 'error':
        return '#ef4444'; // Red
      default:
        return Colors.dark.primary; // Yellow/Green accent
    }
  };

  const getStatusText = () => {
    const isFaceID = biometricType === 'face-recognition';
    switch (status) {
      case 'authenticating':
        return isFaceID
          ? 'Look at your device to authenticate'
          : 'Please touch the fingerprint sensor\nof your phone to continue.';
      case 'success':
        return 'Authentication successful!';
      case 'error':
        return errorMessage || (isFaceID
          ? 'Face ID does not match. Please try again or log in using your password.'
          : 'Your fingerprint does not match. Please\ntry again or log in using your password.');
      default:
        return isFaceID
          ? 'Look at your device to authenticate'
          : 'Please touch the fingerprint sensor\nof your phone to continue.';
    }
  };

  const getTitle = () => {
    return biometricType === 'face-recognition' ? 'Face ID Login' : 'Fingerprint Login';
  };

  const IconComponent = biometricType === 'face-recognition' ? ScanFace : Fingerprint;
  const statusColor = getStatusColor();

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <BlurView intensity={20} style={StyleSheet.absoluteFill} tint="dark" />
        
        <Pressable style={styles.dismissArea} onPress={onClose} />
        
        <Animated.View
          style={[
            styles.modalContainer,
            { transform: [{ translateY: slideAnim }] },
          ]}
        >
          {/* Handle bar */}
          <View style={styles.handleBar} />
          
          {/* Close button */}
          <Pressable style={styles.closeButton} onPress={onClose}>
            <X size={20} color={Colors.dark.textSecondary} />
          </Pressable>

          {/* Biometric Icon with animated ring */}
          <View style={styles.iconSection}>
            <Animated.View
              style={[
                styles.iconRing,
                {
                  borderColor: statusColor,
                  transform: [{ scale: pulseAnim }],
                },
              ]}
            >
              <IconComponent
                size={48}
                color={statusColor}
                strokeWidth={1.5}
              />
            </Animated.View>
          </View>

          {/* Title */}
          <Text style={styles.title}>{getTitle()}</Text>

          {/* Status text */}
          <Text
            style={[
              styles.statusText,
              status === 'error' && { color: '#ef4444' },
            ]}
          >
            {getStatusText()}
          </Text>

          {/* Action buttons */}
          <View style={styles.buttonContainer}>
            {status === 'error' && (
              <Pressable
                style={styles.retryButton}
                onPress={onAuthenticate}
              >
                <Text style={styles.retryButtonText}>Try Again</Text>
              </Pressable>
            )}
            
            <Pressable
              style={[
                styles.cancelButton,
                status === 'error' && styles.cancelButtonFullWidth,
              ]}
              onPress={onClose}
            >
              <Text style={styles.cancelButtonText}>
                {status === 'error' ? 'Use Password Instead' : 'Cancel'}
              </Text>
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
    minHeight: 320,
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
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.dark.text,
    marginBottom: 12,
    textAlign: 'center',
  },
  statusText: {
    fontSize: 14,
    color: Colors.dark.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  buttonContainer: {
    width: '100%',
    gap: 12,
  },
  retryButton: {
    backgroundColor: Colors.dark.primary,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
  },
  retryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.dark.primaryForeground,
  },
  cancelButton: {
    backgroundColor: Colors.dark.background,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.dark.border,
  },
  cancelButtonFullWidth: {
    marginTop: 4,
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.dark.text,
  },
});
