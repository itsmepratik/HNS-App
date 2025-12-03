import { FadeInView } from '@/components/FadeInView';
import Colors from '@/constants/colors';
import { useRouter } from 'expo-router';
import { Bell, ChevronRight, HelpCircle, LogOut, QrCode, Shield } from 'lucide-react-native';
import React from 'react';
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// Helper component for menu items
const MenuItem = ({ icon: Icon, title, onPress }: { icon: any, title: string, onPress?: () => void }) => (
  <Pressable style={styles.menuItem} onPress={onPress}>
    <View style={styles.menuIconBox}>
      <Icon size={20} color={Colors.dark.primary} />
    </View>
    <Text style={styles.menuText}>{title}</Text>
    <ChevronRight size={20} color={Colors.dark.textSecondary} />
  </Pressable>
);

export default function ProfileScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <FadeInView style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <Text style={styles.headerTitle}>Profile</Text>



          <View style={styles.profileCard}>
            <View style={styles.avatarContainer}>
               <Image 
                  source={{ uri: 'https://framerusercontent.com/images/DqEIq4ebFpQTvXG41Rjsc6ZbEL8.jpg?scale-down-to=512&width=576&height=576' }} 
                  style={styles.avatar}
                />
            </View>
            <View style={styles.profileInfo}>
              <Text style={styles.userName}>Pratik Chakraborty</Text>
              <Text style={styles.userEmail}>hello@pratik.pp.ua</Text>
            </View>
          </View>

          <View style={styles.section}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <Text style={[styles.sectionTitle, { marginBottom: 0 }]}>My Vehicle</Text>
              <Pressable onPress={() => router.push('/(drawer)/vehicle-management')}>
                <Text style={{ color: Colors.dark.primary, fontWeight: '600' }}>Manage</Text>
              </Pressable>
            </View>
            <Pressable onPress={() => router.push('/(drawer)/vehicle-management')}>
              <View style={styles.vehicleCard}>
                <Image 
                  source={{ uri: 'https://images.unsplash.com/photo-1617788138017-80ad40651399?q=80&w=800&auto=format&fit=crop' }} 
                  style={styles.vehicleImage}
                  resizeMode="cover"
                />
                <View style={styles.vehicleInfo}>
                  <Text style={styles.vehicleName}>Tesla Model 3</Text>
                  <Text style={styles.vehiclePlate}>HNS-8829</Text>
                </View>
              </View>
            </Pressable>
          </View>

          <View style={styles.menuGroup}>
            <MenuItem 
              icon={QrCode} 
              title="My Loyalty Card" 
              onPress={() => router.push('/(drawer)/loyalty-card')}
            />
            <MenuItem icon={Bell} title="Notifications" />
            <MenuItem icon={Shield} title="Privacy & Security" />
            <MenuItem icon={HelpCircle} title="Help & Support" />
          </View>

          <Pressable style={styles.logoutButton}>
            <LogOut size={20} color={Colors.dark.error} />
            <Text style={styles.logoutText}>Log Out</Text>
          </Pressable>
          
          <Text style={styles.versionText}>Version 1.0.0</Text>
        </ScrollView>
      </FadeInView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.dark.background,
  },
  scrollContent: {
    padding: 20,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: Colors.dark.text,
    marginBottom: 24,
  },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 32,
    gap: 16,
  },
  avatarContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 2,
    borderColor: Colors.dark.primary,
    padding: 2,
  },
  avatar: {
    width: '100%',
    height: '100%',
    borderRadius: 40,
  },
  profileInfo: {
    justifyContent: 'center',
  },
  userName: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.dark.text,
  },
  userEmail: {
    fontSize: 14,
    color: Colors.dark.textSecondary,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.dark.textSecondary,
    marginBottom: 16,
    textTransform: 'uppercase',
  },
  vehicleCard: {
    backgroundColor: Colors.dark.card,
    borderRadius: 24,
    overflow: 'hidden',
    height: 160,
  },
  vehicleImage: {
    width: '100%',
    height: 100,
  },
  vehicleInfo: {
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  vehicleName: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.dark.text,
  },
  vehiclePlate: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.dark.textSecondary,
    backgroundColor: Colors.dark.cardHighlight,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    overflow: 'hidden', // iOS fix for borderRadius on Text
  },
  menuGroup: {
    backgroundColor: Colors.dark.card,
    borderRadius: 24,
    overflow: 'hidden',
    marginBottom: 32,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.dark.border,
  },
  menuIconBox: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.dark.cardHighlight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  menuText: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
    color: Colors.dark.text,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: 16,
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderRadius: 20,
    marginBottom: 32,
  },
  logoutText: {
    color: Colors.dark.error,
    fontSize: 16,
    fontWeight: '600',
  },
  versionText: {
    textAlign: 'center',
    color: Colors.dark.textSecondary,
    fontSize: 12,
  },
});
