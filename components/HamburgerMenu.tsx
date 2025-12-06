import Colors from '@/constants/colors';
import { DrawerActions, useNavigation } from '@react-navigation/native';
import { Menu } from 'lucide-react-native';
import React from 'react';
import { Animated, Pressable, StyleSheet } from 'react-native';

export function HamburgerMenu() {
  const navigation = useNavigation();
  const scaleAnim = React.useRef(new Animated.Value(1)).current;

  const handleMenuPress = () => {
    // Animate button press
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 0.85,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();

    // Open drawer
    navigation.dispatch(DrawerActions.openDrawer());
  };

  return (
    <Pressable onPress={handleMenuPress} style={styles.menuButton}>
      <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
        <Menu size={24} color={Colors.dark.text} strokeWidth={2.5} />
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  menuButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: -8, // Reduced left padding
  },
});
