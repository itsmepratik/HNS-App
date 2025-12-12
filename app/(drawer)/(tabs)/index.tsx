import { FadeInView } from '@/components/FadeInView';
import { HamburgerMenu } from '@/components/HamburgerMenu';
import { OilMaintenanceCard } from '@/components/OilMaintenanceCard';
import Colors from '@/constants/colors';
import { useUser } from '@clerk/clerk-expo';
import { useRouter } from 'expo-router';
import { ArrowRight, Calendar, Settings, Thermometer, Wind, Wrench, Zap } from 'lucide-react-native';
import React from 'react';
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function HomeScreen() {
  const router = useRouter();
  const { user } = useUser();

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <FadeInView style={{ flex: 1 }}>
        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          overScrollMode="never" // Optional: helps with "smooth" feel on Android sometimes, or standard
        >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <HamburgerMenu />
            <View>
              <Text style={styles.greeting}>Good Day,</Text>
              <Text style={styles.userName}>{user?.fullName || 'Driver'}</Text>
            </View>
          </View>
          <View style={styles.notificationBadge}>
            <View style={styles.notificationDot} />
            <Pressable style={styles.profileButton} onPress={() => router.push('/(tabs)/profile')}>
               <Image 
                source={{ uri: user?.imageUrl }} 
                style={styles.avatar}
              />
            </Pressable>
          </View>
        </View>

        {/* Vehicle Status Card (Hidden) */}
        {false && (
          <>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Vehicle Status</Text>
              <Text style={styles.vehicleName}>Tesla Model 3</Text>
            </View>

            <View style={styles.statsGrid}>
              <View style={styles.statCard}>
                <View style={styles.statHeader}>
                  <View style={[styles.statusDot, { backgroundColor: Colors.dark.success }]} />
                  <Settings size={20} color={Colors.dark.textSecondary} />
                </View>
                <Text style={styles.statValue}>90<Text style={styles.percent}>%</Text></Text>
                <Text style={styles.statLabel}>Rear Brakes</Text>
              </View>
              
              <View style={styles.statCard}>
                <View style={styles.statHeader}>
                  <View style={[styles.statusDot, { backgroundColor: Colors.dark.success }]} />
                  <Wind size={20} color={Colors.dark.textSecondary} />
                </View>
                <Text style={styles.statValue}>75<Text style={styles.percent}>%</Text></Text>
                <Text style={styles.statLabel}>Air Filter</Text>
              </View>

              <View style={styles.statCard}>
                <View style={styles.statHeader}>
                  <View style={[styles.statusDot, { backgroundColor: Colors.dark.success }]} />
                  <Thermometer size={20} color={Colors.dark.textSecondary} />
                </View>
                <Text style={styles.statValue}>83<Text style={styles.percent}>%</Text></Text>
                <Text style={styles.statLabel}>Cabin Filter</Text>
              </View>

              <View style={styles.statCard}>
                <View style={styles.statHeader}>
                  <View style={[styles.statusDot, { backgroundColor: '#EAB308' }]} />
                  <Zap size={20} color={Colors.dark.textSecondary} />
                </View>
                <Text style={styles.statValue}>47<Text style={styles.percent}>%</Text></Text>
                <Text style={styles.statLabel}>Power Steering</Text>
              </View>
            </View>
          </>
        )}

        {/* Oil Maintenance Card */}
        <OilMaintenanceCard 
          currentOdo={45230}
          lastServiceOdo={42230}
          serviceInterval={8000}
          lastServiceDate="Oct 12, 2024"
          oilType="Synthetic 5W-30"
        />

        {/* Action Banner */}
        <Pressable style={styles.actionBanner} onPress={() => router.push('/book-service')}>
          <View style={styles.actionContent}>
            <Text style={styles.actionTitle}>Service Due Soon</Text>
            <Text style={styles.actionSubtitle}>Power Steering check recommended</Text>
            <View style={styles.bookButton}>
              <Text style={styles.bookButtonText}>Book Now</Text>
            </View>
          </View>
          <Image 
            source={{ uri: 'https://images.unsplash.com/photo-1487754180451-c456f719a1fc?q=80&w=800&auto=format&fit=crop' }} 
            style={styles.actionImage}
          />
        </Pressable>

        {/* Quick Actions */}
        <View style={styles.quickActions}>
          <Pressable style={styles.actionButton} onPress={() => router.push('/book-service')}>
            <View style={styles.actionIcon}>
              <Calendar size={24} color={Colors.dark.primary} />
            </View>
            <Text style={styles.actionLabel}>Book Service</Text>
          </Pressable>
          <Pressable style={styles.actionButton}>
             <View style={styles.actionIcon}>
              <Wrench size={24} color={Colors.dark.primary} />
            </View>
            <Text style={styles.actionLabel}>Roadside</Text>
          </Pressable>
          <Pressable style={styles.actionButton} onPress={() => router.push('/(tabs)/loyalty')}>
             <View style={styles.actionIcon}>
              <ArrowRight size={24} color={Colors.dark.primary} />
            </View>
            <Text style={styles.actionLabel}>Rewards</Text>
          </Pressable>
        </View>

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
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 32,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  greeting: {
    fontSize: 14,
    color: Colors.dark.textSecondary,
    marginBottom: 4,
  },
  userName: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.dark.text,
  },
  notificationBadge: {
    position: 'relative',
  },
  profileButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: Colors.dark.border,
    padding: 2,
  },
  avatar: {
    width: '100%',
    height: '100%',
    borderRadius: 24,
  },
  notificationDot: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: Colors.dark.primary,
    zIndex: 1,
    borderWidth: 2,
    borderColor: Colors.dark.background,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.dark.text,
  },
  vehicleName: {
    fontSize: 14,
    color: Colors.dark.textSecondary,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 32,
  },
  statCard: {
    width: '48%', // Approx half
    backgroundColor: Colors.dark.card,
    borderRadius: 24,
    padding: 20,
    height: 140,
    justifyContent: 'space-between',
  },
  statHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statValue: {
    fontSize: 32,
    fontWeight: '600',
    color: Colors.dark.text,
  },
  percent: {
    fontSize: 16,
    fontWeight: '400',
    color: Colors.dark.textSecondary,
  },
  statLabel: {
    color: Colors.dark.textSecondary,
    fontSize: 14,
  },
  actionBanner: {
    backgroundColor: Colors.dark.cardHighlight,
    borderRadius: 24,
    flexDirection: 'row',
    overflow: 'hidden',
    height: 140,
    marginBottom: 32,
  },
  actionContent: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    zIndex: 1,
  },
  actionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.dark.text,
    marginBottom: 4,
  },
  actionSubtitle: {
    fontSize: 12,
    color: Colors.dark.textSecondary,
    marginBottom: 16,
  },
  bookButton: {
    backgroundColor: Colors.dark.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  bookButtonText: {
    color: Colors.dark.primaryForeground,
    fontWeight: '600',
    fontSize: 12,
  },
  actionImage: {
    width: 140,
    height: '100%',
    position: 'absolute',
    right: 0,
    opacity: 0.6,
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    backgroundColor: Colors.dark.card,
    borderRadius: 20,
    padding: 16,
    alignItems: 'center',
    gap: 8,
  },
  actionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(223, 255, 0, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionLabel: {
    color: Colors.dark.text,
    fontWeight: '500',
    fontSize: 12,
  },
});
