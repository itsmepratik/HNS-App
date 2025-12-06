import Colors from '@/constants/colors';
import * as Clipboard from 'expo-clipboard';
import { Award, Copy, QrCode, Share2 } from 'lucide-react-native';
import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  Image,
  Modal,
  PanResponder,
  Platform,
  Pressable,
  Share,
  StyleSheet,
  Text,
  View
} from 'react-native';

const { height } = Dimensions.get('window');

interface LoyaltyModalProps {
  visible: boolean;
  onClose: () => void;
  userData: {
    name: string;
    points: number;
    memberSince: string;
    qrImage?: any;
    cardNumber: string; // Add card number for copy functionality
  };
}

export function LoyaltyModal({ visible, onClose, userData }: LoyaltyModalProps) {
  const slideAnim = useRef(new Animated.Value(height)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const [showCopied, setShowCopied] = useState(false);

  // PanResponder for drag-to-dismiss
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, gestureState) => {
        return gestureState.dy > 5;
      },
      onPanResponderMove: (_, gestureState) => {
        if (gestureState.dy > 0) {
          slideAnim.setValue(gestureState.dy);
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dy > 100 || gestureState.vy > 0.5) {
          handleClose();
        } else {
          Animated.spring(slideAnim, {
            toValue: 0,
            useNativeDriver: true,
            damping: 20,
            stiffness: 90,
          }).start();
        }
      },
    })
  ).current;

  useEffect(() => {
    if (visible) {
      // Reset animations
      slideAnim.setValue(height);
      fadeAnim.setValue(0);

      // Start animations
      Animated.parallel([
        Animated.spring(slideAnim, {
          toValue: 0,
          useNativeDriver: true,
          damping: 20,
          stiffness: 90,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      // Exit animations
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: height,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);

  const handleClose = () => {
    Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: height,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start(() => onClose());
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: `My HNS Loyalty Card Number: ${userData.cardNumber}`,
      });
    } catch (error) {
      console.log(error);
    }
  };

  const handleCopy = async () => {
    await Clipboard.setStringAsync(userData.cardNumber);
    setShowCopied(true);
    setTimeout(() => setShowCopied(false), 2000);
  };

  if (!visible) return null;

  return (
    <Modal
      transparent
      visible={visible}
      onRequestClose={handleClose}
      statusBarTranslucent
    >
      <View style={styles.overlay}>
        <Pressable style={styles.backdrop} onPress={handleClose}>
            <Animated.View style={[styles.backdropFill, { opacity: fadeAnim }]} />
        </Pressable>

        <Animated.View 
            style={[
                styles.modalContainer, 
                { transform: [{ translateY: slideAnim }] }
            ]}
        >
            <View {...panResponder.panHandlers} style={styles.dragHandleHitSlop}>
                <View style={styles.handleBar} />
            </View>
            
            <View style={styles.header}>
                <Text style={styles.title}>My Loyalty Card</Text>
                <Text style={styles.subtitle}>Scan this code to earn points</Text>
            </View>

            <View style={styles.qrSection}>
                <View style={styles.qrBackground}>
                    {userData.qrImage ? (
                        <Image 
                            source={userData.qrImage} 
                            style={styles.qrImage} 
                            resizeMode="contain"
                        />
                    ) : (
                        <QrCode size={180} color="black" />
                    )}
                </View>
                
                <View style={styles.userInfo}>
                    <Text style={styles.userName}>{userData.name}</Text>
                    <View style={styles.pointsBadge}>
                        <Award size={16} color={Colors.dark.primary} />
                        <Text style={styles.pointsText}>{userData.points.toLocaleString()} pts</Text>
                    </View>
                </View>
            </View>

            <View style={styles.actionsContainer}>
                <Pressable 
                    style={[styles.actionButton, styles.secondaryButton]} 
                    onPress={handleCopy}
                >
                    <Copy size={20} color={Colors.dark.text} />
                    <Text style={styles.secondaryButtonText}>{showCopied ? 'Copied' : 'Copy'}</Text>
                </Pressable>

                <Pressable 
                    style={[styles.actionButton, styles.primaryButton]} 
                    onPress={handleShare}
                >
                    <Share2 size={20} color={Colors.dark.card} />
                    <Text style={styles.primaryButtonText}>Share</Text>
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
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  backdropFill: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
  modalContainer: {
    backgroundColor: Colors.dark.card, // Lighter dark background for the card/sheet
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
    padding: 32,
    minHeight: height * 0.65, // Taller as requested
    paddingBottom: Platform.OS === 'ios' ? 50 : 32,
    alignItems: 'center',
  },
  dragHandleHitSlop: {
    width: '100%',
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -20, // Move up to cover the top edge area effectively
    marginBottom: 10,
  },
  handleBar: {
    width: 48,
    height: 6,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 3,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.dark.text,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.dark.textSecondary,
  },
  qrSection: {
    alignItems: 'center',
    width: '100%',
    marginBottom: 40,
  },
  qrBackground: {
    width: 260,
    height: 260,
    backgroundColor: 'white',
    borderRadius: 32,
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    shadowColor: "#000",
    shadowOffset: {
        width: 0,
        height: 10,
    },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  qrImage: {
    width: '100%',
    height: '100%',
  },
  userInfo: {
    alignItems: 'center',
    gap: 8,
  },
  userName: {
    fontSize: 20,
    fontWeight: '600',
    color: Colors.dark.text,
  },
  pointsBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 100,
    gap: 6,
  },
  pointsText: {
    color: Colors.dark.primary,
    fontWeight: '700',
    fontSize: 14,
  },
  actionsContainer: {
    flexDirection: 'row',
    gap: 16,
    width: '100%',
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 20,
    gap: 10,
  },
  secondaryButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  secondaryButtonText: {
    color: Colors.dark.text,
    fontSize: 16,
    fontWeight: '600',
  },
  primaryButton: {
    backgroundColor: Colors.dark.primary,
  },
  primaryButtonText: {
    color: Colors.dark.card, // Dark text on primary color
    fontSize: 16,
    fontWeight: '600',
  },
});
