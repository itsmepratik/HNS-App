import CustomDialog from '@/components/CustomDialog';
import { FadeInView } from '@/components/FadeInView';
import { HamburgerMenu } from '@/components/HamburgerMenu';
import Colors from '@/constants/colors';
import { Gift, Star } from 'lucide-react-native';
import React, { useState } from 'react';
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const REWARDS = [
  {
    id: '1',
    title: 'Free Oil Change',
    points: 5000,
    image: 'https://images.unsplash.com/photo-1626244407335-502447990159?q=80&w=800&auto=format&fit=crop',
  },
  {
    id: '2',
    title: '$20 Off Any Service',
    points: 2000,
    image: 'https://images.unsplash.com/photo-1632823471441-2b04f1437199?q=80&w=800&auto=format&fit=crop',
  },
  {
    id: '3',
    title: 'Premium Car Wash',
    points: 1500,
    image: 'https://images.unsplash.com/photo-1601362840469-51e4d8d58785?q=80&w=800&auto=format&fit=crop',
  },
];

export default function LoyaltyScreen() {
  const [points, setPoints] = useState(2450);
  const [selectedReward, setSelectedReward] = useState<typeof REWARDS[0] | null>(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [showErrorDialog, setShowErrorDialog] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleRedeemPress = (reward: typeof REWARDS[0]) => {
    if (points < reward.points) {
      setErrorMessage(`You need ${reward.points - points} more points to redeem this reward.`);
      setShowErrorDialog(true);
      return;
    }
    setSelectedReward(reward);
    setShowConfirmDialog(true);
  };

  const confirmRedeem = () => {
    if (selectedReward) {
      setPoints(prev => prev - selectedReward.points);
      setShowConfirmDialog(false);
      setShowSuccessDialog(true);
    }
  };

  const progressToNextTier = Math.min(points / 3000, 1); // Assuming 3000 for next tier for demo logic

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <FadeInView style={{ flex: 1 }}>
        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          overScrollMode="never"
        >
          <View style={styles.header}>
            <HamburgerMenu />
            <Text style={styles.headerTitle}>Loyalty Program</Text>
          </View>
          
          <View style={styles.pointsCard}>
            <View style={styles.pointsHeader}>
              <View>
                <Text style={styles.pointsLabel}>Available Points</Text>
                <Text style={styles.pointsValue}>{points.toLocaleString()}</Text>
              </View>
              <View style={styles.tierBadge}>
                <Star size={12} color="#000" fill="#000" />
                <Text style={styles.tierText}>Gold Member</Text>
              </View>
            </View>
            
            <View style={styles.progressBarBg}>
              <View style={[styles.progressBarFill, { width: `${(points / 3000) * 100}%` }]} />
            </View>
            <Text style={styles.progressText}>{Math.max(3000 - points, 0)} points to Platinum Tier</Text>
          </View>

          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Redeem Rewards</Text>
          </View>

          <View style={styles.rewardsList}>
            {REWARDS.map((reward) => (
              <Pressable 
                key={reward.id} 
                style={[styles.rewardCard, points < reward.points && styles.rewardCardDisabled]}
                onPress={() => handleRedeemPress(reward)}
              >
                <Image source={{ uri: reward.image }} style={[styles.rewardImage, points < reward.points && styles.rewardImageDisabled]} />
                <View style={styles.rewardContent}>
                  <Text style={[styles.rewardTitle, points < reward.points && styles.textDisabled]}>{reward.title}</Text>
                  <View style={styles.pointsTag}>
                    <Gift size={12} color={points < reward.points ? Colors.dark.textSecondary : Colors.dark.primary} />
                    <Text style={[styles.pointsTagText, points < reward.points && styles.textDisabled]}>{reward.points} pts</Text>
                  </View>
                </View>
                <View style={[styles.redeemButton, points < reward.points && styles.redeemButtonDisabled]}>
                  <Text style={[styles.redeemText, points < reward.points && styles.textDisabled]}>Redeem</Text>
                </View>
              </Pressable>
            ))}
          </View>
        </ScrollView>
      </FadeInView>

      <CustomDialog
        visible={showConfirmDialog}
        title="Redeem Reward"
        message={`Are you sure you want to redeem "${selectedReward?.title}" for ${selectedReward?.points} points?`}
        type="info"
        actions={[
          {
            text: 'Cancel',
            onPress: () => setShowConfirmDialog(false),
            style: 'cancel',
          },
          {
            text: 'Redeem',
            onPress: confirmRedeem,
            style: 'default',
          },
        ]}
      />

      <CustomDialog
        visible={showSuccessDialog}
        title="Success!"
        message={`You have redeemed "${selectedReward?.title}". Check your email for the voucher.`}
        type="success"
        actions={[
          {
            text: 'OK',
            onPress: () => setShowSuccessDialog(false),
            style: 'default',
          },
        ]}
      />

      <CustomDialog
        visible={showErrorDialog}
        title="Insufficient Points"
        message={errorMessage}
        type="error"
        actions={[
          {
            text: 'OK',
            onPress: () => setShowErrorDialog(false),
            style: 'cancel',
          },
        ]}
      />
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
    alignItems: 'center',
    gap: 16,
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: Colors.dark.text,
  },
  pointsCard: {
    backgroundColor: Colors.dark.cardHighlight,
    borderRadius: 24,
    padding: 24,
    marginBottom: 32,
    borderWidth: 1,
    borderColor: Colors.dark.border,
  },
  pointsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 24,
  },
  pointsLabel: {
    color: Colors.dark.textSecondary,
    fontSize: 14,
    marginBottom: 4,
  },
  pointsValue: {
    color: Colors.dark.primary,
    fontSize: 42,
    fontWeight: '800',
  },
  tierBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.dark.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 4,
  },
  tierText: {
    color: Colors.dark.background,
    fontWeight: '700',
    fontSize: 12,
  },
  progressBarBg: {
    height: 8,
    backgroundColor: Colors.dark.background,
    borderRadius: 4,
    marginBottom: 12,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: Colors.dark.primary,
    borderRadius: 4,
  },
  progressText: {
    color: Colors.dark.textSecondary,
    fontSize: 12,
  },
  sectionHeader: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: Colors.dark.text,
  },
  rewardsList: {
    gap: 16,
  },
  rewardCard: {
    flexDirection: 'row',
    backgroundColor: Colors.dark.card,
    borderRadius: 20,
    padding: 12,
    alignItems: 'center',
    gap: 16,
  },
  rewardCardDisabled: {
    opacity: 0.5,
  },
  rewardImage: {
    width: 64,
    height: 64,
    borderRadius: 12,
    backgroundColor: Colors.dark.cardHighlight,
  },
  rewardImageDisabled: {
    opacity: 0.5,
  },
  rewardContent: {
    flex: 1,
    gap: 8,
  },
  rewardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.dark.text,
  },
  pointsTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  pointsTagText: {
    color: Colors.dark.primary,
    fontWeight: '700',
    fontSize: 12,
  },
  redeemButton: {
    backgroundColor: Colors.dark.cardHighlight,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
  },
  redeemButtonDisabled: {
    backgroundColor: Colors.dark.card,
    borderWidth: 1,
    borderColor: Colors.dark.border,
  },
  redeemText: {
    color: Colors.dark.text,
    fontWeight: '600',
    fontSize: 12,
  },
  textDisabled: {
    color: Colors.dark.textSecondary,
  },
});
