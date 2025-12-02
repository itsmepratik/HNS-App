import React, { useRef, useCallback } from 'react';
import { Animated, ViewStyle, Easing } from 'react-native';
import { useFocusEffect } from 'expo-router';

interface FadeInViewProps {
  children: React.ReactNode;
  style?: ViewStyle;
  delay?: number;
}

export function FadeInView({ children, style, delay = 0 }: FadeInViewProps) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(20)).current;

  useFocusEffect(
    useCallback(() => {
      // Reset values to start state
      fadeAnim.setValue(0);
      translateY.setValue(20);

      // Start animation with a slight delay to allow navigation transition to start
      const timeout = setTimeout(() => {
        Animated.parallel([
          Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 800,
            delay,
            useNativeDriver: true,
            easing: Easing.out(Easing.cubic),
          }),
          Animated.timing(translateY, {
            toValue: 0,
            duration: 800,
            delay,
            useNativeDriver: true,
            easing: Easing.out(Easing.cubic),
          }),
        ]).start();
      }, 50);

      return () => {
        clearTimeout(timeout);
        fadeAnim.stopAnimation();
        translateY.stopAnimation();
      };
    }, [delay, fadeAnim, translateY])
  );

  return (
    <Animated.View
      style={[
        style,
        {
          opacity: fadeAnim,
          transform: [{ translateY }],
        },
      ]}
    >
      {children}
    </Animated.View>
  );
}
