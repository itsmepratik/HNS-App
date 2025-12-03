import Colors from '@/constants/colors';
import { LinearGradient } from 'expo-linear-gradient';
import { Award, QrCode } from 'lucide-react-native';
import React from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';

interface LoyaltyCardProps {
  userName: string;
  points: number;
  memberSince: string;
  qrCodeSource?: any; // Allow passing custom source
}

export function LoyaltyCard({
  userName,
  points,
  memberSince,
  qrCodeSource,
}: LoyaltyCardProps) {
  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[Colors.dark.card, '#2A2A2A']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.label}>HNS Rewards</Text>
            <Text style={styles.userName}>{userName}</Text>
          </View>
          <View style={styles.pointsBadge}>
            <Award size={16} color={Colors.dark.primary} />
            <Text style={styles.pointsText}>{points.toLocaleString()} pts</Text>
          </View>
        </View>

        {/* QR Code Section */}
        <View style={styles.qrContainer}>
          <View style={styles.qrWrapper}>
            {qrCodeSource ? (
              <Image 
                source={qrCodeSource} 
                style={styles.qrImage} 
                resizeMode="contain"
              />
            ) : (
              <View style={styles.qrPlaceholder}>
                <QrCode size={64} color={Colors.dark.text} />
              </View>
            )}
          </View>
          <Text style={styles.scanText}>Scan to earn points</Text>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.memberLabel}>Member Since</Text>
          <Text style={styles.memberValue}>{memberSince}</Text>
        </View>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 24,
    overflow: 'hidden',
    marginBottom: 32,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  gradient: {
    padding: 24,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 24,
  },
  label: {
    fontSize: 12,
    color: Colors.dark.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 4,
  },
  userName: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.dark.text,
  },
  pointsBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(223, 255, 0, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    gap: 6,
  },
  pointsText: {
    color: Colors.dark.primary,
    fontWeight: '700',
    fontSize: 14,
  },
  qrContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  qrWrapper: {
    width: 160,
    height: 160,
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  qrImage: {
    width: '100%',
    height: '100%',
  },
  qrPlaceholder: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scanText: {
    color: Colors.dark.textSecondary,
    fontSize: 12,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
    paddingTop: 16,
  },
  memberLabel: {
    color: Colors.dark.textSecondary,
    fontSize: 12,
  },
  memberValue: {
    color: Colors.dark.text,
    fontWeight: '600',
    fontSize: 14,
  },
});
