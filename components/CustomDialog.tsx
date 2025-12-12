import Colors from '@/constants/colors';
import { BlurView } from 'expo-blur';
import { AlertCircle, CheckCircle, Info, XCircle } from 'lucide-react-native';
import React, { useEffect } from 'react';
import { BackHandler, Dimensions, Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, {
    FadeIn,
    FadeOut,
    ZoomIn,
    ZoomOut
} from 'react-native-reanimated';

interface CustomDialogProps {
  visible: boolean;
  title: string;
  message: string;
  type?: 'success' | 'error' | 'info' | 'warning';
  actions?: {
    text: string;
    onPress: () => void;
    style?: 'default' | 'cancel' | 'destructive';
  }[];
  onClose?: () => void;
}

const { width } = Dimensions.get('window');

// Wrapper to animate the BlurView correctly
const AnimatedBlurView = Animated.createAnimatedComponent(BlurView);

export default function CustomDialog({
  visible,
  title,
  message,
  type = 'info',
  actions = [],
  onClose,
}: CustomDialogProps) {

  // Handle hardware back button
  useEffect(() => {
    const onBackPress = () => {
      if (visible) {
        onClose?.();
        return true;
      }
      return false;
    };

    const backHandler = BackHandler.addEventListener('hardwareBackPress', onBackPress);
    return () => backHandler.remove();
  }, [visible, onClose]);

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle size={48} color={Colors.dark.primary} />;
      case 'error':
        return <XCircle size={48} color={Colors.dark.error} />;
      case 'warning':
        return <AlertCircle size={48} color={Colors.dark.warning} />;
      default:
        return <Info size={48} color={Colors.dark.primary} />;
    }
  };

  // If not visible, we don't render anything. 
  // Reanimated handles the exiting animation before unmounting.
  if (!visible) return null;

  return (
    <View style={[StyleSheet.absoluteFill, { zIndex: 9999, elevation: 9999 }]} pointerEvents="box-none">
      {/* Backdrop */}
      <Animated.View 
        entering={FadeIn.duration(250)} 
        exiting={FadeOut.duration(200)}
        style={StyleSheet.absoluteFill}
      >
         <View style={styles.overlayBackground}>
             {/* We can use BlurView here but animating intensity is heavy. 
                 Instead, we just fade in a dark blur view. */}
             <BlurView intensity={20} tint="dark" style={StyleSheet.absoluteFill} />
         </View>
      </Animated.View>

      {/* Dialog Container */}
      <View style={styles.centerContainer} pointerEvents="box-none"> 
        <Animated.View
          entering={ZoomIn.duration(200)}
          exiting={ZoomOut.duration(150)}
          style={styles.dialogContainer}
        >
            <View style={styles.iconContainer}>
              {getIcon()}
            </View>
            
            <Text style={styles.title}>{title}</Text>
            <Text style={styles.message}>{message}</Text>

            <View style={styles.actionsContainer}>
              {actions.map((action, index) => (
                <Pressable
                  key={index}
                  style={({ pressed }) => [
                    styles.button,
                    action.style === 'cancel' && styles.buttonCancel,
                    action.style === 'destructive' && styles.buttonDestructive,
                    actions.length > 1 && { flex: 1 },
                    pressed && { opacity: 0.8, transform: [{ scale: 0.98 }] }
                  ]}
                  onPress={action.onPress}
                >
                  <Text
                    style={[
                      styles.buttonText,
                      action.style === 'cancel' && styles.buttonTextCancel,
                      action.style === 'destructive' && styles.buttonTextDestructive,
                    ]}
                  >
                    {action.text}
                  </Text>
                </Pressable>
              ))}
            </View>
        </Animated.View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlayBackground: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.6)', 
  },
  centerContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  dialogContainer: {
    width: Math.min(width - 40, 340),
    backgroundColor: Colors.dark.card,
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.dark.border,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  iconContainer: {
    marginBottom: 16,
    padding: 16,
    backgroundColor: Colors.dark.cardHighlight,
    borderRadius: 50,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.dark.text,
    marginBottom: 8,
    textAlign: 'center',
  },
  message: {
    fontSize: 16,
    color: Colors.dark.textSecondary,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22,
  },
  actionsContainer: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
    justifyContent: 'center',
  },
  button: {
    backgroundColor: Colors.dark.primary,
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 100,
  },
  buttonCancel: {
    backgroundColor: Colors.dark.cardHighlight,
  },
  buttonDestructive: {
    backgroundColor: 'rgba(239, 68, 68, 0.2)',
  },
  buttonText: {
    color: Colors.dark.primaryForeground,
    fontWeight: '700',
    fontSize: 16,
  },
  buttonTextCancel: {
    color: Colors.dark.text,
  },
  buttonTextDestructive: {
    color: Colors.dark.error,
  },
});
