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
        <View style={styles.contentRow}>
            {/* QR Code Section - Left */}
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
            </View>

            {/* Info Section - Right */}
            <View style={styles.infoContainer}>
            <View>
                <Text style={styles.label}>HNS Rewards</Text>
                <Text style={styles.userName} numberOfLines={1} adjustsFontSizeToFit>{userName}</Text>
                <View style={styles.pointsBadge}>
                    <Award size={14} color={Colors.dark.primary} />
                    <Text style={styles.pointsText}>{points.toLocaleString()} pts</Text>
                </View>
            </View>

            <View style={styles.footer}>
                <Text style={styles.memberLabel}>Member Since</Text>
                <Text style={styles.memberValue}>{memberSince}</Text>
            </View>
            </View>
        </View>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 24,
    overflow: 'hidden',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  gradient: {
    padding: 20,
  },
  contentRow: {
    flexDirection: 'row',
    gap: 20,
    alignItems: 'center',
  },
  qrContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  qrWrapper: {
    width: 120, // Slightly smaller container but fuller image
    height: 120,
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 6, // Reduced padding significantly
    alignItems: 'center',
    justifyContent: 'center',
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
  infoContainer: {
    flex: 1,
    height: 120, // Match QR height
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  label: {
    fontSize: 10,
    color: Colors.dark.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 4,
  },
  userName: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.dark.text,
    marginBottom: 8,
  },
  pointsBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(223, 255, 0, 0.1)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    gap: 6,
    alignSelf: 'flex-start',
  },
  pointsText: {
    color: Colors.dark.primary,
    fontWeight: '700',
    fontSize: 12,
  },
  footer: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
    paddingTop: 8,
    marginTop: 8,
  },
  memberLabel: {
    color: Colors.dark.textSecondary,
    fontSize: 10,
  },
  memberValue: {
    color: Colors.dark.text,
    fontWeight: '600',
    fontSize: 12,
  },
});
