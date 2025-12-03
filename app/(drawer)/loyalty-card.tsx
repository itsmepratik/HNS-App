import { FadeInView } from '@/components/FadeInView';
import { LoyaltyCard } from '@/components/LoyaltyCard';
import Colors from '@/constants/colors';
import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function LoyaltyCardScreen() {
  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <FadeInView style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <Text style={styles.headerTitle}>My Loyalty Card</Text>
          <Text style={styles.subtitle}>Scan this code at checkout to earn points</Text>

          <View style={styles.cardContainer}>
            <LoyaltyCard 
              userName="Pratik Chakraborty"
              points={2450}
              memberSince="Oct 2023"
              qrCodeSource={require('@/assets/images/loyalty-qr.png')}
            />
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
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: Colors.dark.text,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.dark.textSecondary,
    marginBottom: 32,
  },
  cardContainer: {
    alignItems: 'center',
  },
});
