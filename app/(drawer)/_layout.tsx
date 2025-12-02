import Colors from '@/constants/colors';
import { Drawer } from 'expo-router/drawer';
import {
    Calendar,
    Car,
    Clock,
    HelpCircle,
    Home,
    Settings
} from 'lucide-react-native';
import { Platform } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

export default function DrawerLayout() {
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
            marginLeft: 10, // Increased spacing
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
      </Drawer>
    </GestureHandlerRootView>
  );
}
